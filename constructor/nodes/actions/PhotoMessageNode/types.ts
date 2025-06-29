// types.ts

export type PhotoSourceType = "file_id" | "url" | "upload";
export type RecipientType = "sender" | "custom_id";

export interface SendPhotoNodeData {
  recipientType: RecipientType;
  chatId: string; // Agar recipientType 'custom_id' bo'lsa ishlatiladi

  photoSourceType: PhotoSourceType;
  photoFileId: string; // 'file_id' uchun
  photoUrl: string; // 'url' uchun
  photoUploadId?: string; // Yuklangan fayl uchun vaqtinchalik ID yoki yo'l

  caption: string;
  parseMode: "HTML" | "MarkdownV2" | "None";

  disableNotification: boolean;
  protectContent: boolean;
}
