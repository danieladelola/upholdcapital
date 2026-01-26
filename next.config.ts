import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    turbopack: {},
    onDemandEntries: {
        maxInactiveAge: 60 * 1000,
        pagesBufferLength: 5,
    },
    experimental: {
        optimizePackageImports: ["@radix-ui/react-*"],
    },
};

export default nextConfig;
