'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CloseIcon } from '@/components/icons/Icons';
import { useFocusTrap, useLockBodyScroll } from '@/hooks/useFocusTrap';
import { photoCategoryLabel } from '@/lib/utils';
import type { Listing, ListingPhoto, PhotoCategory } from '@/types/listing';

interface PhotoTourProps {
  open: boolean;
  listing: Listing;
  onClose: () => void;
  onSelectPhoto: (index: number) => void;
}

const EASE = [0.2, 0, 0, 1] as const;

/**
 * Full-screen photo tour (Airbnb's "Show all photos" surface).
 *
 * Why a left rail: guests scan by room type. Filtering client-side avoids a
 * second network hop — photos are already in the listing payload.
 * Images below the first row use native lazy loading via next/image so the
 * overlay's first paint stays cheap.
 */
export function PhotoTour({ open, listing, onClose, onSelectPhoto }: PhotoTourProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<'all' | PhotoCategory>('all');
  useFocusTrap(open, dialogRef);
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const categories = useMemo(() => {
    const seen = new Set<PhotoCategory>();
    for (const photo of listing.photos) seen.add(photo.category);
    return Array.from(seen);
  }, [listing.photos]);

  const visible: readonly ListingPhoto[] =
    active === 'all' ? listing.photos : listing.photos.filter((p) => p.category === active);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-tour-title"
          tabIndex={-1}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="fixed inset-0 z-50 overflow-y-auto bg-white"
        >
          <div className="sticky top-0 z-10 flex h-16 items-center justify-between bg-white px-6">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close photo tour"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
            <h2 id="photo-tour-title" className="text-[16px] font-semibold">
              Photo tour
            </h2>
            <span className="w-8" />
          </div>

          <div className="mx-auto flex max-w-[1280px] gap-12 px-20 pb-24 pt-4">
            <nav aria-label="Photo categories" className="sticky top-24 w-[210px] shrink-0 self-start">
              <ul className="space-y-1">
                <li>
                  <CategoryButton
                    label="All"
                    selected={active === 'all'}
                    count={listing.photos.length}
                    onClick={() => setActive('all')}
                  />
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <CategoryButton
                      label={photoCategoryLabel(cat)}
                      selected={active === cat}
                      count={listing.photos.filter((p) => p.category === cat).length}
                      onClick={() => setActive(cat)}
                    />
                  </li>
                ))}
              </ul>
            </nav>

            <div className="min-w-0 flex-1">
              <h3 className="mb-6 text-[22px] font-semibold leading-7">
                {active === 'all' ? 'All photos' : photoCategoryLabel(active)}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {visible.map((photo, i) => {
                  const index = listing.photos.findIndex((p) => p.id === photo.id);
                  const featured = active === 'all' && i === 0;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => onSelectPhoto(index)}
                      className={`group relative overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof ${
                        featured ? 'col-span-2' : 'col-span-1'
                      }`}
                    >
                      <span className="relative block aspect-[3/2]">
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          sizes="(min-width: 1280px) 480px, 40vw"
                          loading="lazy"
                          className="object-cover transition-transform duration-300 ease-airbnb group-hover:scale-[1.02]"
                        />
                      </span>
                      <span className="mt-2 block text-left text-sm text-hof">{photo.caption}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function CategoryButton({
  label,
  selected,
  count,
  onClick,
}: {
  label: string;
  selected: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
        selected ? 'font-semibold underline decoration-2 underline-offset-4' : 'text-mute hover:bg-canvas'
      }`}
    >
      <span>{label}</span>
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
