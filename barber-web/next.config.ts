import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "",
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
      process.env.STRIPE_PUBLIC_KEY ||
      "",
  },
};

export default nextConfig;
