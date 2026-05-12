"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { createConfig, http, WagmiProvider, type Config } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

const safeConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [],
  ssr: true,
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
  },
});

export function Providers({
  children,
}: {
  children: ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    let mounted = true;

    void import("@/src/config")
      .then(({ getConfig }) => {
        if (mounted) setConfig(getConfig());
      })
      .catch((error) => {
        console.error("[Providers] wallet config failed", error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <WagmiProvider config={config ?? safeConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
