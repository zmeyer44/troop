/** @type {import('next').NextConfig} */
const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin");
module.exports = {
  transpilePackages: ["@repo/ui", "@repo/utils"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
  async rewrites() {
    return [
      {
        source: "/event/:key",
        destination: "/events/:key",
      },
      {
        source: "/.well-known/nostr.json",
        destination: "/api/well-known/nostr",
      },
    ];
  },
};
