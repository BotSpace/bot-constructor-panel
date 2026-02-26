import { HandlerData } from "../TextMessageNode/types";
import { KeyboardConfig } from "@/features/bot-constructor/components/ButtonGenerator/types";

export interface SendContactNodeData {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  vcard?: string;
  keyboard?: KeyboardConfig;
  handlers?: HandlerData[];
}
