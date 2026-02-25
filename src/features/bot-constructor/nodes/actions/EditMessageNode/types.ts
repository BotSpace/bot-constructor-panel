import { KeyboardConfig } from "@/features/bot-constructor/components";
import { DynamicMessage, ParseMode } from "../shared/types";
import { HandlerData } from "../TextMessageNode/types";

export type MessageIdSource = "this_message" | "connected_node" | "message_id";

export interface EditMessageNodeData {
  // Message ID ni qayerdan olish
  messageIdSource: MessageIdSource;
  messageId: string | null; // manual bo'lsa

  // Text edit uchun
  newText: string;
  parseMode: ParseMode;

  // Caption edit uchun (media uchun)
  newCaption?: string;

  // Keyboard edit uchun
  keyboard: KeyboardConfig;

  dynamicMessages?: DynamicMessage[];
  handlers?: HandlerData[];
}
