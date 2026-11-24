import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: { "/*": ["./drizzle/postgresql/**"] },
};

export default nextConfig;
