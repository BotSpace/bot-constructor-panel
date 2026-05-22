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
