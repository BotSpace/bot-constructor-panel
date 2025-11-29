import { useTranslations } from "next-intl";
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
  MessagesSquare,
} from "lucide-react";

export function useMessageTypes() {
  const t = useTranslations();

  return [
    { value: "any", label: t("messageTypes.any"), icon: MessagesSquare },
    { value: "text", label: t("messageTypes.text"), icon: MessageCircle },
    { value: "location", label: t("messageTypes.location"), icon: MapPin },
    { value: "contact", label: t("messageTypes.contact"), icon: User },
    { value: "phone", label: t("messageTypes.phone"), icon: Phone },
    { value: "document", label: t("messageTypes.document"), icon: FileText },
    { value: "photo", label: t("messageTypes.photo"), icon: ImageIcon },
    { value: "video", label: t("messageTypes.video"), icon: Video },
    { value: "audio", label: t("messageTypes.audio"), icon: Music },
    { value: "sticker", label: t("messageTypes.sticker"), icon: Archive },
  ];
}

