// LoadCollectionItemNode types

import { CollectionListItem } from "@/types/http/collection";
import { Filter } from "../../actions/shared/filter/types";

export interface LoadCollectionItemNodeData {
  collection: CollectionListItem | null;
  filters: Filter[];
  contextKey: string; // Key for storing in context, e.g., "selected_film"
  node_type: "LoadCollectionItemNode";
}
