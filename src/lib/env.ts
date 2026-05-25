export default {
  DEBUG: process.env.DEBUG === "true",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API,
  NEXT_PUBLIC_PLUGIN_API: process.env.NEXT_PUBLIC_PLUGIN_API,
  CONSTRUCTOR_URL: process.env.CONSTRUCTOR_URL,
  ADMIN_PANEL: process.env.ADMIN_PANEL,
  // Shared with dashboard — must be the exact same value as dashboard's SESSION_SECRET.
  SESSION_SECRET: process.env.SESSION_SECRET ?? "dev-secret-change-me-please-32chars",
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? "bm_session",
  // Set in production to share the cookie across subdomains, e.g. ".botmother.uz".
  SESSION_COOKIE_DOMAIN: process.env.SESSION_COOKIE_DOMAIN,
  // Where to send the user when no session exists — dashboard handles auth.
  DASHBOARD_URL: process.env.DASHBOARD_URL ?? process.env.ADMIN_PANEL ?? "http://localhost:3000",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
};
