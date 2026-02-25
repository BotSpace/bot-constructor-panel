import { HandlerData } from "../TextMessageNode/types";

export interface SendContactNodeData {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  vcard?: string;
  handlers?: HandlerData[];
}
