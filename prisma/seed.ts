import { PrismaClient, type BlockReason, type HighlightIcon, type PhotoCategory } from '@prisma/client';
import { LISTING_FIXTURE, REVIEW_FIXTURES } from '../src/lib/data/fixtures';

/**
 * Idempotent seed from the fixture catalog.
 *
 * Why upsert rather than "insert if empty": a workshop `db:reset` should
 * restore a known world, including wiping stray bookings from a previous
 * smoke test. The listing id is the natural key.
 */

const prisma = new PrismaClient();

const PHOTO_CATEGORIES: readonly PhotoCategory[] = [
  'living',
  'bedroom',
  'kitchen',
  'dining',
  'pool',
  'exterior',
  'bathroom',
  'workspace',
  'outdoor',
];

const HIGHLIGHT_ICONS: readonly HighlightIcon[] = [
  'checkin',
  'superhost',
  'location',
  'cancellation',
];

function photoCategory(value: string): PhotoCategory {
  const match = PHOTO_CATEGORIES.find((category) => category === value);
  return match ?? 'living';
}

function highlightIcon(value: string): HighlightIcon {
  const match = HIGHLIGHT_ICONS.find((icon) => icon === value);
  return match ?? 'checkin';
}

function dateOnly(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

function blockedNights(): Date[] {
  const nights: Date[] = [];
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() + 21);
  for (let i = 0; i < 4; i += 1) {
    const night = new Date(start);
    night.setUTCDate(start.getUTCDate() + i);
    nights.push(night);
  }
  return nights;
}

async function main(): Promise<void> {
  const listing = LISTING_FIXTURE;
  const host = listing.host;
  const hostId = `host_${listing.id}`;

  await prisma.$transaction(async (tx) => {
    await tx.booking.deleteMany({ where: { listingId: listing.id } });
    await tx.blockedNight.deleteMany({ where: { listingId: listing.id } });
    await tx.wishlist.deleteMany({ where: { listingId: listing.id } });
    await tx.review.deleteMany({ where: { listingId: listing.id } });
    await tx.listingSafetyItem.deleteMany({ where: { listingId: listing.id } });
    await tx.listingHouseRule.deleteMany({ where: { listingId: listing.id } });
    await tx.highlight.deleteMany({ where: { listingId: listing.id } });
    await tx.listingAmenity.deleteMany({ where: { listingId: listing.id } });
    await tx.photo.deleteMany({ where: { listingId: listing.id } });
    await tx.listing.deleteMany({ where: { id: listing.id } });
    await tx.hostLanguage.deleteMany({ where: { hostId } });
    await tx.host.deleteMany({ where: { id: hostId } });

    await tx.host.create({
      data: {
        id: hostId,
        name: host.name,
        avatarSrc: host.avatarSrc,
        isSuperhost: host.isSuperhost,
        hostingYears: host.hostingYears,
        reviewCount: host.reviewCount,
        rating: host.rating,
        livesIn: host.livesIn,
        responseRate: host.responseRate,
        responseTime: host.responseTime,
        bio: host.bio,
        languages: {
          create: host.languages.map((language) => ({ language })),
        },
      },
    });

    await tx.listing.create({
      data: {
        id: listing.id,
        hostId,
        title: listing.title,
        subtitle: listing.subtitle,
        locationLabel: listing.locationLabel,
        neighborhood: listing.neighborhood,
        city: listing.city,
        country: listing.country,
        lat: listing.lat,
        lng: listing.lng,
        locationBlurb: listing.locationBlurb,
        propertyType: listing.propertyType,
        guests: listing.guests,
        bedrooms: listing.bedrooms,
        beds: listing.beds,
        baths: listing.baths,
        nightPrice: listing.nightPrice,
        cleaningFee: listing.cleaningFee,
        airbnbFee: listing.airbnbFee,
        rating: listing.rating,
        reviewCount: listing.reviewCount,
        isSuperhost: listing.isSuperhost,
        isGuestFavorite: listing.isGuestFavorite,
        description: listing.description,
        descriptionExtra: listing.descriptionExtra,
        cancellation: listing.cancellation,
        checkInWindow: listing.checkInWindow,
        checkOutTime: listing.checkOutTime,
        scoreCleanliness: listing.breakdown.cleanliness,
        scoreAccuracy: listing.breakdown.accuracy,
        scoreCheckIn: listing.breakdown.checkIn,
        scoreCommunication: listing.breakdown.communication,
        scoreLocation: listing.breakdown.location,
        scoreValue: listing.breakdown.value,
      },
    });

    await tx.photo.createMany({
      data: listing.photos.map((photo, position) => ({
        id: photo.id,
        listingId: listing.id,
        src: photo.src,
        alt: photo.alt,
        width: photo.width,
        height: photo.height,
        category: photoCategory(photo.category),
        caption: photo.caption,
        position,
      })),
    });

    for (const amenity of listing.amenities) {
      await tx.amenity.upsert({
        where: { id: amenity.id },
        create: { id: amenity.id, label: amenity.label, icon: amenity.icon },
        update: { label: amenity.label, icon: amenity.icon },
      });
    }

    await tx.listingAmenity.createMany({
      data: listing.amenities.map((amenity, position) => ({
        listingId: listing.id,
        amenityId: amenity.id,
        featured: amenity.featured,
        position,
      })),
    });

    await tx.highlight.createMany({
      data: listing.highlights.map((highlight, position) => ({
        id: highlight.id,
        listingId: listing.id,
        title: highlight.title,
        body: highlight.body,
        icon: highlightIcon(highlight.icon),
        position,
      })),
    });

    await tx.listingHouseRule.createMany({
      data: listing.houseRules.map((body, position) => ({
        listingId: listing.id,
        position,
        body,
      })),
    });

    await tx.listingSafetyItem.createMany({
      data: listing.safety.map((body, position) => ({
        listingId: listing.id,
        position,
        body,
      })),
    });

    await tx.review.createMany({
      data: REVIEW_FIXTURES.map((review, position) => ({
        id: review.id,
        listingId: review.listingId,
        author: review.author,
        avatarSrc: review.avatarSrc,
        dateLabel: review.dateLabel,
        yearsOnAirbnb: review.yearsOnAirbnb,
        rating: review.rating,
        stayLabel: review.stayLabel,
        body: review.text,
        position,
      })),
    });

    await tx.wishlist.create({
      data: { listingId: listing.id, saved: listing.saved },
    });

    const reason: BlockReason = 'host_block';
    await tx.blockedNight.createMany({
      data: blockedNights().map((night) => ({
        listingId: listing.id,
        night,
        reason,
      })),
    });
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
