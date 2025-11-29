import { ButtonConfig } from "@/features/bot-constructor/components/ButtonGenerator";
import { KeyboardConfig } from "../TextMessageNode/types";

/**
 * Foydalanuvchi kimga yuborilishini aniqlaydi.
 */
export type RecipientType = "sender" | "custom_id";

/**
 * Yuboriladigan audioning manbasini belgilaydi.
 */
export type AudioSourceType = "file_id" | "url" | "upload";

/**
 * 'Send Audio' tugunining ma'lumotlar strukturasini belgilaydigan interfeys.
 */
export interface SendAudioNodeData {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };

  audioSourceType?: AudioSourceType;
  audioFileId?: string;
  audioUrl?: string;
  uploadedFileUuid?: string; // `audioSourceType` 'upload' bo'lganda ishlatiladi - backend'dan qaytgan UUID

  caption?: string;

  // Audio-spetsifik parametrlar
  duration?: string; // soniyalarda
  performer?: string; // ijrochi
  title?: string; // qo'shiq nomi

  // Maxsus muqova (thumbnail)
  hasCustomThumbnail?: boolean;
  thumbnailFileId?: string;

  // Umumiy sozlamalar
  disableNotification?: boolean;
  protectContent?: boolean;

  keyboard?: KeyboardConfig; // <-- O'ZGARISH SHU YERDA
}
