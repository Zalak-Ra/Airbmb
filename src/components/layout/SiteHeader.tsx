'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AirbnbMark, GlobeIcon, HamburgerIcon, ProfileIcon, SearchGlyph } from '@/components/icons/Icons';

/**
 * Listing-page chrome. The compact search pill is the production Airbnb
 * pattern once you have left the home-page hero search: it is a summary of
 * the in-progress trip, not a second search form.
 */
export function SiteHeader() {
  const { scrollY } = useScroll();
  const shadow = useTransform(scrollY, [0, 24], ['0 0 0 rgba(0,0,0,0)', '0 1px 0 #EBEBEB']);

  return (
    <motion.header
      style={{ boxShadow: shadow }}
      className="sticky top-0 z-40 h-header bg-white"
    >
      <div className="mx-auto flex h-full max-w-shell items-center justify-between px-20">
        <Link href="/" aria-label="AIR home" className="flex items-center gap-1.5 text-rausch">
          <AirbnbMark className="h-8 w-8" />
          <span className="text-[22px] font-bold tracking-tight">airbnb</span>
        </Link>

        <button
          type="button"
          className="flex h-12 items-center rounded-full border border-line bg-white pl-2 pr-2 shadow-search transition-shadow duration-200 ease-airbnb hover:shadow-search-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
          aria-label="Start your search"
        >
          <span className="px-4 text-sm font-semibold">Anywhere</span>
          <span className="h-6 w-px bg-line" />
          <span className="px-4 text-sm font-semibold">Any week</span>
          <span className="h-6 w-px bg-line" />
          <span className="px-4 text-sm font-normal text-mute">Add guests</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rausch text-white">
            <SearchGlyph className="h-3.5 w-3.5" />
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-full px-4 py-[10px] text-sm font-semibold hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
          >
            Airbnb your home
          </button>
          <button
            type="button"
            aria-label="Choose a language"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
          >
            <GlobeIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Main navigation menu"
            className="ml-1 flex h-11 items-center gap-3 rounded-full border border-line pl-3.5 pr-1.5 shadow-search transition-shadow duration-200 hover:shadow-search-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hof"
          >
            <HamburgerIcon className="h-4 w-4 text-hof" />
            <ProfileIcon className="h-8 w-8 text-mute" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
