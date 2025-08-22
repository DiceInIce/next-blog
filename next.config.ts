import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  compiler: {
    emotion: { sourceMap: false },
  },
  webpack: (config, { dev, isServer }) => {
    // Отключаем сорсмапы в деве на клиенте, чтобы избежать сериализации больших строк в кеш
    if (dev && !isServer) {
      config.devtool = false;
    }
    return config;
  },
};

export default nextConfig;
