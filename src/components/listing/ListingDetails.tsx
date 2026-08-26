'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AmenityIcon,
  CalendarBadgeIcon,
  CloseIcon,
  KeyIcon,
  MedalIcon,
  PinIcon,
  TranslateIcon,
} from '@/components/icons/Icons';
import { DatePicker } from '@/components/listing/DatePicker';
import { useAvailabilityQuery } from '@/hooks/useListingQuery';
import { useFocusTrap, useLockBodyScroll } from '@/hooks/useFocusTrap';
import { formatRating } from '@/lib/utils';
import type { DateRange, Listing } from '@/types/listing';

interface ListingDetailsProps {
  listing: Listing;
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
}

const HIGHLIGHT_ICONS = {
  checkin: KeyIcon,
  superhost: MedalIcon,
  location: PinIcon,
  cancellation: CalendarBadgeIcon,
} as const;

export function ListingDetails({ listing, range, onRangeChange }: ListingDetailsProps) {
  const [more, setMore] = useState(false);
  const [amenityOpen, setAmenityOpen] = useState(false);
  const featured = listing.amenities.filter((a) => a.featured);

  // Shares a query key with the booking card, so React Query serves both from
  // one request rather than fetching the calendar twice.
  const { data: availability } = useAvailabilityQuery(listing.id);
  const unavailable = useMemo(
    () => new Set(availability?.unavailable ?? []),
    [availability],
  );

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between border-b border-hairline pb-6">
        <div>
          <h2 className="text-[22px] font-semibold leading-7">
            {listing.propertyType} hosted by {listing.host.name}
          </h2>
          <p className="mt-1 text-base">
            {listing.guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.baths} baths
          </p>
        </div>
        <div className="relative h-14 w-14">
          <div className="relative h-14 w-14 overflow-hidden rounded-full">
            <Image src={listing.host.avatarSrc} alt={listing.host.name} fill sizes="56px" className="object-cover" />
          </div>
          {listing.host.isSuperhost ? (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rausch text-[10px] text-white">
              ★
            </span>
          ) : null}
        </div>
      </div>

      {listing.isGuestFavorite ? (
        <div className="flex items-center justify-between gap-8 border-b border-hairline py-8">
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 32 32" className="h-10 w-10" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8.2 4.5c2.8 2.2 4.6 5.7 4.6 9.6 0 4.6-2.5 8.1-5.8 11.2 3.7-1.2 6.5-4.6 6.5-8.7 0-3.4-1.9-6.4-4.6-8.4 1.6-.9 3.3-1.6 5.1-2C11.4 3.7 9.7 4 8.2 4.5Zm15.6 0c-1.5-.5-3.2-.8-5.8.7 1.8.4 3.5 1.1 5.1 2-2.7 2-4.6 5-4.6 8.4 0 4.1 2.8 7.5 6.5 8.7-3.3-3.1-5.8-6.6-5.8-11.2 0-3.9 1.8-7.4 4.6-9.6Z"
              />
            </svg>
            <div>
              <p className="text-lg font-semibold">Guest favorite</p>
              <p className="max-w-[240px] text-sm text-mute">
                One of the most loved homes on Airbnb, according to guests
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-lg font-semibold">{formatRating(listing.rating)}</p>
              <p className="text-[12px] underline">★★★★★</p>
            </div>
            <span className="h-8 w-px bg-hairline" />
            <div>
              <p className="text-lg font-semibold">{listing.reviewCount}</p>
              <a href="#reviews" className="text-[12px] font-semibold underline airbnb-underline">
                Reviews
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <ul className="space-y-6 border-b border-hairline py-8">
        {listing.highlights.map((h) => {
          const Icon = HIGHLIGHT_ICONS[h.icon];
          return (
            <li key={h.id} className="flex gap-4">
              <Icon className="mt-0.5 h-6 w-6 shrink-0" />
              <div>
                <p className="font-semibold">{h.title}</p>
                <p className="text-sm text-mute">{h.body}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="border-b border-hairline py-8">
        <button
          type="button"
          className="mb-4 flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-canvas"
        >
          <TranslateIcon className="h-4 w-4" />
          Translate
        </button>
        <p className="whitespace-pre-line text-[16px] leading-6">{listing.description}</p>
        {more ? <p className="mt-4 whitespace-pre-line text-[16px] leading-6">{listing.descriptionExtra}</p> : null}
        <button
          type="button"
          className="mt-4 text-base font-semibold underline airbnb-underline"
          onClick={() => setMore((v) => !v)}
        >
          {more ? 'Show less' : 'Show more'}
        </button>
      </div>

      <section className="border-b border-hairline py-12">
        <h2 className="text-[22px] font-semibold leading-7">What this place offers</h2>
        <ul className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4">
          {featured.map((a) => (
            <li key={a.id} className="flex items-center gap-4 text-base">
              <AmenityIcon name={a.icon} />
              {a.label}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setAmenityOpen(true)}
          className="mt-8 rounded-lg border border-hof px-6 py-3 text-base font-semibold hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
        >
          Show all {listing.amenities.length} amenities
        </button>
      </section>

      <DatePicker
        checkIn={range.checkIn}
        checkOut={range.checkOut}
        unavailable={unavailable}
        onChange={(checkIn, checkOut) => onRangeChange({ checkIn, checkOut })}
      />

      <AmenitiesModal
        open={amenityOpen}
        amenities={listing.amenities}
        onClose={() => setAmenityOpen(false)}
      />
    </div>
  );
}

function AmenitiesModal({
  open,
  amenities,
  onClose,
}: {
  open: boolean;
  amenities: Listing['amenities'];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(open, ref);
  useLockBodyScroll(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="amenity-title"
        tabIndex={-1}
        className="max-h-[80vh] w-[780px] overflow-y-auto rounded-xl bg-white p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close amenities"
          className="mb-6 flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
        <h2 id="amenity-title" className="text-[22px] font-semibold">
          What this place offers
        </h2>
        <ul className="mt-6 divide-y divide-hairline">
          {amenities.map((a) => (
            <li key={a.id} className="flex items-center gap-4 py-5 text-base">
              <AmenityIcon name={a.icon} />
              {a.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
