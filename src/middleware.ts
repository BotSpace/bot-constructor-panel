import { withAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { localeConfig } from "./i18n/routing";


const intlMiddleware = createIntlMiddleware(localeConfig);

// Public route’larni aniqlaymiz
const publicPaths = [
  new RegExp(`^\\/(${localeConfig.locales.join("|")})\\/website(?:\\/.*)?$`),
  new RegExp(`^\\/website(?:\\/.*)?$`),
];

const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (publicPaths.some((pattern) => pattern.test(req.nextUrl.pathname))) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: "/uz/auth",
      signOut: "/uz/website",
    },
  }
);

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(uz|en|ru|jp)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};


export default authMiddleware;

