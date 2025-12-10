import {
  ButtonConfig,
  KeyboardConfig,
} from "@/features/bot-constructor/components/ButtonGenerator/types";
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
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };

  photoSourceType?: PhotoSourceType;
  photoFileId?: string; // `photoSourceType` 'file_id' bo'lganda ishlatiladi.
  photoUrl?: string; // `photoSourceType` 'url' bo'lganda ishlatiladi.
  uploadedFileUuid?: string; // `photoSourceType` 'upload' bo'lganda ishlatiladi - backend'dan qaytgan UUID

  caption?: string; // Rasm ostidagi matn (1024 belgacha).

  disableNotification?: boolean; // Foydalanuvchiga ovozsiz xabar yuborish.
  protectContent?: boolean; // Xabarni nusxalash va saqlashni taqiqlash.

  keyboard?: KeyboardConfig;
}
