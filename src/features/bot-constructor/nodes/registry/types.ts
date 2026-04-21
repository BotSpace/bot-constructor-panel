export type NodeRegistryStatus = "runtime";

export type NodeSidebarGroupId =
  | "triggers"
  | "actions"
  | "messageOperations"
  | "flowControl"
  | "integrations"
  | "customLogic";

export interface NodeHandleManifest {
  preset?:
    | "target-default"
    | "source-default"
    | "else-source"
    | "selected-message-target"
    | "edit-message-source"
    | "delete-message-source"
    | "subflow-dynamic-sources";
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

export interface NodePreviewManifest {
  key: string;
  placeholder?: string;
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
  preview?: NodePreviewManifest;
  content?: NodeFieldManifest[];
  footer?: NodeFooterManifest[];
  defaults?: Record<string, unknown>;
}

export interface NodeRegistryEntry extends NodeManifest {
  componentStatus: NodeRegistryStatus;
}
