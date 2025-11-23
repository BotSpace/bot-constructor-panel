import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const isMono = process.env.MONO === "1";

/** @type {import('next').NextConfig} */
const nextConfig = isMono
  ? {}
  : {
      // switch when use port
      basePath: "/share",
      assetPrefix: "/share",
      images: {
        path: "/share/_next/image",
      },
    };

module.exports = withNextIntl(nextConfig);
