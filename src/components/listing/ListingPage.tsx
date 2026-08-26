'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { BookingCard } from '@/components/listing/BookingCard';
import { ListingDetails } from '@/components/listing/ListingDetails';
import { ListingSkeleton } from '@/components/listing/ListingSkeleton';
import { PhotoGrid } from '@/components/listing/PhotoGrid';
import { ShareModal } from '@/components/listing/ShareModal';
import { ThingsToKnow } from '@/components/listing/ThingsToKnow';
import { TitleRow } from '@/components/listing/TitleRow';
import { HostSection } from '@/components/listing/HostSection';
import { useListingQuery, useToggleSaved } from '@/hooks/useListingQuery';
import { DEFAULT_LISTING_ID, type DateRange, type GuestCounts } from '@/types/listing';

/**
 * Dynamic imports for below-fold + overlay surfaces.
 * Why: reviews pull a second React Query + avatars; the map pulls Leaflet;
 * photo tour/lightbox are large interaction trees unused until click.
 * `ssr: false` on the map because Leaflet touches `window`.
 */
const ReviewsSection = dynamic(
  () => import('@/components/listing/ReviewsSection').then((m) => m.ReviewsSection),
  { loading: () => <div className="skeleton-shimmer my-12 h-72 rounded-xl" />, ssr: false },
);

const ListingMap = dynamic(
  () => import('@/components/listing/ListingMap').then((m) => m.ListingMap),
  { ssr: false, loading: () => <div className="skeleton-shimmer my-12 h-[480px] rounded-xl" /> },
);

const PhotoTour = dynamic(
  () => import('@/components/listing/PhotoTour').then((m) => m.PhotoTour),
  { ssr: false },
);

const Lightbox = dynamic(
  () => import('@/components/listing/Lightbox').then((m) => m.Lightbox),
  { ssr: false },
);

export function ListingPage() {
  const { data: listing, isLoading, isError } = useListingQuery(DEFAULT_LISTING_ID);
  const save = useToggleSaved(DEFAULT_LISTING_ID);
  const [tourOpen, setTourOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [range, setRange] = useState<DateRange>({ checkIn: null, checkOut: null });
  const [guests, setGuests] = useState<GuestCounts>({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const openPhoto = useCallback((index: number) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  }, []);

  const openFromTour = useCallback((index: number) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  }, []);

  return (
    <div className="min-w-[1280px]">
      <SiteHeader />
      <main className="mx-auto max-w-listing pb-16">
        {isLoading || !listing ? (
          isError ? (
            <p className="py-24 text-center text-mute">This listing could not be loaded.</p>
          ) : (
            <ListingSkeleton />
          )
        ) : (
          <>
            <TitleRow
              listing={listing}
              onShare={() => setShareOpen(true)}
              onSave={() => save.mutate(!listing.saved)}
            />
            <PhotoGrid
              photos={listing.photos}
              onShowAll={() => setTourOpen(true)}
              onOpenPhoto={openPhoto}
            />
            <div className="mt-12 flex items-start gap-[88px]">
              <ListingDetails listing={listing} range={range} onRangeChange={setRange} />
              <BookingCard
                listing={listing}
                range={range}
                guests={guests}
                onRangeChange={setRange}
                onGuestsChange={setGuests}
              />
            </div>
            <ReviewsSection listing={listing} />
            <ListingMap listing={listing} />
            <HostSection listing={listing} />
            <ThingsToKnow listing={listing} />
            <PhotoTour
              open={tourOpen}
              listing={listing}
              onClose={() => setTourOpen(false)}
              onSelectPhoto={openFromTour}
            />
            <Lightbox
              open={lightboxOpen}
              photos={listing.photos}
              index={photoIndex}
              saved={listing.saved}
              onClose={() => setLightboxOpen(false)}
              onIndexChange={setPhotoIndex}
              onToggleSave={() => save.mutate(!listing.saved)}
              onShare={() => setShareOpen(true)}
            />
            <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
