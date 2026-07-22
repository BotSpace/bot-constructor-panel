import { StateType } from "@/features/bot-constructor/nodes/shared/state-config-types";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/lib/messages";

/**
 * Get available state types for MessageTrigger based on message type
 */
export function getStateTypesForMessageTrigger(
  messageType: MessageTriggerValueTypes
): StateType[] {
  switch (messageType) {
    case "text":
      return ["text", "static"];
    case "photo":
      return ["file_id", "caption", "static"];
    case "video":
      return ["file_id", "caption", "static"];
    case "document":
      return ["file_id", "caption", "static"];
    case "audio":
      return ["file_id", "caption", "static"];
    case "voice":
      return ["file_id", "caption", "static"];
    case "video_note":
      return ["file_id", "static"];
    case "animation":
      return ["file_id", "caption", "static"];
    case "sticker":
      return ["file_id", "static"];
    case "contact":
      return [
        "phone_number",
        "contact_phone_number",
        "contact_first_name",
        "contact_last_name",
        "static",
      ];
    case "location":
      return [
        "location",
        "latitude",
        "longitude",
        "location_latitude",
        "location_longitude",
        "static",
      ];
    case "any":
    case "any_text":
      return ["text", "caption", "static"];
    default:
      return ["text", "static"];
  }
}

/**
 * Get available state types for CallbackQueryTrigger
 * @param isCollectionButton - Whether the selected callback is from a dynamic collection button
 */
export function getStateTypesForCallbackQueryTrigger(isCollectionButton: boolean = false): StateType[] {
  if (isCollectionButton) {
    return ["callback", "data", "collection_id", "full_data", "static"];
  }
  return ["callback", "data", "static"];
}

/**
 * Get available state types for CommandTrigger
 */
export function getStateTypesForCommandTrigger(): StateType[] {
  return ["text", "static"];
}

/**
 * Get available state types for ReplyButtonTrigger
 */
export function getStateTypesForReplyButtonTrigger(): StateType[] {
  return ["text", "static"];
}
