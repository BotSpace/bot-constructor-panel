export interface CollectionListItem {
  id: string | number;
  name: string;
}

export interface CollectionDetail {
  id: number;
  name: string;
  fields: {
    id: number;
    name: string;
    label?: string;
    kind: string;
    required: boolean;
    default: any;
    relation_collection?: number | null;
  }[];
}
