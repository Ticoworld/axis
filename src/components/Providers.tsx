"use client";

import {
  type Config,
  MaestroSymphonyProvider,
  MempoolSpaceProvider,
  regtest,
} from "@midl/core";
import { createMidlConfig, SatoshiKitProvider } from "@midl/satoshi-kit";
import { WagmiMidlProvider } from "@midl/executor-react";
import { MidlProvider } from "@midl/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";

/**
 * Explicit MempoolSpaceProvider ensures the SDK uses the correct
 * MIDL regtest mempool for UTXO lookups, fee estimates, and broadcast.
 */
export const mempoolProvider = new MempoolSpaceProvider({
  regtest: "https://mempool.staging.midl.xyz",
});

export const midlConfig = createMidlConfig({
  networks: [regtest],
  persist: true,
  provider: mempoolProvider,
  runesProvider: new MaestroSymphonyProvider({
    regtest: "https://runes.staging.midl.xyz",
  }),
}) as Config;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => queryClient, []);

  return (
    <QueryClientProvider client={client}>
      <MidlProvider config={midlConfig}>
        <SatoshiKitProvider>
          <WagmiMidlProvider>{children}</WagmiMidlProvider>
        </SatoshiKitProvider>
      </MidlProvider>
    </QueryClientProvider>
  );
}
