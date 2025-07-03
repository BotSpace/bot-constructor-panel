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
        description: "Execute a command",
        icon: "⌘",
        color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        triggerId: "MessageTriggerNode",
      },
      {
        type: "button",
        name: "Button",
        description: "Create a button for user interaction",
        icon: "🔘",
        color: "bg-green-500/10 text-green-400 border-green-500/20",
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
      },
      {
        type: "condition",
        name: "Condition",
        description: "Add conditional logic to your flow",
        icon: "🔀",
        color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      },
    ],
  },
];
