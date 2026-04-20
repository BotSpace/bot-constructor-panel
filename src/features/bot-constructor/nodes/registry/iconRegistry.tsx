import {
  Clapperboard,
  Clock3,
  Copy,
  Database,
  DoorOpen,
  Download,
  FileText,
  Globe,
  Image,
  LayoutGrid,
  MessageSquare,
  Mic,
  MousePointerClick,
  Music,
  Route,
  Send,
  Split,
  Timer,
  Users,
  Variable,
  Video,
  WandSparkles,
} from "lucide-react";
import { ReactNode } from "react";

const EMOJI_ICONS: Record<string, string> = {
  keyboard: "⌨️",
  typing: "⌨️",
  admin: "👤",
  loop: "🔁",
  dice: "🎲",
  sticker: "🎭",
  forward: "➡️",
  unpin: "📍",
  location: "📍",
  contact: "👤",
  pin: "📌",
  reply: "↩️",
};

const LUCIDE_ICONS: Record<string, ReactNode> = {
  message: <MessageSquare className="text-primary" />,
  photo: <Image className="text-primary" />,
  video: <Video className="text-primary" />,
  music: <Music className="text-primary" />,
  file: <FileText className="text-primary" />,
  clapperboard: <Clapperboard className="text-primary" />,
  microphone: <Mic className="text-primary" />,
  timer: <Timer className="text-primary" />,
  "mouse-pointer": <MousePointerClick className="text-primary" />,
  door: <DoorOpen className="text-primary" />,
  code: <WandSparkles className="text-primary" />,
  database: <Database className="text-primary" />,
  collection: <LayoutGrid className="text-primary" />,
  split: <Split className="text-primary" />,
  repeat: <Route className="text-primary" />,
  "arrow-right": <Send className="text-primary" />,
  globe: <Globe className="text-primary" />,
  download: <Download className="text-primary" />,
  clock: <Clock3 className="text-primary" />,
  poll: "📊",
  form: <FileText className="text-primary" />,
  users: <Users className="text-primary" />,
  variable: <Variable className="text-primary" />,
};

export function resolveNodeIcon(iconName: string): ReactNode | string {
  if (EMOJI_ICONS[iconName]) {
    return EMOJI_ICONS[iconName];
  }

  if (LUCIDE_ICONS[iconName]) {
    return LUCIDE_ICONS[iconName];
  }

  return "⬚";
}
