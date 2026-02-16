import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    const optionalModuleExternals = [
      "pino-pretty",
      "lokijs",
      "encoding",
      "@react-native-async-storage/async-storage",
    ];

    const mappedExternals = optionalModuleExternals.map((moduleName) => ({
      [moduleName]: `commonjs ${moduleName}`,
    }));

    if (Array.isArray(config.externals)) {
      config.externals = [...config.externals, ...mappedExternals];
    } else if (config.externals) {
      config.externals = [config.externals, ...mappedExternals];
    } else {
      config.externals = mappedExternals;
    }

    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "viem/actions$": path.resolve(process.cwd(), "src/lib/viem-actions-shim.ts"),
    };

    return config;
  },
};

export default nextConfig;
