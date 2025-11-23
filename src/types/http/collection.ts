export interface CollectionListItem {
  id: number;
  name: string;
}

export interface CollectionDetail {
  id: number;
  name: string;
  fields: {
    id: number;
    name: string;
    type: "text" | "number" | "bool" | "datetime";
    required: boolean;
    default: any;
  }[];
}
