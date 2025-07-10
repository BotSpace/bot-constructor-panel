import { ElementTypes } from "@/types/element-types";

export const Elements: ElementTypes[] = [
  {
    title: "Trigger",
    elements: [
      {
        type: "message",
        name: "Message",
        description: "Send a message to the user",
        icon: "💬",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        triggerId: "MessageTriggerNode",
      },
      {
        type: "command",
        name: "Command",
        description: "Bot buyrug'ini ushlaydi (masalan, /start)",
        icon: "⌘",
        color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        triggerId: "CommandTriggerNode", // Bu nom muhim! Keyingi qadamlarda ishlatamiz.
      },
      {
        type: "reply_button",
        name: "Reply Button",
        description: "Oldingi qadamdagi reply tugmani ushlaydi",
        icon: "↩️", // Yoki Lucide'dan icon
        color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        triggerId: "ReplyButtonTriggerNode", // Bu nom muhim!
      },
      {
        type: "callback_query",
        name: "Advanced Callback",
        description: "Callback ma'lumotini filtrlab ushlaydi",
        icon: "🕸️",
        color: "bg-teal-500/10 text-teal-400 border-teal-500/20",
        triggerId: "CallbackQueryTriggerNode",
      },
    ],
  },
  {
    title: "Actions",
    elements: [
      {
        type: "message",
        name: "Send Message",
        description: "Send a message to the user",
        icon: "💬",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        triggerId: "SendTextMessageNode",
      },
      {
        type: "photo",
        name: "Send Photo",
        description: "Send a photo to the user",
        icon: "🖼️",
        color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        triggerId: "SendPhotoNode",
      },
      {
        type: "video",
        name: "Send Video",
        description: "Send a video to the user",
        icon: "📹",
        color: "bg-red-500/10 text-red-400 border-red-500/20",
        triggerId: "SendVideoNode",
      },
      {
        type: "audio",
        name: "Send Audio",
        description: "Send an audio file to the user",
        icon: "🎵",
        color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
        triggerId: "SendAudioNode",
      },
      {
        type: "file",
        name: "Send File",
        description: "Send a file to the user",
        icon: "📄",
        color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        triggerId: "SendFileNode",
      },
    ],
  },
  {
    title: "Custom Logic",
    elements: [
      {
        type: "code",
        name: "Custom Code",
        description: "Run custom code for advanced logic",
        icon: "🖥️",
        color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        triggerId: "CustomCodeNode",
      },
    ],
  },
];
