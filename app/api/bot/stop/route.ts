// FAYL: app/api/bot/stop/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getProcessState, clearProcessFile } from "../state";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const currentState = await getProcessState();
    if (currentState.status === "stopped") {
      return NextResponse.json(
        { message: "Server is not running." },
        { status: 200 }
      );
    }

    const ngrok = await axios.post("http://localhost:3000/api/ngrok/stop");

    if (ngrok.status !== 200) {
      throw new Error("Failed to stop ngrok.");
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
