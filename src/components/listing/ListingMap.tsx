'use client';

import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Listing } from '@/types/listing';

/**
 * Leaflet is ~150KB of JS + CSS and must never ship in the listing hero
 * chunk. ListingPage loads this file with next/dynamic({ ssr: false }).
 */

const pin = L.divIcon({
  className: '',
  html: `<div style="width:48px;height:48px;border-radius:50%;background:#222;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(0,0,0,.24);font-size:18px">⌂</div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

export function ListingMap({ listing }: { listing: Listing }) {
  return (
    <section id="location" className="border-t border-hairline py-12">
      <h2 className="text-[22px] font-semibold leading-7">Where you’ll be</h2>
      <p className="mt-2 text-base">{listing.locationLabel}</p>
      <div className="mt-6 overflow-hidden rounded-xl">
        <MapContainer
          center={[listing.lat, listing.lng]}
          zoom={12}
          scrollWheelZoom={false}
          aria-label="Listing location map"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[listing.lat, listing.lng]} icon={pin} />
        </MapContainer>
      </div>
      <p className="mt-6 max-w-3xl text-[16px] leading-6">{listing.locationBlurb}</p>
    </section>
  );
}
