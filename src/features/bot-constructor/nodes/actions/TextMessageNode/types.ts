import {
  ButtonConfig,
  KeyboardConfig,
} from "@/features/bot-constructor/components/ButtonGenerator/types";
import { CollectionListItem } from "@/types/http/collection";
import { Filter } from "./components/filter/types";
import { OutputData } from "@editorjs/editorjs";

export type ParseMode = "HTML" | "None";

export interface SendTextMessageNodeData {
  recipients: {
    sendToSender: boolean;
    additionalIds: string[];
  };
  messageText: OutputData | undefined;
  parseMode: ParseMode;
  disableNotification: boolean;
  protectContent: boolean;
  dynamicMessages?: {
    name: string;
    // Qaysi collectiondan olish kerak
    collection: CollectionListItem;
    // Qaysi operatorlar kerak
    filters: Filter[];
    // Qaysi qiymatlar kerak
    values: string[];
    // Qaysi tartibda olish kerak
    orderBy: string;
    // Qaysi tartibda olish kerak
    orderDirection: "asc" | "desc";
    // Pagination enabled
    enablePagination?: boolean;
    // Qaysi limitda olish kerak
    limit: number;
    // Qaysi offsetda olish kerak
    offset: number;
    // Qaysi matn kerak
    messageText?: OutputData;
  }[];
  // `buttons` va `keyboardType` o'rniga bitta obyekt keladi
  keyboard: KeyboardConfig; // <-- O'ZGARISH SHU YERDA
}
