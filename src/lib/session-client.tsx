"use client";

/**
 * Drop-in client-side session API that mirrors `next-auth/react`'s shape.
 *
 * - `useSession()` returns `{ data, status, refresh }` where `data` shape is
 *   compatible with the old code (`data?.user?.access`).
 * - `getSession()` returns a `Session | null` for one-off reads.
 *
 * Source of truth: the shared `bm_session` cookie issued by the dashboard,
 * read server-side via the `/api/session` route handler in this app.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type SessionUser = {
  id: string | number;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  /** Access token attached for convenience — matches old next-auth shape. */
  access?: string;
};

export type Session = {
  user: SessionUser;
};

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type Ctx = {
  data: Session | null;
  status: SessionStatus;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<Ctx>({
  data: null,
  status: "loading",
  refresh: async () => {},
});

// `basePath` is applied by Next.js routing but NOT by raw fetch() URLs, so we
// prepend it explicitly — otherwise `/api/session` resolves at the origin
// root (which serves a different app).
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

async function fetchSession(): Promise<Session | null> {
  try {
    const r = await fetch(`${BASE_PATH}/api/session`, { cache: "no-store" });
    if (!r.ok) return null;
    const json = (await r.json()) as { user?: SessionUser | null; access?: string };
    if (!json?.user) return null;
    return { user: { ...json.user, access: json.access } };
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Session | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  const refresh = useCallback(async () => {
    const next = await fetchSession();
    setData(next);
    setStatus(next ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SessionContext.Provider value={{ data, status, refresh }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

export async function getSession(): Promise<Session | null> {
  return fetchSession();
}

let validAccessPromise: Promise<string | null> | null = null;

function tokenExpiresSoon(token: string, leewaySeconds = 60): boolean {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return true;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = JSON.parse(atob(normalized)) as { exp?: number };
    return typeof payload.exp !== "number" || payload.exp <= Date.now() / 1000 + leewaySeconds;
  } catch {
    return true;
  }
}

/**
 * Returns an access token that is safe to use for a new long-lived connection.
 * Unlike getSession(), this refreshes an expired/near-expiry access token using
 * the httpOnly refresh token. WebSocket reconnects must use this helper: after
 * a tab has stayed open longer than the access-token TTL, repeatedly reading
 * the old cookie would otherwise make every reconnect fail until page refresh.
 */
export function getValidAccessToken(): Promise<string | null> {
  if (!validAccessPromise) {
    validAccessPromise = fetchSession()
      .then(async (session) => {
        const access = session?.user?.access;
        if (access && !tokenExpiresSoon(access)) return access;

        const response = await fetch(`${BASE_PATH}/api/session`, {
          method: "POST",
          cache: "no-store",
        });
        if (!response.ok) return null;
        const data = (await response.json()) as { access?: string };
        return data.access ?? null;
      })
      .catch(() => null)
      .finally(() => {
        validAccessPromise = null;
      });
  }
  return validAccessPromise;
}
