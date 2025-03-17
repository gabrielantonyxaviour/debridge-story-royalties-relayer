"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import {
  DynamicContextProvider,
  EthereumWalletConnectors,
  DynamicWagmiConnector,
  EthereumWalletConnectorsWithConfig,
} from "@/lib/dyanmic";
import { mainnet, base, arbitrum, avalanche, bsc, polygon } from "viem/chains";
import { useTheme } from "next-themes";

const config = createConfig({
  chains: [mainnet, base, arbitrum, avalanche, bsc, polygon],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [avalanche.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
  },
});
const queryClient = new QueryClient();
interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const { theme } = useTheme();
  return (
    <>
      <DynamicContextProvider
        theme={theme == "light" ? "light" : "dark"}
        settings={{
          environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
          walletConnectors: [
            EthereumWalletConnectorsWithConfig({
              publicClientHttpTransportConfig: {
                fetchOptions: {
                  headers: {
                    "X-Requested-With": "XMLHttpRequest",
                  },
                },
                retryCount: 0,
              },
            }),
          ],
        }}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
          </QueryClientProvider>
        </WagmiProvider>
      </DynamicContextProvider>
    </>
  );
}
