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
    | "media_group"
    | "venue"
    | "dice"
    | "file"
    | "condition"
    | "reply_button"
    | "callback_button"
    | "callback_query"
    | "edit_message"
    // New media types
    | "animation"
    | "voice"
    | "video_note"
    // Message operations
    | "forward_message"
    | "copy_message"
    | "pin_message"
    | "unpin_message"
    | "delete_message"
    | "chat_action"
    // Flow control
    | "delay"
    | "random"
    | "variable"
    | "check_membership"
    // Integration
    | "http_request"
    | "callback_answer"
    // Special nodes
    | "code"
    | "state"
    | "collection"
    | "load_collection_item";

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
