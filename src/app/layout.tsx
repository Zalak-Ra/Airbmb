import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

/**
 * Plus Jakarta Sans is an open stand-in for Airbnb Circular.
 * Why not Circular itself: it is proprietary. This family has the same
 * geometric-sans skeleton (high x-height, tight tracking) so the listing
 * type scale lands without shipping a licensed font file.
 */
const circular = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-circular',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Architectural desert villa with pool & 360° canyon views – AIR',
  description:
    'Entire villa in Joshua Tree, California. Workshop-grade clone of a vacation-rental listing page.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={circular.variable}>
      <body className="font-sans text-hof antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
