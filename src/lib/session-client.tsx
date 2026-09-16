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
  useRef,
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

const REQUEST_TIMEOUT_MS = 8_000;

// Race the entire operation, not just headers: body reads can stall too. Abort
// alone is insufficient for transports that settle late or ignore the signal.
async function boundedRequest<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  parentSignal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  const deadline = Date.now() + REQUEST_TIMEOUT_MS;
  let cancel!: () => void;
  const cancelled = new Promise<never>((_, reject) => {
    cancel = () => {
      controller.abort();
      reject(new Error("Session request cancelled or timed out"));
    };
  });
  const timer = setTimeout(cancel, REQUEST_TIMEOUT_MS);
  parentSignal?.addEventListener("abort", cancel, { once: true });
  try {
    if (parentSignal?.aborted) cancel();
    const result = await Promise.race([
      Promise.resolve().then(() => {
        controller.signal.throwIfAborted();
        return operation(controller.signal);
      }),
      cancelled,
    ]);
    // Timers may have been suspended in a background tab.
    if (Date.now() >= deadline) cancel();
    controller.signal.throwIfAborted();
    return result;
  } finally {
    clearTimeout(timer);
    parentSignal?.removeEventListener("abort", cancel);
  }
}

async function sessionJSON(signal: AbortSignal, method = "GET") {
  signal.throwIfAborted();
  const response = await fetch(`${BASE_PATH}/api/session`, {
    method,
    cache: "no-store",
    signal,
  });
  signal.throwIfAborted();
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Session request failed: ${response.status}`);
  const json = await response.json();
  signal.throwIfAborted();
  return json;
}

async function readSession(signal: AbortSignal): Promise<Session | null> {
  const json = await sessionJSON(signal);
  if (json === null || json?.user === null) return null;
  if (!json?.user || typeof json.user !== "object") {
    throw new Error("Invalid session response");
  }
  return { user: { ...json.user, access: json.access } };
}

function fetchSession(signal?: AbortSignal): Promise<Session | null> {
  return boundedRequest(readSession, signal);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Session | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  const refreshRef = useRef<() => Promise<void>>(async () => {});
  const refresh = useCallback(() => refreshRef.current(), []);

  useEffect(() => {
    let disposed = false;
    let pending: Promise<void> | null = null;
    let controller: AbortController | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryDelay = 1_000;
    const canRetry = () => navigator.onLine !== false && document.visibilityState === "visible";
    const clearRetry = () => {
      clearTimeout(retryTimer);
      retryTimer = undefined;
    };
    const run = (): Promise<void> => {
      if (disposed) return Promise.resolve();
      if (pending) return pending;
      clearRetry();
      controller = new AbortController();
      pending = fetchSession(controller.signal)
        .then((next) => {
          if (disposed) return;
          setData(next);
          setStatus(next ? "authenticated" : "unauthenticated");
          retryDelay = 1_000;
        })
        .catch(() => {
          if (disposed) return;
          // Unknown is not unauthenticated. Keep bootstrap loading (or the
          // last confirmed session) until an authoritative response arrives.
          retryTimer = setTimeout(() => {
            retryTimer = undefined;
            if (canRetry()) void run();
          }, retryDelay);
          retryDelay = Math.min(retryDelay * 2, 30_000);
        })
        .finally(() => {
          pending = null;
          controller = null;
        });
      return pending;
    };
    const recover = () => {
      if (canRetry()) void run();
    };
    refreshRef.current = run;
    window.addEventListener("online", recover);
    window.addEventListener("focus", recover);
    document.addEventListener("visibilitychange", recover);
    void run();
    return () => {
      disposed = true;
      clearRetry();
      controller?.abort();
      window.removeEventListener("online", recover);
      window.removeEventListener("focus", recover);
      document.removeEventListener("visibilitychange", recover);
      refreshRef.current = async () => {};
    };
  }, []);

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
  return fetchSession().catch(() => null);
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
    validAccessPromise = boundedRequest(async (signal) => {
      const session = await readSession(signal);
      if (!session) return null;
      const access = session.user.access;
      if (access && !tokenExpiresSoon(access)) return access;

      const data = await sessionJSON(signal, "POST");
      return typeof data?.access === "string" ? data.access : null;
    })
      .catch(() => null)
      .finally(() => {
        validAccessPromise = null;
      });
  }
  return validAccessPromise;
}
