import { instance } from "@/services/instance";

/**
 * Telegram bot tokenining yaroqliligini tekshiradi
 * @param token - Telegram bot tokeni
 * @returns yaroqlilik haqida boolean
 */
export async function isTelegramTokenValid(token: string): Promise<boolean> {
  try {
    const response = await instance.get(
      `https://api.telegram.org/bot${token}/getMe`
    );
    const data = await response.data;

    // Telegram API response-da "ok" true bo'lsa, token yaroqli
    return data.ok === true;
  } catch (error) {
    console.error("Token tekshirishda xato:", error);
    return false;
  }
}

// Misol uchun ishlatish
(async () => {
  const token = "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11";
  const isValid = await isTelegramTokenValid(token);
  console.log("Token yaroqlimi?", isValid);
})();
