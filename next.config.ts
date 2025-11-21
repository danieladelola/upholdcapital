import type { NextConfig } from "next";
import path from "path";

const useClerkShim = !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const nextConfig: NextConfig = {
  // Provide an empty turbopack config so Next's dev server doesn't error
  // when a custom webpack config is present. This lets Turbopack run
  // by default while keeping the existing webpack alias logic.
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (useClerkShim) {
      // Alias @clerk/nextjs to our shim to avoid runtime errors in dev
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@clerk/nextjs": path.resolve(__dirname, "./src/lib/clerk-shim.tsx"),
      };
    }
    return config;
  },
};

export default nextConfig;
