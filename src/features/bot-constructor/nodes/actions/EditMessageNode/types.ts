import { OutputData } from "@editorjs/editorjs";
import { ParseMode } from "../TextMessageNode/types";
import { KeyboardConfig } from "@/features/bot-constructor/components";

export type MessageIdSource = "this_message" | "connected_node" | "message_id";

export interface EditMessageNodeData {
  // Message ID ni qayerdan olish
  messageIdSource?: MessageIdSource;
  messageId?: string; // manual bo'lsa

  // Text edit uchun
  newText?: OutputData;
  parseMode?: ParseMode;

  // Caption edit uchun (media uchun)
  newCaption?: string;

  // Keyboard edit uchun
  keyboard: KeyboardConfig;

  // Media edit uchun (photo, video, audio, file)
  mediaType?: "photo" | "video" | "audio" | "file";
  mediaSource?: string; // URL yoki file_id

  // Qo'shimcha sozlamalar
  disableWebPagePreview?: boolean;
}
