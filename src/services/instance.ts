import axios, { type AxiosRequestConfig } from "axios";
import { getSession } from "@/lib/session-client";

// Backend paths in the codebase are hardcoded as "/api/v1/...". In prod the
// gateway rewrites "/api/v2" -> the new Go backend's "/api/v1", so this
// prefix is read from env instead of being hardcoded here. Localhost keeps
// hitting the Go backend's real "/api/v1" directly (unset -> default).
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "/api/v1";

function apiRoot() {
  return (process.env.NEXT_PUBLIC_API ?? "")
    .replace(/\/+$/, "")
    .replace(/\/api(?:\/v\d+)?$/, "");
}

export const API_BASE_URL = `${apiRoot()}${API_PREFIX}`;

export const instanceAuth = axios.create({
  baseURL: API_BASE_URL,
});

export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
});

// Attach the bearer from the shared `bm_session` cookie (issued by the
// dashboard). Middleware proactively refreshes the access token, so by the
// time this runs the cookie usually holds a valid token.
instanceAuth.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    const access = session?.user?.access;
    if (access) config.headers["Authorization"] = `Bearer ${access}`;
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// `basePath` is applied by Next.js routing but NOT by raw fetch() URLs, so we
// prepend it explicitly — otherwise `/api/session` resolves at the origin root
// (which serves a different app). Mirrors session-client.tsx.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Marks a request we've already retried once after a refresh, so a request that
// still 401s post-refresh does NOT loop forever.
type RetriableConfig = AxiosRequestConfig & { _retried?: boolean };

// Single-flight refresh: concurrent 401s share one /api/session POST instead of
// firing a refresh storm. Resolves to the fresh access token, or null on failure.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_PATH}/api/session`, {
      method: "POST",
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok) return null;
        const json = (await r.json()) as { access?: string };
        return json?.access ?? null;
      })
      .catch(() => null)
      .finally(() => {
        // Clear so a later 401 can trigger a fresh refresh.
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// On a 401 (token died between the middleware pass and this fetch) do a SINGLE
// silent refresh + retry — no full page reload, so unsaved canvas state is
// preserved. Only if the refresh itself fails do we fall back to reloading the
// page (which sends the user through middleware → dashboard /login).
instanceAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const config = error?.config as RetriableConfig | undefined;

    if (status === 401 && config && !config._retried && typeof window !== "undefined") {
      config._retried = true;
      const access = await refreshAccessToken();
      if (access) {
        // Retry the original request with the refreshed bearer. The request
        // interceptor re-reads the (now-rotated) cookie too, but set it here
        // explicitly so we don't race the cookie propagation.
        config.headers = config.headers ?? {};
        config.headers["Authorization"] = `Bearer ${access}`;
        return instanceAuth(config);
      }
      // Refresh impossible — reload so middleware redirects to dashboard /login.
      window.location.reload();
    }
    return Promise.reject(error);
  }
);
