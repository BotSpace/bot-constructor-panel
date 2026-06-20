import { KeyboardConfig } from "@/features/bot-constructor/components";
import {
  DynamicMessage,
  ParseMode,
  RecipientConfig,
  RecipientType,
} from "./shared-node-data";
import { MessageTriggerNodeData } from "./trigger-node-data";

export type HandlerData = MessageTriggerNodeData;

export type AudioSourceType = "file_id" | "url" | "upload";
export type FileSourceType = "file_id" | "url" | "upload";
export type PhotoSourceType = "file_id" | "url" | "upload";
export type MessageIdSource = "this_message" | "connected_node" | "message_id";

export interface SendTextMessageNodeData {
  recipients: RecipientConfig;
  messageText: string;
  parseMode: ParseMode;
  disableNotification: boolean;
  protectContent: boolean;
  remove_keyboard?: boolean;
  dynamicMessages?: DynamicMessage[];
  keyboard: KeyboardConfig;
  handlers?: HandlerData[];
}

export interface SendPhotoNodeData {
  recipients?: RecipientConfig;
  photoSourceType?: PhotoSourceType;
  photoFileId?: string;
  photoUrl?: string;
  uploadedFileUuid?: string;
  caption?: string;
  disableNotification?: boolean;
  protectContent?: boolean;
  remove_keyboard?: boolean;
  keyboard: KeyboardConfig;
  handlers?: HandlerData[];
}


export interface SendAudioNodeData {
  recipients?: RecipientConfig;
  audioSourceType?: AudioSourceType;
  audioFileId?: string;
  audioUrl?: string;
  uploadedFileUuid?: string;
  caption?: string;
  duration?: string;
  performer?: string;
  title?: string;
  hasCustomThumbnail?: boolean;
  thumbnailFileId?: string;
  disableNotification?: boolean;
  protectContent?: boolean;
  remove_keyboard?: boolean;
  keyboard: KeyboardConfig;
  handlers?: HandlerData[];
}

export interface SendFileNodeData {
  recipients?: RecipientConfig;
  fileSourceType?: FileSourceType;
  fileId?: string;
  fileUrl?: string;
  uploadedFileUuid?: string;
  caption?: string;
  thumbnailFileId?: string;
  disableContentTypeDetection?: boolean;
  disableNotification?: boolean;
  protectContent?: boolean;
  remove_keyboard?: boolean;
  keyboard: KeyboardConfig;
  handlers?: HandlerData[];
}







export interface EditMessageNodeData {
  messageIdSource: MessageIdSource;
  messageId: string | null;
  newText: string;
  parseMode: ParseMode;
  newCaption?: string;
  keyboard: KeyboardConfig;
  dynamicMessages?: DynamicMessage[];
  handlers?: HandlerData[];
}


export type { RecipientType };


