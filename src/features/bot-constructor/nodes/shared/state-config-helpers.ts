import { StateType } from "@/features/bot-constructor/nodes/shared/state-config-types";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";

/**
 * Get available state types for MessageTrigger based on message type
 */
export function getStateTypesForMessageTrigger(
  messageType: MessageTriggerValueTypes
): StateType[] {
  switch (messageType) {
    case "text":
      return ["text", "Custom"];
    case "photo":
      return ["file_id", "caption", "Custom"];
    case "video":
      return ["file_id", "caption", "Custom"];
    case "document":
      return ["file_id", "caption", "Custom"];
    case "audio":
      return ["file_id", "caption", "Custom"];
    case "voice":
      return ["file_id", "caption", "Custom"];
    case "video_note":
      return ["file_id", "Custom"];
    case "animation":
      return ["file_id", "caption", "Custom"];
    case "sticker":
      return ["file_id", "Custom"];
    case "contact":
      return [
        "phone_number",
        "contact_phone_number",
        "contact_first_name",
        "contact_last_name",
        "Custom",
      ];
    case "location":
      return [
        "location",
        "latitude",
        "longitude",
        "location_latitude",
        "location_longitude",
        "Custom",
      ];
    case "any":
    case "any_text":
      return ["text", "caption", "Custom"];
    default:
      return ["text", "Custom"];
  }
}

/**
 * Get available state types for CallbackQueryTrigger
 * @param isCollectionButton - Whether the selected callback is from a dynamic collection button
 */
export function getStateTypesForCallbackQueryTrigger(isCollectionButton: boolean = false): StateType[] {
  if (isCollectionButton) {
    return ["callback", "data", "collection_id", "full_data", "Custom"];
  }
  return ["callback", "data", "Custom"];
}

/**
 * Get available state types for CommandTrigger
 */
export function getStateTypesForCommandTrigger(): StateType[] {
  return ["text", "Custom"];
}

/**
 * Get available state types for ReplyButtonTrigger
 */
export function getStateTypesForReplyButtonTrigger(): StateType[] {
  return ["text", "Custom"];
}
