// FAYL: app/api/bot/run/route.ts

import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { getProcessState, saveProcess } from "../state";
import WebSocket from "ws";
import axios from "axios";

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

    const pythonExecutable =
      "/home/kumo/workspace/botmather/engine/.venv/bin/python";
    const pythonProjectPath = "/home/kumo/workspace/botmather/engine";

    const ngrok = await axios.get("http://localhost:3000/api/ngrok/start");

    if (ngrok.status !== 200) {
      throw new Error("Failed to start ngrok.");
    }

    // MUHIM: `stdio`'ni `ignore`'dan o'zgartiramiz, chunki bizga loglar kerak!
    const child = spawn(
      pythonExecutable,
      [
        "-m",
        "uvicorn",
        "app.main:app",
        "--reload",
        "--reload-dir",
        "/home/kumo/workspace/botmather/engine",
        "--port",
        "8000",
      ],
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
