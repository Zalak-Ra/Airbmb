'use client';

import { HeartIcon, ShareIcon, StarIcon } from '@/components/icons/Icons';
import { formatRating } from '@/lib/utils';
import type { Listing } from '@/types/listing';

interface TitleRowProps {
  listing: Listing;
  onShare: () => void;
  onSave: () => void;
}

export function TitleRow({ listing, onShare, onSave }: TitleRowProps) {
  return (
    <div className="mb-6 pt-6">
      <h1 className="text-[26px] font-semibold leading-[30px] tracking-tight">{listing.title}</h1>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-1 text-sm">
          <StarIcon className="h-3 w-3" />
          <span className="font-semibold">{formatRating(listing.rating)}</span>
          <span>·</span>
          <a href="#reviews" className="font-semibold underline airbnb-underline">
            {listing.reviewCount} reviews
          </a>
          {listing.isSuperhost ? (
            <>
              <span>·</span>
              <span>Superhost</span>
            </>
          ) : null}
          <span>·</span>
          <a href="#location" className="font-semibold underline airbnb-underline">
            {listing.locationLabel}
          </a>
        </div>
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
            onClick={onSave}
            aria-pressed={listing.saved}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold underline airbnb-underline hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
          >
            <HeartIcon className={listing.saved ? 'h-4 w-4 text-hof' : 'h-4 w-4'} filled={listing.saved} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
