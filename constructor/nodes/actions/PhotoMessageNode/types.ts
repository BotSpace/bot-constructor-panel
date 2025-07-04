import { ButtonConfig } from "@/constructor/components/ButtonGenerator/types";

/**
 * Foydalanuvchi kimga yuborilishini aniqlaydi.
 * 'sender' - xabarni yuborgan foydalanuvchining o'ziga.
 * 'custom_id' - aniq bir chat yoki foydalanuvchi ID'siga.
 */
export type RecipientType = "sender" | "custom_id";

/**
 * Yuboriladigan rasmning manbasini belgilaydi.
 * 'file_id' - Telegram serverida allaqachon mavjud bo'lgan faylning ID'si.
 * 'url' - rasmga to'g'ridan-to'g'ri havola (link).
 * 'upload' - foydalanuvchi kompyuteridan yangi rasm yuklashi.
 */
export type PhotoSourceType = "file_id" | "url" | "upload";

/**
 * 'Send Photo' tugunining ma'lumotlar strukturasini belgilaydigan interfeys.
 * React Flow'dagi `data` propining tipi.
 */
export interface SendPhotoNodeData {
  // Barcha maydonlar ixtiyoriy (`?`), chunki node yaratilganda ular bo'sh bo'lishi mumkin.

  recipientType?: RecipientType;
  chatId?: string; // `recipientType` 'custom_id' bo'lganda ishlatiladi.

  photoSourceType?: PhotoSourceType;
  photoFileId?: string; // `photoSourceType` 'file_id' bo'lganda ishlatiladi.
  photoUrl?: string; // `photoSourceType` 'url' bo'lganda ishlatiladi.
  // 'upload' uchun alohida maydon qo'shish mumkin, masalan: `uploadedFile?: File`

  caption?: string; // Rasm ostidagi matn (1024 belgacha).

  disableNotification?: boolean; // Foydalanuvchiga ovozsiz xabar yuborish.
  protectContent?: boolean; // Xabarni nusxalash va saqlashni taqiqlash.

  buttons?: ButtonConfig[][];
}
