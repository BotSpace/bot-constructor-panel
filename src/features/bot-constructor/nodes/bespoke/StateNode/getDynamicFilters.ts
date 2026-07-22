import { Node, Edge } from "reactflow";

export interface DynamicFilterOption {
  value: string;
  label: string;
  group: string;
}

// Engine StateNode'da bu turlar trigger turidan QAT'I NAZAR ishlaydi (context'da
// callback_query bo'lsa o'qiladi) — masalan EditOrSend tugma edge'idan kelganda
// CallbackQueryTriggerNode bo'lmaydi, lekin callback data mavjud.
const CALLBACK_FILTERS: DynamicFilterOption[] = [
  { value: "data", label: "Callback Data", group: "Callback" },
  { value: "callback", label: "Callback (raw)", group: "Callback" },
  { value: "collection_id", label: "Collection ID", group: "Callback" },
  { value: "full_data", label: "Full Data (collection hujjati)", group: "Callback" },
];

const BASE_FILTERS: DynamicFilterOption[] = [
  { value: "static", label: "Doimiy qiymat", group: "Qiymat" },
  { value: "user_id", label: "User ID", group: "User" },
  { value: "first_name", label: "First Name", group: "User" },
  { value: "last_name", label: "Last Name", group: "User" },
  { value: "username", label: "Username", group: "User" },
  { value: "language_code", label: "Language Code", group: "User" },
  { value: "chat_id", label: "Chat ID", group: "Chat" },
  { value: "message_id", label: "Message ID", group: "Chat" },
];

const MESSAGE_TYPE_FILTERS: Record<string, string[]> = {
  phone: ["phone_number"],
  text: ["text"],
  location: ["location", "latitude", "longitude"],
  contact: [
    "contact_user_id",
    "contact_first_name",
    "contact_last_name",
    "contact_phone_number",
    "contact_vcard",
  ],
  document: [
    "document",
    "mime_type",
    "file_name",
    "file_size",
    "file_unique_id",
    "file_id",
    "caption",
  ],
  photo: [
    "photo",
    "photo_file_id",
    "photo_file_unique_id",
    "photo_width",
    "photo_height",
    "photo_file_size",
    "caption",
  ],
  video: [
    "video",
    "video_file_id",
    "video_file_unique_id",
    "video_width",
    "video_height",
    "video_duration",
    "video_mime_type",
    "video_file_size",
    "caption",
    "thumbnail_file_id",
    "thumbnail_file_unique_id",
    "thumbnail_width",
    "thumbnail_height",
    "thumbnail_file_size",
  ],
  audio: [
    "audio",
    "audio_file_id",
    "audio_file_unique_id",
    "audio_duration",
    "audio_mime_type",
    "audio_file_size",
    "audio_title",
    "audio_performer",
    "caption",
  ],
  voice: [
    "voice",
    "voice_file_id",
    "voice_file_unique_id",
    "voice_duration",
    "voice_mime_type",
    "voice_file_size",
    "caption",
  ],
  video_note: [
    "video_note",
    "video_note_file_id",
    "video_note_file_unique_id",
    "video_note_length",
    "video_note_duration",
    "video_note_file_size",
    "thumbnail_file_id",
    "thumbnail_file_unique_id",
    "thumbnail_width",
    "thumbnail_height",
    "thumbnail_file_size",
  ],
  sticker: [
    "sticker",
    "sticker_file_id",
    "sticker_file_unique_id",
    "sticker_width",
    "sticker_height",
    "sticker_emoji",
    "sticker_set_name",
    "sticker_is_animated",
    "sticker_is_video",
    "sticker_file_size",
  ],
  animation: [
    "animation",
    "animation_file_id",
    "animation_file_unique_id",
    "animation_width",
    "animation_height",
    "animation_duration",
    "animation_file_name",
    "animation_mime_type",
    "animation_file_size",
    "caption",
    "thumbnail_file_id",
    "thumbnail_file_unique_id",
    "thumbnail_width",
    "thumbnail_height",
    "thumbnail_file_size",
  ],
  game: [
    "game",
    "game_title",
    "game_description",
    "game_photo",
    "game_text",
    "game_text_entities",
    "game_animation",
  ],
  poll: [
    "poll",
    "poll_id",
    "poll_question",
    "poll_options",
    "poll_total_voter_count",
    "poll_is_closed",
    "poll_is_anonymous",
    "poll_type",
    "poll_allows_multiple_answers",
    "poll_correct_option_id",
    "poll_explanation",
    "poll_explanation_entities",
    "poll_open_period",
    "poll_close_date",
  ],
  venue: [
    "venue",
    "venue_location_latitude",
    "venue_location_longitude",
    "venue_title",
    "venue_address",
    "venue_foursquare_id",
    "venue_foursquare_type",
    "venue_google_place_id",
    "venue_google_place_type",
  ],
  invoice: [
    "invoice",
    "invoice_title",
    "invoice_description",
    "invoice_start_parameter",
    "invoice_currency",
    "invoice_total_amount",
  ],
  successful_payment: [
    "successful_payment",
    "successful_payment_currency",
    "successful_payment_total_amount",
    "successful_payment_invoice_payload",
    "successful_payment_shipping_option_id",
    "successful_payment_order_info",
    "successful_payment_telegram_payment_charge_id",
    "successful_payment_provider_payment_charge_id",
  ],
  web_app_data: [
    "web_app_data",
    "web_app_data_text",
    "web_app_data_button_text",
  ],
  dice: ["dice", "dice_emoji", "dice_value"],
};

