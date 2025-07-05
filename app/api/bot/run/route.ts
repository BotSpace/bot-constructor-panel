// FAYL: app/api/bot/run/route.ts

import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { getProcessState, saveProcess } from "../state";
import WebSocket from "ws";

// WebSocket client'ni bir marta yaratib, qayta ishlatamiz
let wsClient: WebSocket | null = null;
const WSS_URL = "ws://localhost:8080";

function getWsClient() {
  if (!wsClient || wsClient.readyState === WebSocket.CLOSED) {
    wsClient = new WebSocket(WSS_URL);
    wsClient.on("open", () =>
      console.log("[API Route] Log serveriga ulanildi.")
    );
    wsClient.on("error", (err) =>
      console.error("[API Route] WS xatoligi:", err.message)
    );
  }
  return wsClient;
}

// Loglarni yuborish uchun yordamchi funksiya
function sendLog(log: string) {
  const client = getWsClient();
  if (client.readyState === WebSocket.OPEN) {
    client.send(log);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentState = await getProcessState();
    if (currentState.status === "running") {
      return NextResponse.json(
        { message: `Already running.` },
        { status: 400 }
      );
    }

    const pythonExecutable = "/home/kumo/workspace/dvijok/.venv/bin/python";
    const pythonProjectPath = "/home/kumo/workspace/dvijok";

    // MUHIM: `stdio`'ni `ignore`'dan o'zgartiramiz, chunki bizga loglar kerak!
    const child = spawn(
      pythonExecutable,
      // "main:app" o'rniga "app.main:app" ishlatamiz.
      // --reload'ni olib tashlaymiz, chunki jarayonni o'zimiz boshqaramiz.
      ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
      {
        cwd: pythonProjectPath,
        detached: true,
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
    child.stdout.on("data", (data) => {
      const logMessage = data.toString();
      console.log(`[Python stdout]: ${logMessage}`);
      sendLog(logMessage);
    });

    child.stderr.on("data", (data) => {
      const logMessage = `ERROR: ${data.toString()}`;
      console.error(`[Python stderr]: ${logMessage}`);
      sendLog(logMessage);
    });

    child.unref();

    if (!child.pid) throw new Error("Failed to get PID.");

    await saveProcess(child.pid);
    return NextResponse.json({
      message: `Server started with PID ${child.pid}.`,
    });
  } catch (error: any) {
    console.error("Error in /api/bot/run:", error);
    return NextResponse.json(
      { message: "Failed to start server.", error: error.message },
      { status: 500 }
    );
  }
}
