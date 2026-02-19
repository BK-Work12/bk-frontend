'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { mainnet, arbitrum, polygon, bsc } from '@reown/appkit/networks';
import { WagmiProvider, type Config } from 'wagmi';
import { wagmiAdapter, projectId } from '@/lib/web3Config';
import { useState, type ReactNode } from 'react';

const queryClient = new QueryClient();

const metadata = {
  name: 'Varntix',
  description: 'Varntix Dashboard — Web3 Wallet Deposit',
  url: 'https://dashboard.varntix.com',
  icons: ['https://dashboard.varntix.com/assets/logoSingle.svg'],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum, polygon, bsc],
  defaultNetwork: mainnet,
  metadata,
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#D5F821',
    '--w3m-border-radius-master': '2px',
  },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [qc] = useState(() => queryClient);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={qc}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