const TRIGGER_NODE_TYPES = [
  "MessageTriggerNode",
  "CommandTriggerNode",
  "CallbackQueryTriggerNode",
  "ReplyButtonTriggerNode",
  "CronTriggerNode",
  "ChannelPostTriggerNode",
  "EditedMessageTriggerNode",
];

export function findNearestTriggerNode(
  startNodeId: string,
  nodes: Node[],
  edges: Edge[]
): Node | null {
  let currentId = startNodeId;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) return null;
    visited.add(currentId);

    const incomingEdge = edges.find((edge) => edge.target === currentId);
    if (!incomingEdge) return null;

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    if (!parentNode) return null;

    if (TRIGGER_NODE_TYPES.includes(parentNode.type || "")) {
      return parentNode;
    }

    currentId = parentNode.id;
  }

  return null;
}

function formatLabel(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toOptions(keys: string[], group: string): DynamicFilterOption[] {
  return keys.map((key) => ({
    value: key,
    label: formatLabel(key),
    group,
  }));
}

function getMessageTriggerFilters(parentData: any): string[] {
  const messageType = parentData.type;

  if (messageType && MESSAGE_TYPE_FILTERS[messageType]) {
    return MESSAGE_TYPE_FILTERS[messageType];
  }

  if (messageType === "any" || messageType === "any_text") {
    return [];
  }

  const messageFilter = parentData.filter;
  if (messageFilter && MESSAGE_TYPE_FILTERS[messageFilter]) {
    return MESSAGE_TYPE_FILTERS[messageFilter];
  }

  return [];
}

export function getDynamicFilters(
  triggerNode: Node | null
): DynamicFilterOption[] {
  if (!triggerNode) return [...BASE_FILTERS];

  const parentData = triggerNode.data;
  const nodeType = triggerNode.type;
  let dynamicFilters: string[] = [];

  switch (nodeType) {
    case "MessageTriggerNode":
      dynamicFilters = getMessageTriggerFilters(parentData);
      break;

    case "ReplyButtonTriggerNode":
      dynamicFilters = ["text"];
      break;

    case "CommandTriggerNode":
      dynamicFilters = ["text", "command"];
      break;

    case "CallbackQueryTriggerNode":
      dynamicFilters = [
        "callback_query_id",
        "from_user_id",
        "chat_instance",
        "data",
        "callback",
        "collection_id",
        "full_data",
        "inline_message_id",
        "game_short_name",
      ];
      break;

    case "ChannelPostTriggerNode":
      dynamicFilters = ["text", "photo", "video", "caption"];
      break;

    case "EditedMessageTriggerNode":
      dynamicFilters = [
        "text",
        "photo",
        "video",
        "audio",
        "voice",
        "document",
        "sticker",
        "animation",
        "caption",
      ];
      break;

    default:
      dynamicFilters = [];
      break;
  }

  const dynamicOptions = toOptions(dynamicFilters, "Dynamic");
  const dynamicValues = new Set(dynamicFilters);
  const callbackOptions = CALLBACK_FILTERS.filter(
    (option) => !dynamicValues.has(option.value)
  );
  return [...dynamicOptions, ...callbackOptions, ...BASE_FILTERS];
}
