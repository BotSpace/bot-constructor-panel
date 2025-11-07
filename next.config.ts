import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // switch when use port
  basePath: "/share",
  assetPrefix: "/share",
  images: {
    path: "/share/_next/image",
  },
};

module.exports = withNextIntl(nextConfig);
