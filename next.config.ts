import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s2.coinmarketcap.com",
        pathname: "/static/img/coins/128x128/**",
      },
    ],
  },
  // Turbopack configuration for Next.js 16
  // Empty config to silence the warning since we've fixed the import chain
  turbopack: {},
};

export default nextConfig;
