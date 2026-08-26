'use client';

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfToday,
} from 'date-fns';
import { useMemo, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons/Icons';
import { toIsoDate } from '@/lib/pricing';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onChange: (checkIn: Date | null, checkOut: Date | null) => void;
  /** Calendar dates (`YYYY-MM-DD`) already sold or blocked by the host. */
  unavailable?: ReadonlySet<string>;
}

export function DatePicker({ checkIn, checkOut, onChange, unavailable }: DatePickerProps) {
  const [cursor, setCursor] = useState(() => startOfMonth(startOfToday()));
  const left = cursor;
  const right = addMonths(cursor, 1);

  const nights =
    checkIn && checkOut ? Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000) : 0;

  return (
    <section className="border-t border-hairline py-12">
      <h2 className="text-[22px] font-semibold leading-7">
        {nights > 0
          ? `${nights} night${nights === 1 ? '' : 's'} in Joshua Tree`
          : 'Select check-in date'}
      </h2>
      <p className="mt-2 text-sm text-mute">
        {checkIn && checkOut
          ? `${format(checkIn, 'MMM d, yyyy')} – ${format(checkOut, 'MMM d, yyyy')}`
          : 'Add your travel dates for exact pricing'}
      </p>
      <div className="relative mt-6 grid grid-cols-2 gap-12">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setCursor((c) => addMonths(c, -1))}
          className="absolute -left-2 top-0 flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-hof"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="absolute -right-2 top-0 flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-hof"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
        <MonthGrid
          month={left}
          checkIn={checkIn}
          checkOut={checkOut}
          unavailable={unavailable}
          onPick={(d) => pick(d, checkIn, checkOut, onChange)}
        />
        <MonthGrid
          month={right}
          checkIn={checkIn}
          checkOut={checkOut}
          unavailable={unavailable}
          onPick={(d) => pick(d, checkIn, checkOut, onChange)}
        />
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="text-sm font-semibold underline airbnb-underline"
          onClick={() => onChange(null, null)}
        >
          Clear dates
        </button>
      </div>
    </section>
  );
}

function pick(
  day: Date,
  checkIn: Date | null,
  checkOut: Date | null,
  onChange: (checkIn: Date | null, checkOut: Date | null) => void,
) {
  if (!checkIn || (checkIn && checkOut)) {
    onChange(day, null);
    return;
  }
  if (isBefore(day, checkIn) || isSameDay(day, checkIn)) {
    onChange(day, null);
    return;
  }
  onChange(checkIn, day);
}

function MonthGrid({
  month,
  checkIn,
  checkOut,
  unavailable,
  onPick,
}: {
  month: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  unavailable?: ReadonlySet<string>;
  onPick: (day: Date) => void;
}) {
  const today = startOfToday();
  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const pad = start.getDay();
    const blanks = Array.from({ length: pad }, () => null);
    return [...blanks, ...eachDayOfInterval({ start, end })];
  }, [month]);

  return (
    <div>
      <h3 className="mb-4 text-center text-base font-semibold">{format(month, 'MMMM yyyy')}</h3>
      <div className="grid grid-cols-7 text-center text-xs text-mute">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={`${d}-${i}`} className="py-2">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          if (!day) return <span key={`b-${i}`} />;
          const past = isBefore(day, today) && !isSameDay(day, today);
          const taken = unavailable?.has(toIsoDate(day)) ?? false;
          const disabled = past || taken;
          const start = checkIn && isSameDay(day, checkIn);
          const end = checkOut && isSameDay(day, checkOut);
          const inRange =
            checkIn &&
            checkOut &&
            isAfter(day, checkIn) &&
            isBefore(day, checkOut) &&
            isSameMonth(day, month);
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              aria-label={taken ? `${format(day, 'MMMM d')} — unavailable` : format(day, 'MMMM d')}
              onClick={() => onPick(day)}
              className={cn(
                'relative my-0.5 flex h-12 w-full items-center justify-center text-sm font-semibold',
                disabled && 'text-line line-through',
                inRange && 'bg-canvas',
                (start || end) && 'rounded-full bg-hof text-white',
                !disabled && !start && !end && 'rounded-full hover:border hover:border-hof',
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
