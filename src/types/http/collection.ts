export interface CollectionField {
  id: string | number;
  name: string;
  label?: string;
  kind: string;
  type?: string;
  required: boolean;
  default: any;
  relation_collection?: string | number | null;
  relation_collection_id?: string | null;
}

export interface CollectionListItem {
  id: string | number;
  name: string;
  slug?: string;
  system?: boolean;
  fields?: CollectionField[];
}

export interface CollectionDetail {
  id: string | number;
  name: string;
  slug?: string;
  fields: CollectionField[];
}
