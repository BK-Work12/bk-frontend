import { cookieStorage, createStorage } from '@wagmi/core';
import { fallback, http } from 'viem';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum, polygon, bsc } from '@reown/appkit/networks';

export const projectId = '7b22d716395edbc7d978c2842c5a9193';

export const networks = [mainnet, arbitrum, polygon, bsc];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [mainnet.id]: fallback([
      http('https://rpc.ankr.com/eth'),
      http('https://ethereum-rpc.publicnode.com'),
      http('https://eth.llamarpc.com'),
      http('https://1rpc.io/eth'),
    ]),
    [arbitrum.id]: fallback([
      http('https://rpc.ankr.com/arbitrum'),
      http('https://arbitrum-one-rpc.publicnode.com'),
    ]),
    [polygon.id]: fallback([
      http('https://rpc.ankr.com/polygon'),
      http('https://polygon-bor-rpc.publicnode.com'),
    ]),
    [bsc.id]: fallback([
      http('https://rpc.ankr.com/bsc'),
      http('https://bsc-rpc.publicnode.com'),
    ]),
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

/** Minimal ERC-20 ABI for transfer and balanceOf */
export const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;
