const COLUMNS = [
  {
    title: 'Support',
    links: ['Help Center', 'AirCover', 'Anti-discrimination', 'Disability support', 'Cancellation options', 'Report neighborhood concern'],
  },
  {
    title: 'Hosting',
    links: ['Airbnb your home', 'AirCover for Hosts', 'Hosting resources', 'Community forum', 'Hosting responsibly'],
  },
  {
    title: 'Airbnb',
    links: ['Newsroom', 'New features', 'Careers', 'Investors', 'Gift cards', 'Airbnb.org emergency stays'],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto grid max-w-listing grid-cols-3 gap-6 px-0 py-12">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#footer" className="text-sm text-hof hover:underline airbnb-underline">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-listing items-center justify-between py-6 text-sm">
          <p>
            © 2026 Airbnb, Inc. ·{' '}
            <a href="#privacy" className="hover:underline">
              Privacy
            </a>{' '}
            ·{' '}
            <a href="#terms" className="hover:underline">
              Terms
            </a>{' '}
            ·{' '}
            <a href="#sitemap" className="hover:underline">
              Sitemap
            </a>
          </p>
          <p className="font-semibold">English (US) · $ USD</p>
        </div>
      </div>
    </footer>
  );
}
