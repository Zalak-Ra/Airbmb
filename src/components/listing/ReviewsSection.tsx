'use client';

import Image from 'next/image';
import { StarIcon } from '@/components/icons/Icons';
import { useReviewsQuery } from '@/hooks/useListingQuery';
import { formatRating } from '@/lib/utils';
import type { Listing, RatingBreakdown } from '@/types/listing';

interface ReviewsSectionProps {
  listing: Listing;
}

const BREAKDOWN: { key: keyof RatingBreakdown; label: string }[] = [
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'checkIn', label: 'Check-in' },
  { key: 'communication', label: 'Communication' },
  { key: 'location', label: 'Location' },
  { key: 'value', label: 'Value' },
];

/**
 * Below-fold reviews. Loaded via next/dynamic from ListingPage so the hero
 * JS bundle does not pay for avatar decoding + breakdown bars on first paint.
 */
export function ReviewsSection({ listing }: ReviewsSectionProps) {
  const { data: reviews, isLoading } = useReviewsQuery(listing.id, true);

  return (
    <section id="reviews" className="border-t border-hairline py-12">
      <h2 className="flex items-center gap-2 text-[22px] font-semibold leading-7">
        <StarIcon className="h-5 w-5" />
        {formatRating(listing.rating)} · {listing.reviewCount} reviews
        {listing.isGuestFavorite ? (
          <span className="ml-3 rounded-full border border-line px-3 py-1 text-sm font-semibold">Guest favorite</span>
        ) : null}
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-x-16 gap-y-3">
        {BREAKDOWN.map((row) => (
          <div key={row.key} className="flex items-center gap-4 text-sm">
            <span className="w-36">{row.label}</span>
            <span className="relative h-[4px] flex-1 overflow-hidden rounded-full bg-hairline">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-hof"
                style={{ width: `${(listing.breakdown[row.key] / 5) * 100}%` }}
              />
            </span>
            <span className="w-8 text-right font-semibold">{listing.breakdown[row.key].toFixed(1)}</span>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-10 grid grid-cols-2 gap-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-x-16 gap-y-10">
          {(reviews ?? []).map((review) => (
            <li key={review.id}>
              <div className="flex items-center gap-3">
                <span className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image src={review.avatarSrc} alt="" fill sizes="48px" className="object-cover" />
                </span>
                <div>
                  <p className="font-semibold">{review.author}</p>
                  <p className="text-sm text-mute">{review.yearsOnAirbnb} years on Airbnb</p>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1 text-sm font-semibold">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <StarIcon key={i} className="h-2.5 w-2.5" />
                ))}
                <span className="ml-1 font-normal text-mute">
                  · {review.dateLabel} · {review.stayLabel}
                </span>
              </p>
              <p className="mt-2 text-[16px] leading-6">{review.text}</p>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="mt-10 rounded-lg border border-hof px-6 py-3 text-base font-semibold hover:bg-canvas"
      >
        Show all {listing.reviewCount} reviews
      </button>
    </section>
  );
}
