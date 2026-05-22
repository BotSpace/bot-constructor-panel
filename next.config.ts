import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// MONO=1 → run at the root (useful for standalone `dev` on :3001).
// Anything else → run under the `/constructor` basePath so the dashboard
// (same origin) can iframe / link to it without subdomains.
const isMono = process.env.MONO === "1";
const basePath = isMono ? "" : "/constructor";

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
        images: { path: `${basePath}/_next/image` },
      }
    : {}),
  // Expose the basePath at runtime so client-side fetch() calls can prepend
  // it (Next.js does NOT auto-prefix raw fetch URLs).
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

module.exports = withNextIntl(nextConfig);
