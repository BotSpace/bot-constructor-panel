import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isMono = process.env.MONO === "1";

/** @type {import('next').NextConfig} */
const nextConfig = isMono
  ? {
      output: 'standalone',
  }
  : {
      output: 'standalone',
      // switch when use port
      basePath: "/share",
      assetPrefix: "/share",
      images: {
        path: "/share/_next/image",
      },
    };

module.exports = withNextIntl(nextConfig);
