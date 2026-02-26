import { HandlerData } from "../TextMessageNode/types";
import { KeyboardConfig } from "@/features/bot-constructor/components/ButtonGenerator/types";

export interface PollOption {
  text: string;
}

export interface SendPollNodeData {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };
  question?: string;
  options?: PollOption[];
  isAnonymous?: boolean;
  type?: "regular" | "quiz";
  allowsMultipleAnswers?: boolean;
  correctOptionId?: number;
  explanation?: string;
  openPeriod?: number;
  closeDate?: string;
  keyboard?: KeyboardConfig;
  handlers?: HandlerData[];
}
