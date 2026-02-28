import { KeyboardConfig } from "@/features/bot-constructor/components";
import { HandlerData } from "../TextMessageNode/types";

export interface MediaItem {
  type: "photo" | "video" | "audio" | "document";
  sourceType: "file_id" | "url";
  fileId?: string;
  url?: string;
  caption?: string;
}

export interface MediaGroupNodeData {
  mediaItems?: MediaItem[];
  disableNotification?: boolean;
  keyboard: KeyboardConfig;
  handlers?: HandlerData[];
}
