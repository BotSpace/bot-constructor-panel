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
  recipientType?: RecipientType;
  chatId?: string;

  audioSourceType?: AudioSourceType;
  audioFileId?: string;
  audioUrl?: string;

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
}
