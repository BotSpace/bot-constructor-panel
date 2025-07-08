import { ButtonConfig } from "@/constructor/components/ButtonGenerator";
import { KeyboardConfig } from "../TextMessageNode/types";

/**
 * Foydalanuvchi kimga yuborilishini aniqlaydi.
 */
export type RecipientType = "sender" | "custom_id";

/**
 * Yuboriladigan faylning manbasini belgilaydi.
 */
export type FileSourceType = "file_id" | "url" | "upload";

/**
 * 'Send File' tugunining ma'lumotlar strukturasini belgilaydigan interfeys.
 */
export interface SendFileNodeData {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };

  fileSourceType?: FileSourceType;
  fileId?: string;
  fileUrl?: string;

  caption?: string;

  // Maxsus muqova (thumbnail)
  hasCustomThumbnail?: boolean;
  thumbnailFileId?: string;

  // Faylga xos sozlamalar
  disableContentTypeDetection?: boolean; // MIME turini aniqlashni o'chirish

  // Umumiy sozlamalar
  disableNotification?: boolean;
  protectContent?: boolean;

  keyboard?: KeyboardConfig;
}
