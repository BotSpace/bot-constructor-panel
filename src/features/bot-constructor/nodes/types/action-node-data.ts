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
export type VideoSourceType = "file_id" | "url" | "upload";
export type MessageIdSource = "this_message" | "connected_node" | "message_id";

export interface SendTextMessageNodeData {
  recipients: RecipientConfig;
  messageText: string;
  parseMode: ParseMode;
  disableNotification: boolean;
  protectContent: boolean;
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
  keyboard: KeyboardConfig;
  handlers?: HandlerData[];
}

export interface SendVideoNodeData {
  recipients?: RecipientConfig;
  videoSourceType?: VideoSourceType;
  videoFileId?: string;
  videoUrl?: string;
  uploadedFileUuid?: string;
  caption: string;
  duration?: string;
  width?: string;
  height?: string;
  supportsStreaming?: boolean;
  hasCustomThumbnail?: boolean;
  thumbnailFileId?: string;
  disableNotification: boolean;
  protectContent?: boolean;
  parseMode: ParseMode;
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
  keyboard: KeyboardConfig;
  handlers?: HandlerData[];
}

export interface SendContactNodeData {
  recipients?: RecipientConfig;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  vcard?: string;
  keyboard: KeyboardConfig;
  handlers?: HandlerData[];
}

export interface SendLocationNodeData {
  recipients?: RecipientConfig;
  latitude?: number;
  longitude?: number;
  keyboard: KeyboardConfig;
  handlers?: HandlerData[];
}

export interface PollOption {
  text: string;
}

export interface SendPollNodeData {
  recipients?: RecipientConfig;
  question?: string;
  options?: PollOption[];
  isAnonymous?: boolean;
  type?: "regular" | "quiz";
  allowsMultipleAnswers?: boolean;
  correctOptionId?: number;
  explanation?: string;
  openPeriod?: number;
  closeDate?: string;
  keyboard?: KeyboardConfig;
  handlers?: HandlerData[];
}

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

export interface EditOrSendMessageNodeData {
  recipients: RecipientConfig;
  messageText: string;
  parseMode: ParseMode;
  disableNotification: boolean;
  disableWebPagePreview: boolean;
  keyboard: KeyboardConfig;
  dynamicMessages?: DynamicMessage[];
  handlers?: HandlerData[];
}

export type { RecipientType };
