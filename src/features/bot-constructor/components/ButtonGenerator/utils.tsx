import { ReactNode } from "react";
import {
  Link,
  Code,
  Smartphone,
  MapPin,
  AppWindow,
  LogIn,
  Repeat,
  BarChart3,
} from "lucide-react";
import { ButtonConfig, KeyboardConfig } from "@/features/bot-constructor/components/ButtonGenerator/types";

export const getIconForButton = (button: ButtonConfig): ReactNode => {
  const commonClasses = "mr-2 h-4 w-4";
  switch (button.type) {
    case "url":
      return <Link className={commonClasses} />;
    case "callback":
      return <Code className={commonClasses} />;
    case "request_contact":
      return <Smartphone className={commonClasses} />;
    case "request_location":
      return <MapPin className={commonClasses} />;
    case "web_app":
      return <AppWindow className={commonClasses} />;
    case "login_url":
      return <LogIn className={commonClasses} />;
    case "switch_inline_query":
    case "switch_inline_query_current_chat":
      return <Repeat className={commonClasses} />;
    case "request_poll":
      return <BarChart3 className={commonClasses} />;
    default:
      // 'reply' uchun ikonka yo'q
      return null;
  }
};

export function calculateActiveButtonCount(keyboards: KeyboardConfig): number {
  const activeKeyboard = keyboards[keyboards.active]; // inline yoki reply massivini olamiz

  return activeKeyboard.reduce((rowTotal, row) => rowTotal + row.length, 0);
}
