import { KeyboardConfig, ParseMode } from "../TextMessageNode/types";

export type EditMessageType = "text" | "caption" | "keyboard" | "media";

export type MessageIdSource = "context" | "previous_node" | "manual";

export interface EditMessageNodeData {
  // Message ID ni qayerdan olish
  messageIdSource?: MessageIdSource;
  messageId?: string; // manual bo'lsa

  // Edit qilish turi
  editType?: EditMessageType;

  // Text edit uchun
  newText?: string;
  parseMode?: ParseMode;

  // Caption edit uchun (media uchun)
  newCaption?: string;

  // Keyboard edit uchun
  keyboard?: KeyboardConfig;

  // Media edit uchun (photo, video, audio, file)
  mediaType?: "photo" | "video" | "audio" | "file";
  mediaSource?: string; // URL yoki file_id

  // Qo'shimcha sozlamalar
  disableWebPagePreview?: boolean;
}
