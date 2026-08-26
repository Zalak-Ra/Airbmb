'use client';

/**
 * Geometry-matched skeleton. The shimmer blocks occupy the same bounding
 * boxes as the loaded listing (photo mosaic 400px, title 30px, booking card
 * 372px) so the transition does not reflow. That is the Core Web Vital
 * lesson: CLS is a layout problem, not a spinner problem.
 */
export function ListingSkeleton() {
  return (
    <div className="mx-auto max-w-listing pt-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading listing</span>
      <div className="skeleton-shimmer mb-4 h-8 w-[540px] rounded-md" />
      <div className="mb-6 flex justify-between">
        <div className="skeleton-shimmer h-5 w-80 rounded-md" />
        <div className="skeleton-shimmer h-5 w-40 rounded-md" />
      </div>
      <div className="grid h-[400px] grid-cols-2 grid-rows-2 gap-2 overflow-hidden rounded-xl">
        <div className="skeleton-shimmer row-span-2" />
        <div className="grid grid-cols-2 grid-rows-2 gap-2">
          <div className="skeleton-shimmer" />
          <div className="skeleton-shimmer" />
          <div className="skeleton-shimmer" />
          <div className="skeleton-shimmer" />
        </div>
      </div>
      <div className="mt-12 flex gap-24">
        <div className="flex-1">
          <div className="skeleton-shimmer mb-3 h-7 w-96 rounded-md" />
          <div className="skeleton-shimmer mb-8 h-5 w-72 rounded-md" />
          <div className="skeleton-shimmer mb-4 h-24 w-full rounded-xl" />
          <div className="skeleton-shimmer h-40 w-full rounded-xl" />
        </div>
        <div className="skeleton-shimmer h-[460px] w-[372px] shrink-0 rounded-xl" />
      </div>
    </div>
  );
}
