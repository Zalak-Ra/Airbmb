import { ListingPage } from '@/components/listing/ListingPage';

/**
 * The assignment is a single listing surface (desktop). Routing to `/`
 * matches the reference deployment, which is a one-page experience rather
 * than a marketplace search index.
 */
export default function HomePage() {
  return <ListingPage />;
}
