// src/features/bot-constructor/nodes/custom/DownloadNode/types.ts

import { ElementItemType } from "@/types/element-types";

export interface DownloadNodeData {
  key: string;
  node_type: ElementItemType["triggerId"];
}

