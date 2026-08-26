'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, HeartIcon, ShareIcon } from '@/components/icons/Icons';
import { useFocusTrap, useLockBodyScroll } from '@/hooks/useFocusTrap';
import { usePrefetchAdjacentImages } from '@/hooks/usePrefetchAdjacentImages';
import type { ListingPhoto } from '@/types/listing';

interface LightboxProps {
  open: boolean;
  photos: readonly ListingPhoto[];
  index: number;
  saved: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  onToggleSave: () => void;
  onShare: () => void;
}

const EASE = [0.2, 0, 0, 1] as const;

/**
 * Single-photo viewer (Airbnb's 2024 white lightbox).
 *
 * Keyboard: Escape closes, ←/→ wrap. Adjacent images are decoded ahead of
 * the keypress so the crossfade never waits on the network.
 */
export function Lightbox({
  open,
  photos,
  index,
  saved,
  onClose,
  onIndexChange,
  onToggleSave,
  onShare,
}: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, dialogRef);
  useLockBodyScroll(open);

  const urls = photos.map((p) => p.src);
  usePrefetchAdjacentImages(urls, index);

  const go = useCallback(
    (delta: number) => {
      if (photos.length === 0) return;
      const next = (index + delta + photos.length) % photos.length;
      onIndexChange(next);
    },
    [index, onIndexChange, photos.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') go(-1);
      if (event.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, go]);

  const photo = photos[index];

  return (
    <AnimatePresence>
      {open && photo ? (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-status"
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="fixed inset-0 z-[60] flex flex-col bg-white"
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-6">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
            >
              <CloseIcon className="h-3.5 w-3.5" />
              Close
            </button>
            <p id="lightbox-status" className="text-sm font-semibold tabular-nums" aria-live="polite">
              {index + 1} / {photos.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onShare}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold underline airbnb-underline hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
              >
                <ShareIcon className="h-4 w-4" />
                Share
              </button>
              <button
                type="button"
                onClick={onToggleSave}
                aria-pressed={saved}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold underline airbnb-underline hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
              >
                <HeartIcon className="h-4 w-4" filled={saved} />
                Save
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-24 pb-10">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-6 flex h-12 w-12 items-center justify-center rounded-full border border-hof bg-white hover:scale-105 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.01 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="relative h-full w-full max-w-[1100px]"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  priority
                  sizes="1100px"
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-6 flex h-12 w-12 items-center justify-center rounded-full border border-hof bg-white hover:scale-105 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="sr-only">{photo.caption}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
