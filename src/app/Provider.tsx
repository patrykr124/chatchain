"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { createConfig, http, WagmiConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
const queryClient = new QueryClient();



export const config = createConfig({
    chains: [mainnet, sepolia],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
});



export function Providers({ children, session }: { children: ReactNode, session?: Session  }) {
    return (
        <QueryClientProvider client={queryClient}>
            <WagmiConfig config={config}>
                <SessionProvider session={session} >
                    {children}
                </SessionProvider>
            </WagmiConfig>
        </QueryClientProvider>

    );
}