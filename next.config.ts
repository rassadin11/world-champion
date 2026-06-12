import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Минимальный образ для Docker: только рантайм-файлы (.next/standalone).
  output: "standalone",
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
