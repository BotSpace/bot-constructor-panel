import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";

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
