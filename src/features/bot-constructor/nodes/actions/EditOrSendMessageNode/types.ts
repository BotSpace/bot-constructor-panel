import { KeyboardConfig } from "@/features/bot-constructor/components/ButtonGenerator/types";
import { DynamicMessage, ParseMode } from "../shared/types";
import { HandlerData } from "../TextMessageNode/types";

export interface EditOrSendMessageNodeData {
  recipients: {
    sendToSender: boolean;
    additionalIds: string[];
  };
  messageText: string;
  parseMode: ParseMode;
  disableNotification: boolean;
  disableWebPagePreview: boolean;
  keyboard: KeyboardConfig;
  dynamicMessages?: DynamicMessage[];
  handlers?: HandlerData[];
}
