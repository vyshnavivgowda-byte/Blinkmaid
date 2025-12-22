import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',      // This is mandatory for APKs
  images: {
    unoptimized: true,   // Tailwind images need this for static export
  },
};

export default nextConfig;