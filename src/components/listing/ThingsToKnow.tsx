import type { Listing } from '@/types/listing';

export function ThingsToKnow({ listing }: { listing: Listing }) {
  const columns = [
    { title: 'House rules', items: listing.houseRules },
    { title: 'Safety & property', items: listing.safety },
    { title: 'Cancellation policy', items: [listing.cancellation] },
  ];
  return (
    <section className="border-t border-hairline py-12">
      <h2 className="text-[22px] font-semibold leading-7">Things to know</h2>
      <div className="mt-6 grid grid-cols-3 gap-8">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="font-semibold">{col.title}</h3>
            <ul className="mt-3 space-y-3 text-[16px] leading-6">
              {col.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <button type="button" className="mt-4 text-sm font-semibold underline airbnb-underline">
              Show more
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
