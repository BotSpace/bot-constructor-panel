import { ButtonConfig } from "@/constructor/components/ButtonGenerator";

/**
 * Foydalanuvchi kimga yuborilishini aniqlaydi.
 */
export type RecipientType = "sender" | "custom_id";

/**
 * Yuboriladigan videoning manbasini belgilaydi.
 */
export type VideoSourceType = "file_id" | "url" | "upload";

/**
 * 'Send Video' tugunining ma'lumotlar strukturasini belgilaydigan interfeys.
 */
export interface SendVideoNodeData {
  recipientType?: RecipientType;
  chatId?: string;

  videoSourceType?: VideoSourceType;
  videoFileId?: string;
  videoUrl?: string;

  caption?: string;

  // Video-spetsifik parametrlar
  duration?: string; // soniyalarda
  width?: string; // piksellarda
  height?: string; // piksellarda
  supportsStreaming?: boolean; // Oqimli uzatishni qo'llab-quvvatlash

  // Maxsus muqova (thumbnail)
  hasCustomThumbnail?: boolean;
  thumbnailFileId?: string;

  // Umumiy sozlamalar
  disableNotification?: boolean;
  protectContent?: boolean;

  buttons?: ButtonConfig[][];
}
