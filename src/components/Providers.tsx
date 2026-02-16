"use client";

import { createConfig, regtest as midlRegtest } from "@midl-xyz/midl-js-core";
import { xverseConnector } from "@midl-xyz/midl-js-connectors";
import { WagmiMidlProvider } from "@midl-xyz/midl-js-executor-react";
import { MidlProvider } from "@midl-xyz/midl-js-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const midlConfig = createConfig({
  networks: [midlRegtest],
  connectors: [
    xverseConnector({
      metadata: {
        name: "Xverse",
        description: "Bonding curve launchpad for Midl Network",
      },
    }),
  ],
  persist: true,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <MidlProvider config={midlConfig}>
        <WagmiMidlProvider>{children}</WagmiMidlProvider>
      </MidlProvider>
    </QueryClientProvider>
  );
}
