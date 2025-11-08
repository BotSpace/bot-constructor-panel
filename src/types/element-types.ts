import { CustomNodes } from "@/features/bot-constructor/nodes/";

export interface ElementItemType {
  type:
    | "message"
    | "command"
    | "button"
    | "photo"
    | "video"
    | "audio"
    | "document"
    | "location"
    | "poll"
    | "contact"
    | "sticker"
    | "file"
    | "condition"
    | "reply_button"
    | "callback_button"
    | "callback_query"
    // Special nodes
    | "code"
    | "state"
    | "collection";

  name: string;
  description: string;
  icon: string;
  color: string;
  triggerId: keyof typeof CustomNodes; // Optional, used for triggers
}

export interface ElementTypes {
  title: string;
  elements: ElementItemType[];
}
