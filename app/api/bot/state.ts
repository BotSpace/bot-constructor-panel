// FAYL: app/api/bot/state.ts

import fs from "fs/promises";
import path from "path";
import os from "os";

// PID faylini operatsion tizimning vaqtinchalik papkasida saqlaymiz.
// Bu Windows, macOS va Linux'da ishlaydi.
const pidFilePath = path.join(os.tmpdir(), "bot.pid");

export interface PythonProcessState {
  status: "running" | "stopped";
  pid: number | null;
  message: string;
}

/**
 * Jarayon (process) holatini tekshiradi.
 */
export async function getProcessState(): Promise<PythonProcessState> {
  try {
    const pidStr = await fs.readFile(pidFilePath, "utf-8");
    const pid = parseInt(pidStr, 10);

    if (isNaN(pid)) {
      throw new Error("Invalid PID found in pid file.");
    }

    // Jarayonning mavjudligini tekshirish. `kill` bilan 0 signalini yuborish
    // jarayonni o'ldirmaydi, faqat uning mavjudligini tekshiradi.
    process.kill(pid, 0);

    return {
      status: "running",
      pid,
      message: `Python server is running with PID ${pid}.`,
    };
  } catch (error: any) {
    // Agar fayl yo'q bo'lsa (ENOENT) yoki jarayon topilmasa (ESRCH),
    // demak u to'xtatilgan.
    if (error.code === "ENOENT" || error.code === "ESRCH") {
      await clearProcessFile(); // Ortiqcha qolgan faylni tozalash
      return {
        status: "stopped",
        pid: null,
        message: "Python server is not running.",
      };
    }
    // Boshqa kutilmagan xatoliklar uchun
    console.error("Unexpected error in getProcessState:", error);
    throw error; // Xatoni yuqoriga uzatamiz, route.ts uni ushlab oladi
  }
}

/**
 * Yangi jarayonning PID'sini faylga saqlaydi.
 */
export async function saveProcess(pid: number): Promise<void> {
  await fs.writeFile(pidFilePath, pid.toString(), "utf-8");
}

/**
 * PID faylini o'chiradi.
 */
export async function clearProcessFile(): Promise<void> {
  try {
    await fs.unlink(pidFilePath);
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      console.error("Failed to clear PID file:", error);
    }
  }
}
