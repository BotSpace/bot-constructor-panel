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
    type:
      | "text"
      | "number"
      | "bool"
      | "datetime"
      | "file"
      | "audio"
      | "video"
      | "photo";

    required: boolean;
    default: any;
  }[];
}
