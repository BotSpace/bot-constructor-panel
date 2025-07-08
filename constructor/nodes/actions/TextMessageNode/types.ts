import { ButtonConfig } from "@/constructor/components/ButtonGenerator/types";

export type KeyboardType = "inline" | "reply";

// --- Yengi qo'shiladigan struktura ---
export interface KeyboardConfig {
  active: KeyboardType;
  inline: ButtonConfig[][];
  reply: ButtonConfig[][];
}

export type ParseMode = "HTML" | "MarkdownV2" | "None";

export interface SendTextMessageNodeData {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };
  messageText?: string;
  parseMode?: ParseMode;
  disableWebPagePreview?: boolean;
  disableNotification?: boolean;
  protectContent?: boolean;

  // `buttons` va `keyboardType` o'rniga bitta obyekt keladi
  keyboard?: KeyboardConfig; // <-- O'ZGARISH SHU YERDA
}
