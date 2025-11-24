import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";

import React, { useMemo, useState } from "react";
import { NodeProps, useEdges, useNodes } from "reactflow";
import { Database, ChevronDown, Key, Type } from "lucide-react";
import { StateNodeData } from "./types";
import { SourceHandler, TargetHandler } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";

export function StateNode({ id, data, selected }: NodeProps<StateNodeData>) {
  const nodes = useNodes();
  const edges = useEdges();
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isExpanded, setIsExpanded] = useState(true);

  // --- O'ZGARTIRISH: Mantiq to'liq yangilandi va soddalashtirildi ---
  // --- O'ZGARTIRISH: Mantiq to'liq yangilandi va soddalashtirildi ---
  const availableTypes = useMemo<{
    dynamic: string[];
    default: string[];
    custom: string[];
    all: string[];
  }>(() => {
    const incomingEdge = edges.find((edge) => edge.target === id);
    if (!incomingEdge) {
      return {
        dynamic: [],
        default: [],
        custom: ["Custom"],
        all: ["Custom"],
      };
    }

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    if (!parentNode) {
      return {
        dynamic: [],
        default: [],
        custom: ["Custom"],
        all: ["Custom"],
      };
    }

    const parentNodeData = parentNode.data as any;

    const defaultFilters = [
      `user_id`,
      `first_name`,
      `last_name`,
      `username`,
      `language_code`,
      `is_bot`,
      `is_premium`,
      `message_id`,
      `chat_id`,
    ];
    let dynamicFilters: string[] = [];

    switch (parentNodeData.node_type) {
      case "MessageTriggerNode":
        const messageType = parentNodeData.type;
        switch (messageType) {
          case "phone":
            dynamicFilters = ["phone_number"];
            break;
          case "text":
            dynamicFilters = ["text"];
            break;
          case "location":
            dynamicFilters = ["location", "latitude", "longitude"];
            break;
          case "contact":
            dynamicFilters = [
              "contact_user_id",
              "contact_first_name",
              "contact_last_name",
              "contact_phone_number",
              "contact_vcard",
            ];
            break;
          case "document":
            dynamicFilters = [
              "document",
              "mime_type",
              "file_name",
              "file_size",
              "file_unique_id", // Yangi: Telegram file_unique_id
              "file_id", // Yangi: Telegram file_id
              "caption", // Yangi: Hujjat uchun sarlavha
            ];
            break;
          case "photo":
            dynamicFilters = [
              "photo",
              "photo_file_id",
              "photo_file_unique_id",
              "photo_width",
              "photo_height",
              "photo_file_size",
              "caption",
            ];
            break;
          case "video":
            dynamicFilters = [
              "video",
              "video_file_id",
              "video_file_unique_id",
              "video_width",
              "video_height",
              "video_duration",
              "video_mime_type",
              "video_file_size",
              "caption",
              "thumbnail_file_id", // Yangi: Video uchun thumbnail
              "thumbnail_file_unique_id",
              "thumbnail_width",
              "thumbnail_height",
              "thumbnail_file_size",
            ];
            break;
          case "audio":
            dynamicFilters = [
              "audio",
              "audio_file_id",
              "audio_file_unique_id",
              "audio_duration",
              "audio_mime_type",
              "audio_file_size",
              "audio_title",
              "audio_performer",
              "caption",
            ];
            break;
          case "voice": // Yangi: Ovozli xabar
            dynamicFilters = [
              "voice",
              "voice_file_id",
              "voice_file_unique_id",
              "voice_duration",
              "voice_mime_type",
              "voice_file_size",
              "caption",
            ];
            break;
          case "video_note": // Yangi: Dumaloq video xabar
            dynamicFilters = [
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
            ];
            break;
          case "sticker":
            dynamicFilters = [
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
            ];
            break;
          case "animation": // Yangi: GIF animatsiya
            dynamicFilters = [
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
            ];
            break;
          case "game": // Yangi: O'yin
            dynamicFilters = [
              "game",
              "game_title",
              "game_description",
              "game_photo",
              "game_text",
              "game_text_entities",
              "game_animation",
            ];
            break;
          case "poll": // Yangi: So'rovnoma
            dynamicFilters = [
              "poll",
              "poll_id",
              "poll_question",
              "poll_options", // Har bir option: text, voter_count
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
            ];
            break;
          case "venue": // Yangi: joy (Venue)
            dynamicFilters = [
              "venue",
              "venue_location_latitude",
              "venue_location_longitude",
              "venue_title",
              "venue_address",
              "venue_foursquare_id",
              "venue_foursquare_type",
              "venue_google_place_id",
              "venue_google_place_type",
            ];
            break;
          case "invoice": // Yangi: To'lov schyoti
            dynamicFilters = [
              "invoice",
              "invoice_title",
              "invoice_description",
              "invoice_start_parameter",
              "invoice_currency",
              "invoice_total_amount",
            ];
            break;
          case "successful_payment": // Yangi: Muvaffaqiyatli to'lov
            dynamicFilters = [
              "successful_payment",
              "successful_payment_currency",
              "successful_payment_total_amount",
              "successful_payment_invoice_payload",
              "successful_payment_shipping_option_id",
              "successful_payment_order_info", // Yangi: OrderInfo obyekti
              "successful_payment_telegram_payment_charge_id",
              "successful_payment_provider_payment_charge_id",
            ];
            break;
          case "web_app_data": // Yangi: Web App dan kelgan ma'lumot
            dynamicFilters = [
              "web_app_data",
              "web_app_data_text",
              "web_app_data_button_text",
            ];
            break;
          case "dice": // Yangi: Kubik
            dynamicFilters = ["dice", "dice_emoji", "dice_value"];
            break;
          case "any":
          case "any_text":
            dynamicFilters = []; // "Har qanday" turlari uchun maxsus dinamik filter yo'q
            break;
          default:
            // Agar messageType belgilanmagan bo'lsa, filter'ga qarab tekshiramiz (eski mantiqni saqlaymiz, lekin yangi turlarni ustun qilamiz)
            const messageFilter = parentNodeData.filter;
            switch (messageFilter) {
              case "phone":
                dynamicFilters = ["phone_number"]; // To'g'irlandi
                break;
              case "text":
                dynamicFilters = ["text"]; // To'g'irlandi
                break;
              case "location":
                dynamicFilters = ["location", "latitude", "longitude"];
                break;
              case "contact":
                dynamicFilters = [
                  "contact_user_id",
                  "contact_first_name",
                  "contact_last_name",
                  "contact_phone_number",
                  "contact_vcard",
                ]; // To'g'irlandi
                break;
              case "document":
                dynamicFilters = [
                  "document",
                  "mime_type",
                  "file_name",
                  "file_size",
                  "file_unique_id",
                  "file_id",
                  "caption",
                ];
                break;
              case "photo":
                dynamicFilters = [
                  "photo",
                  "photo_file_id",
                  "photo_file_unique_id",
                  "photo_width",
                  "photo_height",
                  "photo_file_size",
                  "caption",
                ];
                break;
              case "video":
                dynamicFilters = [
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
                ];
                break;
              case "audio":
                dynamicFilters = [
                  "audio",
                  "audio_file_id",
                  "audio_file_unique_id",
                  "audio_duration",
                  "audio_mime_type",
                  "audio_file_size",
                  "audio_title",
                  "audio_performer",
                  "caption",
                ];
                break;
              case "voice":
                dynamicFilters = [
                  "voice",
                  "voice_file_id",
                  "voice_file_unique_id",
                  "voice_duration",
                  "voice_mime_type",
                  "voice_file_size",
                  "caption",
                ];
                break;
              case "video_note":
                dynamicFilters = [
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
                ];
                break;
              case "sticker":
                dynamicFilters = [
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
                ];
                break;
              case "animation":
                dynamicFilters = [
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
                ];
                break;
              case "game":
                dynamicFilters = [
                  "game",
                  "game_title",
                  "game_description",
                  "game_photo",
                  "game_text",
                  "game_text_entities",
                  "game_animation",
                ];
                break;
              case "poll":
                dynamicFilters = [
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
                ];
                break;
              case "venue":
                dynamicFilters = [
                  "venue",
                  "venue_location_latitude",
                  "venue_location_longitude",
                  "venue_title",
                  "venue_address",
                  "venue_foursquare_id",
                  "venue_foursquare_type",
                  "venue_google_place_id",
                  "venue_google_place_type",
                ];
                break;
              case "invoice":
                dynamicFilters = [
                  "invoice",
                  "invoice_title",
                  "invoice_description",
                  "invoice_start_parameter",
                  "invoice_currency",
                  "invoice_total_amount",
                ];
                break;
              case "successful_payment":
                dynamicFilters = [
                  "successful_payment",
                  "successful_payment_currency",
                  "successful_payment_total_amount",
                  "successful_payment_invoice_payload",
                  "successful_payment_shipping_option_id",
                  "successful_payment_order_info",
                  "successful_payment_telegram_payment_charge_id",
                  "successful_payment_provider_payment_charge_id",
                ];
                break;
              case "web_app_data":
                dynamicFilters = [
                  "web_app_data",
                  "web_app_data_text",
                  "web_app_data_button_text",
                ];
                break;
              case "dice":
                dynamicFilters = ["dice", "dice_emoji", "dice_value"];
                break;
            }
            break;
        }
        break;
      case "ReplyButtonTriggerNode":
        // ReplyButton bosilganda, odatda uning matni oddiy "text" xabar sifatida keladi.
        // Agar callback_data bo'lsa, u "CallbackQueryTriggerNode" tomonidan ushlanadi.
        // Shuning uchun bu yerda faqat "text" ni qo'shish mantiqiy.
        dynamicFilters = ["text"];
        break;
      case "CommandTriggerNode":
        // Buyruq ham matnli xabar sifatida keladi.
        dynamicFilters = ["text", "command"]; // "command" - bu buyruqning o'zi (/start kabi)
        break;
      case "CallbackQueryTriggerNode":
        // CallbackQuery yuborilganda, asosiy ma'lumot 'data' hisoblanadi.
        dynamicFilters = [
          "callback_query_id",
          "from_user_id",
          "chat_instance",
          "data", // Collection button value (only the actual data, not full callback)
          "callback", // Full callback data
          "inline_message_id",
          "game_short_name",
        ];
        break;
      // TODO: Shu nodeni qo'shish kerak kelajakda
      case "ChannelPostTriggerNode": // Yangi: Kanal posti uchun trigger
        // Kanal postlari MessageTriggerNode'ga o'xshash bo'lishi mumkin, lekin ayrim farqlari bor.
        // Misol uchun, channel_post.author_signature kabi ma'lumotlar bo'lishi mumkin.
        // Hozircha MessageTriggerNode'dagilarni o'zlashtiramiz va keyinroq kerak bo'lsa kengaytiramiz.
        // Bu yerda dynamicFilters ni MessageTriggerNode dagidek kengaytirish mumkin.
        // Sodda holda, hozircha "text", "photo", "video" va "caption"ni qo'shamiz.
        dynamicFilters = ["text", "photo", "video", "caption"];
        break;
      case "EditedMessageTriggerNode": // Yangi: Tahrirlangan xabar triggeri
        // Tahrirlangan xabar asl xabarga o'xshash ma'lumotlarni o'z ichiga oladi.
        // Agar MessageTriggerNode ichidagi barcha turlar tahrirlansa, ularning ma'lumotlari bu yerda ham mavjud bo'ladi.
        // Misol uchun, matnli xabar tahrirlansa, "text" mavjud bo'ladi.
        // Bu yerda MessageTriggerNode'dagilarning deyarli barchasi mos keladi.
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
      // Qo'shimcha trigger turlarini shu yerga qo'shishingiz mumkin, masalan, InlineQuery, ChosenInlineResult va h.k.
      default:
        dynamicFilters = []; // Boshqa trigger turlari uchun dinamik filtrlar yo'q
        break;
    }

    const allTypes = [...defaultFilters, ...dynamicFilters, "Custom"];

    return {
      dynamic: dynamicFilters,
      default: defaultFilters,
      custom: ["Custom"],
      all: allTypes,
    };
  }, [nodes, edges, id]);

  const isCustomType = useMemo(() => {
    if (data.type === "Custom") return true;
    if (data.type && !availableTypes.all.includes(data.type)) return true;
    return false;
  }, [data.type, availableTypes.all]);

  // Agar type ro'yxatda bo'lmasa, uni customType sifatida ko'rsatish
  const displayCustomType = useMemo(() => {
    if (data.type === "Custom") return data.customType || "";
    if (data.type && !availableTypes.all.includes(data.type)) {
      return data.type; // Eski custom type'ni ko'rsatish
    }
    return data.customType || "";
  }, [data.type, data.customType, availableTypes.all]);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { key: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    if (value === "Custom") {
      // Agar avval custom type bo'lgan bo'lsa, uni saqlash
      const prevCustomType =
        data.type && !availableTypes.all.includes(data.type)
          ? data.type
          : data.customType || "";
      updateNodeData(id, { type: "Custom", customType: prevCustomType });
    } else {
      updateNodeData(id, { type: value, customType: undefined });
    }
  };

  // Combobox uchun options
  const comboboxOptions = useMemo<ComboboxOption[]>(() => {
    const options: ComboboxOption[] = [];

    // Default filters
    if (availableTypes.default.length > 0) {
      availableTypes.default.forEach((type) => {
        options.push({ value: type, label: type, group: "Default" });
      });
    }

    // Dynamic filters
    if (availableTypes.dynamic.length > 0) {
      availableTypes.dynamic.forEach((type) => {
        options.push({ value: type, label: type, group: "Dynamic" });
      });
    }

    // Custom option
    availableTypes.custom.forEach((type) => {
      options.push({ value: type, label: type, group: "Custom" });
    });

    return options;
  }, [availableTypes]);

  const handleCustomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { customType: e.target.value });
  };

  // Node sozlanganligini tekshirish
  const isConfigured = useMemo(() => {
    if (!data.key) return false;
    if (isCustomType) {
      return !!data.customType && data.customType.trim() !== "";
    }
    return !!data.type && data.type !== "Custom";
  }, [data.key, data.type, data.customType, isCustomType]);

  // Ko'rsatish uchun type nomi
  const displayType = useMemo(() => {
    if (isCustomType) {
      return displayCustomType || "Custom";
    }
    return data.type || "";
  }, [isCustomType, displayCustomType, data.type]);

  return (
    <Card
      className={`w-80 rounded-xl border shadow-lg transition-all overflow-hidden ${
        selected
          ? "border-sky-500/80 shadow-xl shadow-sky-500/10 ring-2 ring-sky-500/20"
          : "border-gray-700/50 shadow-md"
      }`}
    >
      <TargetHandler />

      <CardHeader className="pb-3 px-6 pt-6">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm flex items-center justify-between cursor-pointer group rounded-lg p-2 -m-2 hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1">
            <Database className="h-4 w-4 text-purple-400 flex-shrink-0" />
            <span className="font-medium text-gray-200">State</span>
            {data.key && (
              <Badge
                variant="secondary"
                className="border-gray-600/50 text-xs px-1.5 py-0"
              >
                {data.key}
              </Badge>
            )}
            {displayType && !isCustomType && (
              <Badge
                variant="outline"
                className="border-blue-500/50 text-blue-400 text-xs px-1.5 py-0"
              >
                {displayType}
              </Badge>
            )}
            {isCustomType && displayCustomType && (
              <Badge
                variant="outline"
                className="border-purple-500/50 text-purple-400 text-xs px-1.5 py-0"
              >
                Custom
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                isConfigured
                  ? "bg-green-500 shadow-sm shadow-green-500/50"
                  : "bg-gray-600"
              }`}
              title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
            />
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${
                isExpanded ? "rotate-0" : "-rotate-90"
              }`}
            />
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="px-6 pb-6 pt-0 space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="key"
              className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"
            >
              <Key className="h-3 w-3" />
              State Key
            </Label>
            <Input
              id="key"
              type="text"
              placeholder="Masalan: user_id, session_data..."
              value={data.key || ""}
              onChange={handleKeyChange}
              className="w-full bg-gray-800/50 border-gray-600/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="type"
              className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"
            >
              <Type className="h-3 w-3" />
              Type
            </Label>
            <Combobox
              options={comboboxOptions}
              value={isCustomType ? "Custom" : data.type || ""}
              onValueChange={handleTypeChange}
              placeholder="Type tanlang"
              searchPlaceholder="Type qidirish..."
              emptyText="Hech narsa topilmadi"
              triggerClassName="h-9 text-sm"
            />

            {isCustomType && (
              <div className="space-y-1.5 animate-in fade-in-50 slide-in-from-top-1 duration-200 mt-2">
                <Label
                  htmlFor="customType"
                  className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"
                >
                  <Database className="h-3 w-3" />
                  Custom Type
                </Label>
                <Input
                  id="customType"
                  type="text"
                  placeholder="Masalan: custom_field, my_data..."
                  value={displayCustomType}
                  onChange={handleCustomTypeChange}
                  className="w-full bg-gray-800/50 border-purple-500/30 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  O'zingizning custom ma'lumot turingizni kiriting
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}

      <SourceHandler />
    </Card>
  );
}
