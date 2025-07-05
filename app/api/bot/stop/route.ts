// FAYL: app/api/bot/stop/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getProcessState, clearProcessFile } from "../state";

export async function POST(req: NextRequest) {
  try {
    const currentState = await getProcessState();
    if (currentState.status === "stopped") {
      return NextResponse.json(
        { message: "Server is not running." },
        { status: 400 }
      );
    }

    if (currentState.pid) {
      process.kill(currentState.pid, "SIGTERM");
    }

    await clearProcessFile();
    return NextResponse.json({
      message: `Stop signal sent to process ${currentState.pid}.`,
    });
  } catch (error: any) {
    // Agar to'xtatish paytida jarayon topilmasa ham, faylni tozalab qo'yamiz
    if (error.code === "ESRCH") {
      await clearProcessFile();
      return NextResponse.json({
        message: "Process was not found, likely already stopped.",
      });
    }
    console.error("Error in /api/bot/stop:", error);
    return NextResponse.json(
      { message: "Failed to stop server.", error: error.message },
      { status: 500 }
    );
  }
}
