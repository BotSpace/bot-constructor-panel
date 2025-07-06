import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { getNgrokProcessState, saveNgrokProcess } from "../state";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const currentState = await getNgrokProcessState();
    if (currentState.status === "running") {
      return NextResponse.json(
        { message: `Ngrok already running.`, url: await getNgrokUrl() },
        { status: 200 }
      );
    }

    // Ngrok jarayonini ishga tushiramiz
    const child = spawn("ngrok", ["http", "8000"], {
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.unref();

    if (!child.pid) throw new Error("Failed to get ngrok PID.");

    await saveNgrokProcess(child.pid);

    // Ngrok URL tayyor bo‘lishi uchun biroz kutamiz (1-2 sekund yetadi)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const ngrokUrl = await getNgrokUrl();

    if (!ngrokUrl) {
      throw new Error("Ngrok URL topilmadi.");
    }

    return NextResponse.json({
      message: `Ngrok started with PID ${child.pid}.`,
      url: ngrokUrl,
    });
  } catch (error: any) {
    console.error("Error in /api/ngrok/run:", error);
    return NextResponse.json(
      { message: "Failed to start ngrok.", error: error.message },
      { status: 500 }
    );
  }
}

// Ngrok API dan tunnel URL ni olish
async function getNgrokUrl(): Promise<string | null> {
  try {
    const response = await axios.get("http://127.0.0.1:4040/api/tunnels");
    if (response.data.tunnels.length > 0) {
      return response.data.tunnels[0].public_url;
    }
    return null;
  } catch (error) {
    console.error("Ngrok API dan URL olishda xato:", error);
    return null;
  }
}
