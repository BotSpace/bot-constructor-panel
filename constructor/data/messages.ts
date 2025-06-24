import {
  Archive,
  FileText,
  ImageIcon,
  MapPin,
  MessageCircle,
  Music,
  Phone,
  User,
  Video,
} from "lucide-react";

export const MessageTypes = [
  { value: "text", label: "Matn", icon: MessageCircle },
  { value: "location", label: "Joylashuv", icon: MapPin },
  { value: "contact", label: "Kontakt", icon: User },
  { value: "phone", label: "Telefon", icon: Phone },
  { value: "document", label: "Hujjat", icon: FileText },
  { value: "photo", label: "Rasm", icon: ImageIcon },
  { value: "video", label: "Video", icon: Video },
  { value: "audio", label: "Audio", icon: Music },
  { value: "sticker", label: "Stiker", icon: Archive },
];
