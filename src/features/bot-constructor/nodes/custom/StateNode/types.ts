// src/features/bot-constructor/nodes/custom/StateNode/types.ts

import { ElementItemType } from "@/types/element-types";

export interface StateNodeData {
  key: string;
  type: string;
  customType?: string;
  node_type: ElementItemType["triggerId"];
}
