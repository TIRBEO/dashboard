import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ['@tirbeo/auth', '@tirbeo/database', '@tirbeo/ui', '@tirbeo/utils', '@tirbeo/config'],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    config.output = config.output || {};
    config.output.hashFunction = 'xxhash64';
    return config;
  },
};

export default nextConfig;
