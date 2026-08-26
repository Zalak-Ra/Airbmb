'use client';

import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDownIcon, FlagIcon, StarIcon } from '@/components/icons/Icons';
import { ApiRequestError } from '@/lib/api/client';
import { nightsInRange, toIsoDate } from '@/lib/pricing';
import { useAvailabilityQuery, useCreateBooking } from '@/hooks/useListingQuery';
import { formatMoney, formatRating, nightCount, quoteBooking } from '@/lib/utils';
import type { DateRange, GuestCounts, Listing } from '@/types/listing';

interface BookingCardProps {
  listing: Listing;
  range: DateRange;
  guests: GuestCounts;
  onRangeChange: (range: DateRange) => void;
  onGuestsChange: (guests: GuestCounts) => void;
}

export function BookingCard({ listing, range, guests, onRangeChange, onGuestsChange }: BookingCardProps) {
  const [openGuests, setOpenGuests] = useState(false);
  const guestRef = useRef<HTMLDivElement>(null);
  const quote = quoteBooking(listing, range);
  const nights = nightCount(range);
  const guestTotal = guests.adults + guests.children;

  const { data: availability } = useAvailabilityQuery(listing.id);
  const reserve = useCreateBooking(listing.id);

  /**
   * Client-side conflict detection is a courtesy, not a guarantee — the
   * transaction on the server is what actually prevents a double-sell. Doing
   * it here just spares the user a round trip to learn what the greyed-out
   * calendar already showed them.
   */
  const conflicts = useMemo(() => {
    if (!range.checkIn || !range.checkOut || !availability) return [];
    const taken = new Set(availability.unavailable);
    return nightsInRange(toIsoDate(range.checkIn), toIsoDate(range.checkOut)).filter((night) =>
      taken.has(night),
    );
  }, [range.checkIn, range.checkOut, availability]);

  const overCapacity = guestTotal > listing.guests;
  const canReserve = nights > 0 && conflicts.length === 0 && !overCapacity && !reserve.isPending;

  const submit = () => {
    if (!range.checkIn || !range.checkOut || !canReserve) return;
    reserve.mutate({
      checkIn: toIsoDate(range.checkIn),
      checkOut: toIsoDate(range.checkOut),
      guests,
    });
  };

  const failure =
    reserve.error instanceof ApiRequestError ? reserve.error : null;

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!guestRef.current?.contains(event.target as Node)) setOpenGuests(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <aside className="w-[372px] shrink-0">
      <div className="sticky top-[128px] rounded-xl border border-line p-6 shadow-card">
        <div className="flex items-baseline justify-between">
          <p className="text-[22px] font-semibold">
            {formatMoney(listing.nightPrice)}{' '}
            <span className="text-base font-normal">night</span>
          </p>
          <p className="flex items-center gap-1 text-sm">
            <StarIcon className="h-3 w-3" />
            <span className="font-semibold">{formatRating(listing.rating)}</span>
            <span className="text-mute">·</span>
            <a href="#reviews" className="text-mute underline airbnb-underline">
              {listing.reviewCount} reviews
            </a>
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-hof">
          <div className="grid grid-cols-2 border-b border-hof">
            <label className="border-r border-hof px-3 py-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider">Check-in</span>
              <input
                type="date"
                aria-label="Check-in date"
                className="w-full bg-transparent text-sm outline-none"
                value={range.checkIn ? format(range.checkIn, 'yyyy-MM-dd') : ''}
                onChange={(e) =>
                  onRangeChange({
                    ...range,
                    checkIn: e.target.value ? new Date(`${e.target.value}T00:00:00`) : null,
                  })
                }
              />
            </label>
            <label className="px-3 py-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider">Checkout</span>
              <input
                type="date"
                aria-label="Checkout date"
                className="w-full bg-transparent text-sm outline-none"
                value={range.checkOut ? format(range.checkOut, 'yyyy-MM-dd') : ''}
                onChange={(e) =>
                  onRangeChange({
                    ...range,
                    checkOut: e.target.value ? new Date(`${e.target.value}T00:00:00`) : null,
                  })
                }
              />
            </label>
          </div>
          <div className="relative" ref={guestRef}>
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2 text-left"
              aria-expanded={openGuests}
              onClick={() => setOpenGuests((v) => !v)}
            >
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-wider">Guests</span>
                <span className="text-sm">
                  {guestTotal} guest{guestTotal === 1 ? '' : 's'}
                  {guests.infants > 0 ? `, ${guests.infants} infant${guests.infants === 1 ? '' : 's'}` : ''}
                </span>
              </span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            {openGuests ? (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-line bg-white p-4 shadow-card">
                <Stepper
                  label="Adults"
                  hint="Age 13+"
                  value={guests.adults}
                  min={1}
                  onChange={(adults) => onGuestsChange({ ...guests, adults })}
                />
                <Stepper
                  label="Children"
                  hint="Ages 2–12"
                  value={guests.children}
                  min={0}
                  onChange={(children) => onGuestsChange({ ...guests, children })}
                />
                <Stepper
                  label="Infants"
                  hint="Under 2"
                  value={guests.infants}
                  min={0}
                  onChange={(infants) => onGuestsChange({ ...guests, infants })}
                />
                <Stepper
                  label="Pets"
                  hint="Bringing a service animal?"
                  value={guests.pets}
                  min={0}
                  onChange={(pets) => onGuestsChange({ ...guests, pets })}
                />
                <p className="mt-3 text-xs text-mute">
                  This place has a maximum of {listing.guests} guests, not including infants. Pets aren&apos;t allowed.
                </p>
                <button
                  type="button"
                  className="mt-3 ml-auto block text-sm font-semibold underline"
                  onClick={() => setOpenGuests(false)}
                >
                  Close
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={nights > 0 && !canReserve}
          className="reserve-gradient mt-4 h-12 w-full rounded-lg text-base font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
        >
          {reserve.isPending ? 'Reserving…' : nights > 0 ? 'Reserve' : 'Check availability'}
        </button>

        {reserve.isSuccess && reserve.data ? (
          <p
            role="status"
            className="mt-3 rounded-lg bg-canvas px-3 py-2 text-center text-sm font-semibold text-hof"
          >
            Booked · {reserve.data.quote.nights} nights · {formatMoney(reserve.data.quote.total)}
          </p>
        ) : (
          <p className="mt-3 text-center text-sm text-hof">You won&apos;t be charged yet</p>
        )}

        {overCapacity ? (
          <p role="alert" className="mt-3 text-center text-sm text-rausch">
            This place sleeps {listing.guests} guests.
          </p>
        ) : null}

        {conflicts.length > 0 ? (
          <p role="alert" className="mt-3 text-center text-sm text-rausch">
            {conflicts.length} night{conflicts.length === 1 ? '' : 's'} in that range{' '}
            {conflicts.length === 1 ? 'is' : 'are'} already booked.
          </p>
        ) : null}

        {failure ? (
          <p role="alert" className="mt-3 text-center text-sm text-rausch">
            {failure.isConflict ? 'Those nights were just taken. Pick another range.' : failure.message}
          </p>
        ) : null}

        {quote ? (
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="underline airbnb-underline">
                {formatMoney(listing.nightPrice)} x {quote.nights} nights
              </dt>
              <dd>{formatMoney(quote.nightSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="underline airbnb-underline">Cleaning fee</dt>
              <dd>{formatMoney(quote.cleaningFee)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="underline airbnb-underline">Airbnb service fee</dt>
              <dd>{formatMoney(quote.serviceFee)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="underline airbnb-underline">Taxes</dt>
              <dd>{formatMoney(quote.taxes)}</dd>
            </div>
            <div className="flex justify-between border-t border-hairline pt-4 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatMoney(quote.total)}</dd>
            </div>
          </dl>
        ) : null}
      </div>
      <a
        href="#report"
        className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-mute underline airbnb-underline"
      >
        <FlagIcon className="h-3.5 w-3.5" />
        Report this listing
      </a>
    </aside>
  );
}

function Stepper({
  label,
  hint,
  value,
  min,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-hairline py-4 last:border-0">
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-mute">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-mute text-lg disabled:opacity-30"
        >
          –
        </button>
        <span className="w-4 text-center">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-mute text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}
