import { KeyboardConfig } from "@/features/bot-constructor/components/ButtonGenerator/types";
import { DynamicMessage, ParseMode } from "../shared/types";
import { CallbackQueryTriggerData, MessageTriggerNodeData, ReplyButtonTriggerData } from "../shared/HandlerBuilder/types";

export type HandlerData =
  | MessageTriggerNodeData
  | ReplyButtonTriggerData
  | CallbackQueryTriggerData;

export interface SendTextMessageNodeData {
  recipients: {
    sendToSender: boolean;
    additionalIds: string[];
  };
  messageText: string;
  parseMode: ParseMode;
  disableNotification: boolean;
  protectContent: boolean;
  dynamicMessages?: DynamicMessage[];
  // `buttons` va `keyboardType` o'rniga bitta obyekt keladi
  keyboard: KeyboardConfig; // <-- O'ZGARISH SHU YERDA
  handlers?: HandlerData[];
}
