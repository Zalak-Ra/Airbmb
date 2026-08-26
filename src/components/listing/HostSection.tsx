'use client';

import Image from 'next/image';
import { StarIcon } from '@/components/icons/Icons';
import { formatRating } from '@/lib/utils';
import type { Listing } from '@/types/listing';

export function HostSection({ listing }: { listing: Listing }) {
  const { host } = listing;
  return (
    <section className="border-t border-hairline py-12">
      <h2 className="text-[22px] font-semibold leading-7">Meet your host</h2>
      <div className="mt-8 flex gap-16">
        <div className="w-[380px] rounded-3xl p-8 shadow-card">
          <div className="flex items-center gap-6">
            <div className="relative">
              <span className="relative block h-28 w-28 overflow-hidden rounded-full">
                <Image src={host.avatarSrc} alt={host.name} fill sizes="112px" className="object-cover" />
              </span>
              {host.isSuperhost ? (
                <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-rausch text-xs font-bold text-white">
                  ★
                </span>
              ) : null}
            </div>
            <div>
              <p className="text-[32px] font-bold leading-8">{host.name}</p>
              <p className="mt-1 text-sm font-semibold">{host.isSuperhost ? 'Superhost' : 'Host'}</p>
            </div>
          </div>
          <dl className="mt-8 space-y-3 text-sm">
            <div className="flex justify-between border-b border-hairline pb-3">
              <dt>{host.reviewCount} Reviews</dt>
              <dd className="flex items-center gap-1 font-semibold">
                {formatRating(host.rating)} <StarIcon className="h-3 w-3" />
              </dd>
            </div>
            <div className="flex justify-between border-b border-hairline pb-3">
              <dt>Years hosting</dt>
              <dd className="font-semibold">{host.hostingYears}</dd>
            </div>
          </dl>
        </div>
        <div className="flex-1 pt-2">
          {host.isSuperhost ? (
            <>
              <h3 className="font-semibold">{host.name} is a Superhost</h3>
              <p className="mt-2 text-[16px] leading-6 text-hof">
                Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
              </p>
            </>
          ) : null}
          <h3 className="mt-6 font-semibold">Host details</h3>
          <p className="mt-2 text-[16px] leading-6">
            Response rate: {host.responseRate}%
            <br />
            Responds {host.responseTime}
          </p>
          <p className="mt-4 text-[16px] leading-6">{host.bio}</p>
          <p className="mt-4 text-sm text-mute">Lives in {host.livesIn} · Speaks {host.languages.join(', ')}</p>
          <button
            type="button"
            className="mt-6 rounded-lg bg-hof px-6 py-3 text-base font-semibold text-white hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
          >
            Message host
          </button>
        </div>
      </div>
    </section>
  );
}
