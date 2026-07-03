import axios from "axios";
import { getSession } from "@/lib/session-client";

// Backend paths in the codebase are hardcoded as "/api/v1/...". In prod the
// gateway rewrites "/api/v2" -> the new Go backend's "/api/v1", so this
// prefix is read from env instead of being hardcoded here. Localhost keeps
// hitting the Go backend's real "/api/v1" directly (unset -> default).
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "/api/v1";

export const instanceAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API + API_PREFIX,
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

// If we still get a 401 (token died between middleware and this fetch), force
// the page to reload so the next middleware pass refreshes — or redirect to
// dashboard /login if refresh is impossible.
instanceAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      // Reload triggers middleware → refresh → cookie updated → retry succeeds.
      // We don't auto-retry here to avoid request storms.
      window.location.reload();
    }
    return Promise.reject(error);
  }
);
