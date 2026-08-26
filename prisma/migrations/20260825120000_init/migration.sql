-- CreateEnum
CREATE TYPE "PhotoCategory" AS ENUM ('living', 'bedroom', 'kitchen', 'dining', 'pool', 'exterior', 'bathroom', 'workspace', 'outdoor');

-- CreateEnum
CREATE TYPE "HighlightIcon" AS ENUM ('checkin', 'superhost', 'location', 'cancellation');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "BlockReason" AS ENUM ('host_block');

-- CreateTable
CREATE TABLE "hosts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_src" TEXT NOT NULL,
    "is_superhost" BOOLEAN NOT NULL,
    "hosting_years" INTEGER NOT NULL,
    "review_count" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "lives_in" TEXT NOT NULL,
    "response_rate" INTEGER NOT NULL,
    "response_time" TEXT NOT NULL,
    "bio" TEXT NOT NULL,

    CONSTRAINT "hosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_languages" (
    "host_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "host_languages_pkey" PRIMARY KEY ("host_id","language")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "location_label" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "location_blurb" TEXT NOT NULL,
    "property_type" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "beds" INTEGER NOT NULL,
    "baths" DOUBLE PRECISION NOT NULL,
    "night_price" INTEGER NOT NULL,
    "cleaning_fee" INTEGER NOT NULL,
    "airbnb_fee" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL,
    "review_count" INTEGER NOT NULL,
    "is_superhost" BOOLEAN NOT NULL,
    "is_guest_favorite" BOOLEAN NOT NULL,
    "description" TEXT NOT NULL,
    "description_extra" TEXT NOT NULL,
    "cancellation" TEXT NOT NULL,
    "check_in_window" TEXT NOT NULL,
    "check_out_time" TEXT NOT NULL,
    "score_cleanliness" DOUBLE PRECISION NOT NULL,
    "score_accuracy" DOUBLE PRECISION NOT NULL,
    "score_check_in" DOUBLE PRECISION NOT NULL,
    "score_communication" DOUBLE PRECISION NOT NULL,
    "score_location" DOUBLE PRECISION NOT NULL,
    "score_value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "category" "PhotoCategory" NOT NULL,
    "caption" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_amenities" (
    "listing_id" TEXT NOT NULL,
    "amenity_id" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "listing_amenities_pkey" PRIMARY KEY ("listing_id","amenity_id")
);

-- CreateTable
CREATE TABLE "highlights" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "icon" "HighlightIcon" NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_house_rules" (
    "listing_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "listing_house_rules_pkey" PRIMARY KEY ("listing_id","position")
);

-- CreateTable
CREATE TABLE "listing_safety_items" (
    "listing_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "listing_safety_items_pkey" PRIMARY KEY ("listing_id","position")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "avatar_src" TEXT NOT NULL,
    "date_label" TEXT NOT NULL,
    "years_on_airbnb" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "stay_label" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist" (
    "listing_id" TEXT NOT NULL,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wishlist_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "blocked_nights" (
    "listing_id" TEXT NOT NULL,
    "night" DATE NOT NULL,
    "reason" "BlockReason" NOT NULL DEFAULT 'host_block',

    CONSTRAINT "blocked_nights_pkey" PRIMARY KEY ("listing_id","night")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "check_in" DATE NOT NULL,
    "check_out" DATE NOT NULL,
    "adults" INTEGER NOT NULL,
    "children" INTEGER NOT NULL,
    "infants" INTEGER NOT NULL,
    "pets" INTEGER NOT NULL,
    "nights" INTEGER NOT NULL,
    "night_subtotal" INTEGER NOT NULL,
    "cleaning_fee" INTEGER NOT NULL,
    "service_fee" INTEGER NOT NULL,
    "taxes" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'confirmed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "photos_listing_id_position_idx" ON "photos"("listing_id", "position");
CREATE INDEX "listing_amenities_listing_id_position_idx" ON "listing_amenities"("listing_id", "position");
CREATE INDEX "highlights_listing_id_position_idx" ON "highlights"("listing_id", "position");
CREATE INDEX "reviews_listing_id_position_idx" ON "reviews"("listing_id", "position");
CREATE INDEX "bookings_listing_id_status_check_in_check_out_idx" ON "bookings"("listing_id", "status", "check_in", "check_out");

ALTER TABLE "host_languages" ADD CONSTRAINT "host_languages_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "photos" ADD CONSTRAINT "photos_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listing_amenities" ADD CONSTRAINT "listing_amenities_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listing_amenities" ADD CONSTRAINT "listing_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listing_house_rules" ADD CONSTRAINT "listing_house_rules_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listing_safety_items" ADD CONSTRAINT "listing_safety_items_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "blocked_nights" ADD CONSTRAINT "blocked_nights_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Belt-and-suspenders against a double-sell. Serializable isolation in the
-- repository closes the race in the application; this exclusion constraint
-- closes it in the database if anything ever writes around the repository.
-- `[)` is half-open so a checkout on the 24th does not collide with a
-- check-in on the 24th.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (
    listing_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
  )
  WHERE (status = 'confirmed');
