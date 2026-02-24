'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { getConfig } from '@/src/config';           // ← your config file
import { type ReactNode, useState } from 'react';

// Optional: if you can compute/pass initialState from server (via props)
// but most people start without it and just enable ssr: true in config
export function Providers({
  children,
  // initialState,   // ← uncomment & pass from layout if you want to hydrate state
}: {
  children: ReactNode;
  // initialState?: State;   // from wagmi import { type State }
}) {
  const [queryClient] = useState(() => new QueryClient());

  // This line is safe – wagmi handles SSR correctly when ssr: true
  const [config] = useState(() => getConfig());

  return (
    <WagmiProvider 
      config={config} 
      // initialState={initialState}   // ← optional but recommended when possible
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}