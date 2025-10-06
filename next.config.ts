import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath dinamik bo'la olmaydi. Uni statik qilib o'rnating.
  // basePath: "/share",
  // // assetPrefix odatda basePath bilan bir xil bo'ladi.
  // assetPrefix: "/share",
  // // next/image komponenti uchun to'g'ri yo'lni ko'rsatish
  // images: {
  //   path: "/share/_next/image",
  // },
};

module.exports = withNextIntl(nextConfig);
