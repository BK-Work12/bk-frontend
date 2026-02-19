import type { NextConfig } from "next";
import path from "path";

const emptyModule = path.resolve(__dirname, 'src/lib/empty-module.js');

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    qualities: [46, 75, 80, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s2.coinmarketcap.com",
        pathname: "/static/img/coins/**",
      },
    ],
  },
  pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  reactStrictMode: true,
  output: "export",
  distDir: 'build',
  trailingSlash: true,
  turbopack: {},
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@solana/kit': emptyModule,
      '@solana-program/system': emptyModule,
      '@solana-program/token': emptyModule,
      '@react-native-async-storage/async-storage': emptyModule,
      'porto/internal': emptyModule,
    };
    return config;
  },
};

export default nextConfig;
