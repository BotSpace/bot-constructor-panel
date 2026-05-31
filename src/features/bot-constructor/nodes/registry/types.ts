export type NodeRegistryStatus = "runtime";

export type NodeSidebarGroupId =
  | "triggers"
  | "actions"
  | "messageOperations"
  | "flowControl"
  | "integrations"
  | "customLogic"
  | "ai";

export interface NodeAccessoryPortManifest {
  /** Port type; the engine targetHandle is `acc:${portType}`. FROZEN values: "ai_model" | "ai_tool". */
  portType: string;
  /** i18n key for the port label rendered under the node. */
  labelKey?: string;
  /** Fallback label text. */
  labelFallback: string;
  /** Node `type` strings this port accepts (drag validation). */
  accepts: string[];
  /** 1 = single (ai_model), undefined/0 = unbounded (ai_tool). */
  maxConnections?: number;
  /** Pill tone. */
  styleVariant?: "default" | "success" | "warning" | "danger" | "accent";
}

export interface NodeHandleManifest {
  preset?:
    | "target-default"
    | "source-default"
    | "else-source"
    | "selected-message-target"
    | "edit-message-source"
    | "delete-message-source"
    | "subflow-dynamic-sources"
    | "dynamic-outputs-sources"
    | "accessory-ports";
  kind?: "source" | "target";
  id?: string;
  side?: "left" | "right" | "top" | "bottom";
  offsetClass?: string;
  styleVariant?: "default" | "success" | "warning" | "danger" | "accent";
}

export interface NodeVisibilityRule {
  key: string;
  equals?: unknown;
  notEquals?: unknown;
}

export interface NodeFieldOptionManifest {
  value: string;
  label: string;
}

export interface NodeFieldManifest {
  type:
    | "description"
    | "widget"
    | "text"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "switch"
    | "stringArray"
    | "stateConfig";
  key?: string;
  widgetKey?: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  textKey?: string;
  textFallback?: string;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  options?: NodeFieldOptionManifest[];
  itemPlaceholder?: string;
  addButtonLabel?: string;
  visibleWhen?: NodeVisibilityRule;
  variant?: "commandTrigger";
}

export interface NodeFooterManifest {
  type: "actionPanel" | "handlersList";
  variant?: "messageBasic";
  hideHandlers?: boolean;
}

export interface NodeManifest {
  type: string;
  status: NodeRegistryStatus;
  category: string;
  titleKey: string;
  descriptionKey: string;
  titleFallback: string;
  descriptionFallback: string;
  titleTemplate?: string;
  iconName: string;
  colorToken: string;
  size: {
    width: number;
    minHeight?: number;
    height?: number;
  };
  sidebar?: {
    enabled: boolean;
    groupId: NodeSidebarGroupId;
    sortOrder: number;
    elementType: string;
  };
  handles?: NodeHandleManifest[];
  content?: NodeFieldManifest[];
  footer?: NodeFooterManifest[];
  defaults?: Record<string, unknown>;

  /** True = this node is a helper sub-node, never traversed as a flow step.
   *  Drives: no flow target handle, sidebar "ai" styling, drag-validation. */
  accessory?: boolean;

  /** Accessory ports this node EXPOSES (only on parent flow nodes, e.g. AIAgentNode). */
  accessoryPorts?: NodeAccessoryPortManifest[];

  /** For accessory nodes: which parent port type(s) this node may attach to.
   *  e.g. provider nodes => ["ai_model"], tool nodes => ["ai_tool"]. */
  accessoryAttachesTo?: string[];

  /** Dynamic field groups for provider/tool config rendered in the side panel.
   *  Reuses NodeFieldManifest. Optional — most nodes use `content`. */
  configFields?: NodeFieldManifest[];
}

export interface NodeRegistryEntry extends NodeManifest {
  componentStatus: NodeRegistryStatus;
}
