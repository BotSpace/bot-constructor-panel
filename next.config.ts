import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// MONO=1 → run at the root (useful for standalone `dev` on :3001).
// Anything else → run under the `/constructor` basePath so the dashboard
// (same origin) can iframe / link to it without subdomains.
const isMono = process.env.MONO === "1";

/** @type {import('next').NextConfig} */
const nextConfig = isMono
  ? {}
  : {
      basePath: "/constructor",
      assetPrefix: "/constructor",
      images: {
        path: "/constructor/_next/image",
      },
    };

module.exports = withNextIntl(nextConfig);
