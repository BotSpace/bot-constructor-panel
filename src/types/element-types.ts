import { ReactNode } from "react";

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
    | "elseif"
    | "else"
    | "reply_button"
    | "callback_button"
    | "callback_query"
    | "edit_message"
    | "edit_or_send_message"
    // New media types
    | "animation"
    | "voice"
    | "video_note"
    // Message operations
    | "forward_message"
    | "send_to_admin"
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
    | "form"
    | "for_loop"
    | "for_loop_continue"
    // Integration
    | "http_request"
    | "callback_answer"
    // Special nodes
    | "code"
    | "state"
    | "collection"
    | "cron"
    | "load_collection_item"
    | "subflow"
    | "subflow_exit"
    | "plugin";
  name: string;
  description: string;
  icon: ReactNode | string;
  color: string;
  triggerId: string;
  defaultData?: Record<string, unknown>;
  /** Optional role badge (Trigger/Action/Integration/...) for nodes whose group
   *  doesn't map to a fixed role — e.g. module nodes mixing triggers + actions. */
  role?: string;
}

export interface ElementTypes {
  title: string;
  id?: string;
  elements: ElementItemType[];
}
