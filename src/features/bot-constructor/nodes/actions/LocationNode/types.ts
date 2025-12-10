import { KeyboardConfig } from "@/features/bot-constructor/components/ButtonGenerator/types";

export interface SendLocationNodeData {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };
  latitude?: number;
  longitude?: number;
  keyboard: KeyboardConfig; // <-- O'ZGARISH SHU YERDA
}
