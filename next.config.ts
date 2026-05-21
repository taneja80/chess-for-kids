import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 uses Turbopack by default — use turbopack config, not webpack
  turbopack: {},
  experimental: {
    // Silence undici/Firebase critical-dependency warnings
  },
};

export default nextConfig;
