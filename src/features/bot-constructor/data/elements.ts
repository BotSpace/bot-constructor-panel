import { ElementTypes } from "@/types/element-types";

export const Elements: ElementTypes[] = [
  {
    // Bular bot senariysini ishga tushiruvchi hodisalar
    title: "🚀 Triggerlar (Boshlovchilar)",
    elements: [
      {
        type: "message",
        name: "Xabar kelganda",
        description: "Foydalanuvchidan xabar kelganda.",
        icon: "💬",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        triggerId: "MessageTriggerNode",
      },
      {
        type: "command",
        name: "Buyruq kelganda",
        description: "/start yoki /help kabi buyruq yuborganda.",
        icon: "⌘",
        color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        triggerId: "CommandTriggerNode",
      },
      {
        type: "reply_button",
        name: "Javob tugmasi bosilganda",
        description: "Tugmani bosganda.",
        icon: "↩️",
        color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        triggerId: "ReplyButtonTriggerNode",
      },
      {
        type: "callback_query",
        name: "Inline tugma bosilganda",
        description: "Inline tugmani bosganda.",
        icon: "🕸️",
        color: "bg-teal-500/10 text-teal-400 border-teal-500/20",
        triggerId: "CallbackQueryTriggerNode",
      },
    ],
  },
  {
    // Bular bot bajaradigan amallar
    title: "⚙️ Amallar",
    elements: [
      {
        type: "message",
        name: "Matn yuborish",
        description: "Foydalanuvchiga matnli xabar yuboradi.",
        icon: "💬",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        triggerId: "SendTextMessageNode",
      },
      {
        type: "photo",
        name: "Rasm yuborish",
        description: "Foydalanuvchiga rasm yuboradi.",
        icon: "🖼️",
        color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        triggerId: "SendPhotoNode",
      },
      {
        type: "video",
        name: "Video yuborish",
        description: "Foydalanuvchiga video yuboradi.",
        icon: "📹",
        color: "bg-red-500/10 text-red-400 border-red-500/20",
        triggerId: "SendVideoNode",
      },
      {
        type: "audio",
        name: "Audio yuborish",
        description: "Foydalanuvchiga audio fayl yuboradi.",
        icon: "🎵",
        color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
        triggerId: "SendAudioNode",
      },
      {
        type: "file",
        name: "Fayl yuborish",
        description:
          "Foydalanuvchiga hujjat yoki boshqa turdagi fayl yuboradi.",
        icon: "📄",
        color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        triggerId: "SendFileNode",
      },
    ],
  },
  {
    // Bu murakkab mantiq uchun maxsus blok
    title: "🧩 Maxsus Mantiq",
    elements: [
      {
        type: "code",
        name: "Maxsus Kod",
        description:
          "Murakkab amallar va shartlar uchun Python kodi yozish imkonini beradi.",
        icon: "🖥️",
        color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        triggerId: "CustomCodeNode",
      },
      {
        type: "state",
        name: "Ma'lumotlar yig'ish",
        description: "Foydalanuvchidan ma'lumotlarni yig'ib borish uchun",
        icon: "🗄",
        color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        triggerId: "StateNode",
      },
      {
        type: "collection",
        name: "Collection yig'ish",
        description: "Collectiondan ma'lumotlarni yig'ib borish uchun",
        icon: "📦",
        color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        triggerId: "CollectionNode",
      },
    ],
  },
];
