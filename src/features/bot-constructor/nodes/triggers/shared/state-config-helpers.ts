import { StateType } from "./state-config-types";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";

/**
 * Get available state types for MessageTrigger based on message type
 */
export function getStateTypesForMessageTrigger(
  messageType: MessageTriggerValueTypes
): StateType[] {
  switch (messageType) {
    case "text":
      return ["text"];
    case "photo":
      return ["file_id", "caption"];
    case "video":
      return ["file_id", "caption"];
    case "document":
      return ["file_id", "caption"];
    case "audio":
      return ["file_id", "caption"];
    case "voice":
      return ["file_id", "caption"];
    case "video_note":
      return ["file_id"];
    case "animation":
      return ["file_id", "caption"];
    case "sticker":
      return ["file_id"];
    case "contact":
      return [
        "phone_number",
        "contact_phone_number",
        "contact_first_name",
        "contact_last_name",
      ];
    case "location":
      return [
        "location",
        "latitude",
        "longitude",
        "location_latitude",
        "location_longitude",
      ];
    case "any":
    case "any_text":
      return ["text", "caption"];
    default:
      return ["text"];
  }
}

/**
 * Get available state types for CallbackQueryTrigger
 */
export function getStateTypesForCallbackQueryTrigger(): StateType[] {
  return ["callback", "data", "collection_id"];
}

/**
 * Get available state types for CommandTrigger
 */
export function getStateTypesForCommandTrigger(): StateType[] {
  return ["text"];
}

/**
 * Get available state types for ReplyButtonTrigger
 */
export function getStateTypesForReplyButtonTrigger(): StateType[] {
  return ["text"];
}
