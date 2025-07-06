import { NextRequest, NextResponse } from "next/server";
import { getNgrokProcessState, clearNgrokProcessFile } from "../state";

export async function POST(req: NextRequest) {
  try {
    const { pid, status } = await getNgrokProcessState();

    if (status === "stopped" || !pid) {
      return NextResponse.json(
        { message: "Ngrok is not running." },
        { status: 400 }
      );
    }

    try {
      // Ngrok jarayonini o‘ldiramiz
      process.kill(pid);

      // PID faylini tozalaymiz
      await clearNgrokProcessFile();

      return NextResponse.json({
        message: `Ngrok process with PID ${pid} stopped successfully.`,
      });
    } catch (killError: any) {
      console.error("Error stopping ngrok process:", killError);
      return NextResponse.json(
        { message: "Failed to stop ngrok process.", error: killError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in /api/ngrok/stop:", error);
    return NextResponse.json(
      { message: "Unexpected error.", error: error.message },
      { status: 500 }
    );
  }
}
