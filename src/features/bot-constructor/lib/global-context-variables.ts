/**
 * Static list of global context variables automatically provided by the engine
 * for every flow execution. These are always available regardless of node type.
 *
 * Ref: botspace.yaml / engine runtime context spec.
 */

export interface GlobalContextVariable {
  key: string;
  /** i18n description key under "variablePanel.globalVars" namespace */
  descriptionKey: string;
}

export interface GlobalContextGroup {
  /** i18n label key under "variablePanel.globalVars" namespace */
  labelKey: string;
  variables: GlobalContextVariable[];
}

export const GLOBAL_CONTEXT_VARIABLE_GROUPS: GlobalContextGroup[] = [
  {
    labelKey: "groupUser",
    variables: [
      { key: "user_id", descriptionKey: "user_id" },
      { key: "user_first_name", descriptionKey: "user_first_name" },
      { key: "user_last_name", descriptionKey: "user_last_name" },
      { key: "user_username", descriptionKey: "user_username" },
      { key: "user_language_code", descriptionKey: "user_language_code" },
      { key: "user_is_bot", descriptionKey: "user_is_bot" },
      { key: "chat_id", descriptionKey: "chat_id" },
      { key: "chat_type", descriptionKey: "chat_type" },
      { key: "chat_title", descriptionKey: "chat_title" },
    ],
  },
  {
    labelKey: "groupMessage",
    variables: [
      { key: "message.text", descriptionKey: "message_text" },
      { key: "message.caption", descriptionKey: "message_caption" },
      { key: "message_id", descriptionKey: "message_id" },
      { key: "source_message_id", descriptionKey: "source_message_id" },
      { key: "message.from.first_name", descriptionKey: "message_from_first_name" },
      { key: "message.contact.phone_number", descriptionKey: "message_contact_phone" },
      { key: "message.location.latitude", descriptionKey: "message_location_lat" },
      { key: "message.location.longitude", descriptionKey: "message_location_lon" },
      { key: "message.document.file_id", descriptionKey: "message_document_file_id" },
      { key: "message.photo", descriptionKey: "message_photo" },
      { key: "message.video.file_id", descriptionKey: "message_video_file_id" },
      { key: "message.audio.file_id", descriptionKey: "message_audio_file_id" },
      { key: "message.voice.file_id", descriptionKey: "message_voice_file_id" },
    ],
  },
  {
    labelKey: "groupCallback",
    variables: [
      { key: "callback_query.data", descriptionKey: "callback_query_data" },
      { key: "callback_message_id", descriptionKey: "callback_message_id" },
    ],
  },
];
