// FAYL: app/api/bot/restart/route.ts

import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { getProcessState, saveProcess, clearProcessFile } from "../state";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    // 1. Joriy jarayonni to'xtatish
    try {
      const currentState = await getProcessState();
      if (currentState.status === "running" && currentState.pid) {
        process.kill(currentState.pid, "SIGTERM");
      }
    } catch (error: any) {
      if (error.code !== "ESRCH")
        console.warn(
          "Could not stop old process during restart:",
          error.message
        );
    }
    await clearProcessFile();

    // Qisqa pauza, port bo'shashi uchun
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 2. Yangi jarayonni ishga tushirish
    // --- MUHIM: BU YERNI O'ZINGIZGA MOSLAB O'ZGARTIRING ---
    const pythonExecutable = "/home/kumo/workspace/dvijok/.venv/bin/python";
    const pythonProjectPath = "/home/kumo/workspace/dvijok";
    // ----------------------------------------------------

    const ngrok = await axios.get("http://localhost:3000/api/ngrok/start");

    if (ngrok.status !== 200) {
      throw new Error("Failed to start ngrok.");
    }

    const child = spawn(
      pythonExecutable,
      ["-m", "uvicorn", "app.main:app", "--reload"],
      {
        cwd: pythonProjectPath,
        detached: true,
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
          BASE_WEBHOOK_URL: ngrok.data.url,
        },
      }
    );

    child.unref();

    if (!child.pid) {
      throw new Error("Failed to get PID for the new process on restart.");
    }

    await saveProcess(child.pid);
    return NextResponse.json({
      message: `Server restarted with new PID ${child.pid}.`,
      pid: child.pid,
    });
  } catch (error: any) {
    console.error("Error in /api/bot/restart:", error);
    return NextResponse.json(
      { message: "Failed to restart server.", error: error.message },
      { status: 500 }
    );
  }
}
