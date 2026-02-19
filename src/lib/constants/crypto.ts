/**
 * Crypto table constants and default fallback data.
 */

export interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  price: string;
  change24h: number;
  marketCap: string;
  iconDark?: string;
}

export const DEFAULT_CRYPTO_DATA: CryptoData[] = [
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '/assets/logos_bitcoin.svg',
    price: '$95,542.69',
    change24h: 0.1,
    marketCap: '$1.91T',
  },
  {
    id: '2',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '/assets/cryptocurrency-color_eth_svg.svg',
    price: '$3,323.16',
    change24h: 0.5,
    marketCap: '$401.31B',
  },
  // {
  //   id: '3',
  //   name: 'Tether USDT',
  //   symbol: 'USDT',
  //   icon: '/assets/cryptocurrency-color_usdc.svg',
  //   price: '$1.00',
  //   change24h: 0,
  //   marketCap: '$76.48B',
  // },
  {
    id: '3',
    name: 'BNB',
    symbol: 'BNB',
    icon: '/assets/cryptocurrency-color_bnb.svg',
    price: '$953.93',
    change24h: -0.4,
    marketCap: '$130.19B',
  },
  {
    id: '4',
    name: 'XRP',
    symbol: 'XRP',
    icon: '/assets/cryptocurrency_xrp.svg',
    iconDark: '/assets/cryptocurrency_xrp.svg',
    price: '$2.35',
    change24h: 0.3,
    marketCap: '$126.37B',
  },
  {
    id: '5',
    name: 'Solana',
    symbol: 'SOL',
    icon: '/assets/Group 1597885025.svg',
    price: '$144.05',
    change24h: 0.1,
    marketCap: '$81.45B',
  },
];
