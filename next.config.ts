import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // three.js ships untranspiled ESM that Next must compile for the App Router
  transpilePackages: ["three"],
  images: {
    remotePatterns: [
      // ImgBB — menu item image hosting (required by the assignment)
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "*.ibb.co" },
      // Google avatar images
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
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
