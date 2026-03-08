import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@portfolio/ui", "@portfolio/lib"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
