import fs from "fs/promises";
import path from "path";
import os from "os";

// PID faylini operatsion tizimning vaqtinchalik papkasida saqlaymiz.
const pidFilePath = path.join(os.tmpdir(), "ngrok.pid");

export interface NgrokProcessState {
  status: "running" | "stopped";
  pid: number | null;
  message: string;
}

/**
 * Jarayon (ngrok process) holatini tekshiradi.
 */
export async function getNgrokProcessState(): Promise<NgrokProcessState> {
  try {
    const pidStr = await fs.readFile(pidFilePath, "utf-8");
    const pid = parseInt(pidStr, 10);

    if (isNaN(pid)) {
      throw new Error("Invalid PID found in ngrok pid file.");
    }

    // Jarayonning mavjudligini tekshirish
    process.kill(pid, 0);

    return {
      status: "running",
      pid,
      message: `Ngrok is running with PID ${pid}.`,
    };
  } catch (error: any) {
    // Agar fayl yo'q bo'lsa yoki jarayon topilmasa
    if (error.code === "ENOENT" || error.code === "ESRCH") {
      await clearNgrokProcessFile();
      return {
        status: "stopped",
        pid: null,
        message: "Ngrok is not running.",
      };
    }

    console.error("Unexpected error in getNgrokProcessState:", error);
    throw error;
  }
}

/**
 * Yangi jarayonning PID'sini faylga saqlaydi.
 */
export async function saveNgrokProcess(pid: number): Promise<void> {
  await fs.writeFile(pidFilePath, pid.toString(), "utf-8");
}

/**
 * PID faylini o'chiradi.
 */
export async function clearNgrokProcessFile(): Promise<void> {
  try {
    await fs.unlink(pidFilePath);
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      console.error("Failed to clear ngrok PID file:", error);
    }
  }
}
