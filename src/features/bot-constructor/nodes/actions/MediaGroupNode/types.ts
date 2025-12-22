import { KeyboardConfig } from "@/features/bot-constructor/components";

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
}
