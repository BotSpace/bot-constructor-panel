import "server-only";
import { cookies } from "next/headers";
import { jwtVerify } from "jose/jwt/verify";
import env from "@/lib/env";

export type SessionUser = {
  id: string | number;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;
};

export type SessionPayload = {
  access: string;
  refresh: string;
  user: SessionUser;
};

const secret = () => new TextEncoder().encode(env.SESSION_SECRET);

export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(env.SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function readAccessToken(): Promise<string | null> {
  const s = await readSession();
  return s?.access ?? null;
}
