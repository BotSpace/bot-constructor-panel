import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose/jwt/sign";
import { readSession } from "@/lib/session";
import env from "@/lib/env";

/**
 * Client-facing session endpoint.
 *
 * Returns `{ user, access }` when the shared `bm_session` cookie is valid,
 * or `{ user: null }` otherwise. The refresh token is intentionally NOT
 * exposed to the client — token rotation is handled by middleware.
 */
export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ user: null }, { headers: { "cache-control": "no-store" } });
  }
  return NextResponse.json(
    { user: session.user, access: session.access },
    { headers: { "cache-control": "no-store" } }
  );
}

// Session JWT lifetime mirrors the dashboard's REFRESH_TOKEN_TTL_SEC (30 days).
const SESSION_JWT_TTL_SEC = 60 * 60 * 24 * 30;

/**
 * Silent refresh endpoint.
 *
 * `instanceAuth` calls this after a 401 (the access token died between the
 * middleware pass and the API fetch). Middleware normally rotates the token,
 * but its matcher skips `/api/*` and the direct API request never passes
 * through it — so the client cannot rely on a page reload to refresh without
 * losing unsaved canvas state. Here we rotate server-side using the httpOnly
 * refresh token (never exposed to JS), re-issue the `bm_session` cookie, and
 * hand back the fresh access token for the retry.
 *
 * Returns `{ access }` on success, or 401 when refresh is impossible (the
 * interceptor then falls back to redirecting to the dashboard login).
 */
export async function POST() {
  const session = await readSession();
  const refresh = session?.refresh;
  if (!session || !refresh || !env.NEXT_PUBLIC_API) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  // Go backend: POST /api/v1/auth/refresh { refresh_token } ->
  // { access_token, refresh_token, ... }. The prefix lets prod rewrite this to
  // /api/v2 (gateway -> new Go backend) while localhost hits /api/v1 directly.
  const apiRoot = env.NEXT_PUBLIC_API.replace(/\/+$/, "").replace(/\/api(?:\/v\d+)?$/, "");
  const url = apiRoot + env.NEXT_PUBLIC_API_PREFIX + "/auth/refresh";

  let access: string | undefined;
  let newRefresh = refresh;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    });
    if (!r.ok) {
      return NextResponse.json({ error: "refresh_failed" }, { status: 401 });
    }
    const data = (await r.json()) as Record<string, unknown>;
    access = data?.access_token as string | undefined;
    newRefresh = (data?.refresh_token as string | undefined) ?? refresh;
  } catch {
    return NextResponse.json({ error: "refresh_failed" }, { status: 401 });
  }
  if (!access) {
    return NextResponse.json({ error: "refresh_failed" }, { status: 401 });
  }

  // Re-issue the session cookie with the rotated tokens so subsequent reads
  // (RSC, /api/session GET) see the fresh access token.
  const cookie = await new SignJWT({ ...session, access, refresh: newRefresh })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_JWT_TTL_SEC}s`)
    .sign(new TextEncoder().encode(env.SESSION_SECRET));

  const store = await cookies();
  store.set(env.SESSION_COOKIE_NAME, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_JWT_TTL_SEC,
    ...(env.SESSION_COOKIE_DOMAIN ? { domain: env.SESSION_COOKIE_DOMAIN } : {}),
  });

  return NextResponse.json({ access }, { headers: { "cache-control": "no-store" } });
}
