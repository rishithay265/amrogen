import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@amrogen/database", "@amrogen/platform"],
};

export default nextConfig;
