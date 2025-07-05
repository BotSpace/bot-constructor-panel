import { ButtonConfig } from "@/constructor/components/ButtonGenerator/types";

/**
 * Foydalanuvchi kimga yuborilishini aniqlaydi.
 * 'sender' - xabarni yuborgan foydalanuvchining o'ziga.
 * 'custom_id' - aniq bir chat yoki foydalanuvchi ID'siga.
 */
export type RecipientType = "sender" | "custom_id";

/**
 * Xabar matnini qanday formatda yuborishni belgilaydi.
 */
export type ParseMode = "HTML" | "MarkdownV2" | "None";

/**
 * 'Send Text Message' tugunining ma'lumotlar strukturasini belgilaydigan interfeys.
 * React Flow'dagi `data` propining tipi.
 */
export interface SendTextMessageNodeData {
  /** Yuboruvchidan tashqari qo'shimcha oluvchi ID'lar ro'yxati */
  recipients?: {
    /** Xabar yuboruvchining o'ziga yuborilsinmi? (standart: true) */
    sendToSender: boolean;
    /** Qo'shimcha ID'lar ro'yxati */
    additionalIds: string[];
  };

  messageText?: string; // Yuboriladigan xabar matni (4096 belgacha).
  parseMode?: ParseMode;

  disableWebPagePreview?: boolean; // Xabardagi linklar uchun oldindan ko'rishni o'chirish.
  disableNotification?: boolean; // Foydalanuvchiga ovozsiz xabar yuborish.
  protectContent?: boolean; // Xabarni nusxalash va saqlashni taqiqlash.
  buttons?: ButtonConfig[][];
}
