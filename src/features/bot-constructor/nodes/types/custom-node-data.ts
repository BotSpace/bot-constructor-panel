import { KeyboardConfig } from "@/features/bot-constructor/components";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";
import { Filter } from "@/features/bot-constructor/nodes/actions/shared/filter/types";
import { CollectionListItem } from "@/types/http/collection";
import { ElementItemType } from "@/types/element-types";
import { RadiusContext, SizeContext } from "./trigger-node-data";

export interface CallbackAnswerNodeData {
  keyboard: KeyboardConfig;
}






export interface CustomCodeNodeData {
  label: string;
  jsCode: string;
  language: "javascript";
  globals?: string[];
  outputs?: { name: string; description?: string }[];
}




export interface FormNodeData {
  items: {
    question: string;
    order: number;
    type: MessageTriggerValueTypes;
    filter: string;
    key: string;
    context: {
      value?: string;
      radius?: RadiusContext;
      size?: SizeContext;
    };
    keyboard?: KeyboardConfig;
  }[];
}



export interface StateNodeData {
  key: string;
  type: string;
  customType?: string;
  node_type: ElementItemType["triggerId"];
  collectionField?: string;
}


export interface SubFlowNodeData {
  slug: string;
  pluginName?: string;
  pluginDescription?: string;
  params: Record<string, unknown>;
  paramsSchema?: Record<string, unknown>;
  outputs?: { name: string; description: string }[];
}

