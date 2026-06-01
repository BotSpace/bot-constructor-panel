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
      { key: "user_username", descriptionKey: "user_username" },
      { key: "chat_id", descriptionKey: "chat_id" },
    ],
  },
  {
    labelKey: "groupMessage",
    variables: [
      { key: "message.text", descriptionKey: "message_text" },
      { key: "message.from.first_name", descriptionKey: "message_from_first_name" },
      { key: "message.contact.phone_number", descriptionKey: "message_contact_phone" },
      { key: "message.location.latitude", descriptionKey: "message_location_lat" },
      { key: "message.location.longitude", descriptionKey: "message_location_lon" },
    ],
  },
  {
    labelKey: "groupCallback",
    variables: [
      { key: "callback_query.data", descriptionKey: "callback_query_data" },
    ],
  },
];
