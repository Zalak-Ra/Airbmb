'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { makeQueryClient } from '@/lib/query/client';

/**
 * QueryClient must be created inside a client component (not a module
 * singleton imported by a Server Component). Otherwise RSC + HMR share a
 * cache across requests in dev and "optimistic" updates leak between users
 * in a multi-tab workshop demo.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(makeQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
