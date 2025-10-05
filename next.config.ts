import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost"],
  },
  env: {
    NEXTAUTH_URL: "http://localhost:3000",
  },
};

export default nextConfig;
