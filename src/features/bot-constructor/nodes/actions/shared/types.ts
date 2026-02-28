// ==============================
// Parse mode for text messages

import { CollectionListItem } from "@/types/http/collection";
import { Filter } from "./filter/types";

// ==============================
export type ParseMode = "HTML" | "None";

// ==============================
// Dynamic Message Type
// ==============================
export interface DynamicMessage {
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
  messageText?: string;
}

export interface BaseAction {

}
