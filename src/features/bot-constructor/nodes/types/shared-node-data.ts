import { CollectionListItem } from "@/types/http/collection";
import { Filter } from "@/features/bot-constructor/nodes/actions/shared/filter/types";

export type ParseMode = "HTML" | "None";

export interface DynamicMessage {
  name: string;
  collection: CollectionListItem;
  filters: Filter[];
  values: string[];
  orderBy: string;
  orderDirection: "asc" | "desc";
  enablePagination?: boolean;
  limit: number;
  offset: number;
  messageText?: string;
}

export interface RecipientConfig {
  sendToSender: boolean;
  additionalIds: string[];
}

export type RecipientType = "sender" | "custom_id";

export interface BaseAction {}

