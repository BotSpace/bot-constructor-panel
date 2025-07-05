// FAYL: app/api/bot/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getProcessState } from "../state";

export async function GET(req: NextRequest) {
  try {
    const state = await getProcessState();
    return NextResponse.json(state);
  } catch (error: any) {
    console.error("Error in /api/bot/status:", error);
    return NextResponse.json(
      {
        status: "stopped",
        pid: null,
        message: `Error checking status: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
