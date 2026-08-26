'use client';

import { useEffect } from 'react';

/**
 * Decode-ahead for lightbox neighbours.
 *
 * Why not only `next/image`: the optimizer still pays a network round-trip on
 * first decode. Constructing `Image()` with the adjacent URLs warms the
 * browser HTTP cache *and* the decode pipeline so ←/→ feels like zero latency.
 */
export function usePrefetchAdjacentImages(urls: readonly string[], index: number): void {
  useEffect(() => {
    if (urls.length === 0) return;
    const last = urls.length - 1;
    const prev = urls[(index - 1 + urls.length) % urls.length];
    const next = urls[(index + 1) % urls.length];
    const current = urls[index];
    const unique = [prev, current, next].filter((src, i, arr): src is string => {
      return Boolean(src) && arr.indexOf(src) === i;
    });

    for (const src of unique) {
      const img = new window.Image();
      img.decoding = 'async';
      img.src = src;
    }

    void last;
  }, [urls, index]);
}
