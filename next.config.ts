import type { NextConfig } from "next";

/**
 * `STATIC_EXPORT=true` builds a fully static site (used for the GitHub Pages demo).
 * The default build keeps the Node.js features, such as the locale-detecting proxy.
 */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Partial prerendering needs a server, so it is off for the static export.
  cacheComponents: !isStaticExport,
  partialPrefetching: !isStaticExport,
  ...(isStaticExport && {
    output: "export",
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
