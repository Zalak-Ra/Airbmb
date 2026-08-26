'use client';

import Image from 'next/image';
import { GridDotsIcon } from '@/components/icons/Icons';
import type { ListingPhoto } from '@/types/listing';

interface PhotoGridProps {
  photos: readonly ListingPhoto[];
  onShowAll: () => void;
  onOpenPhoto: (index: number) => void;
}

/**
 * Five-up mosaic: hero occupies the left half; four supporting frames tile
 * the right. Gap is 8px (Airbnb's current listing mosaic). Radius lives on
 * the wrapper so interior tiles stay square while the composition reads as
 * one photograph.
 */
export function PhotoGrid({ photos, onShowAll, onOpenPhoto }: PhotoGridProps) {
  const hero = photos[0];
  const rest = photos.slice(1, 5);
  if (!hero) return null;

  return (
    <div className="relative h-[400px] overflow-hidden rounded-xl">
      <div className="grid h-full grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onOpenPhoto(0)}
          aria-label={hero.alt}
          className="relative overflow-hidden focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
        >
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            priority
            sizes="(min-width: 1120px) 560px, 50vw"
            className="photo-dim object-cover"
          />
        </button>
        <div className="grid h-full grid-cols-2 grid-rows-2 gap-2">
          {rest.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onOpenPhoto(i + 1)}
              aria-label={photo.alt}
              className="relative overflow-hidden focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1120px) 280px, 25vw"
                className="photo-dim object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onShowAll}
        className="absolute bottom-6 right-6 flex items-center gap-2 rounded-lg border border-hof bg-white px-4 py-[7px] text-sm font-semibold shadow-sm hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
      >
        <GridDotsIcon className="h-4 w-4" />
        Show all photos
      </button>
    </div>
  );
}
