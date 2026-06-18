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
    | "source-bottom"
    | "source-top"
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
  /** Show when the watched field's value is one of these. */
  oneOf?: unknown[];
  key: string;
  equals?: unknown;
  notEquals?: unknown;
}

export interface NodeFieldOptionManifest {
  value: string;
  label: string;
}

/** Item field spec for array-editor type */
export interface ArrayEditorItemFieldSpec {
  key: string;
  type: "text" | "number" | "select" | "checkbox" | "switch" | "textarea";
  label?: string;
  placeholder?: string;
  options?: NodeFieldOptionManifest[];
  visibleWhen?: NodeVisibilityRule;
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
    | "stateConfig"
    | "richTextMessage"
    | "mediaMessage"
    // Generic manifest-driven field types
    | "array-editor"
    | "code-editor"
    | "collection-select"
    | "state-type-select"
    | "condition-list"
    | "cron-editor"
    | "trigger-config"
    | "dynamic-params"
    | "tool-params"
    // Action panel sub-sections (optional-capable)
    | "action-recipients"
    | "action-keyboard"
    // Nested row/column editor (generic; used for keyboards)
    | "nested-rows"
    // Collection binding (generic; collection + field mapping + filter +
    // pagination — reusable in any node, not only keyboard buttons)
    | "collection-binding"
    // Credential selector — shows only credentials matching `credentialType`
    | "credential"
    | "dynamic_inputs"
    // Dynamic (load-options) select — loads options from backend via credential
    | "dynamic_select";
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
  /** true = hidden by default; user explicitly adds via "Add option" dropdown */
  optional?: boolean;
  /** true = field is required (shows a "required" hint; used by the credential field) */
  required?: boolean;
  /**
   * Explicit control over whether an `optional` field is shown by default in
   * the node edit panel (overrides the value-based heuristic):
   *   - true  → always shown by default (even with no value)
   *   - false → hidden by default, EXCEPT when it already holds a non-default
   *             value (so a configured keyboard type / parse mode is never
   *             hidden, which would look like data loss); otherwise reachable
   *             only via "Add optional field"
   *   - undefined → value-based: shown only when the field already holds a non-default value
   */
  defaultVisible?: boolean;
  /** For select: "tabs" renders a segmented control instead of a dropdown (use for ≤4 options) */
  variant?: "commandTrigger" | "tabs";
  /** true = field value is auto-saved to flow context as state_<key>; shown read-only in the variable panel */
  is_state?: boolean;
  /** For richTextMessage: intro text shown above the editor */
  intro?: string;
  /** For richTextMessage: label for the text area; for mediaMessage: media kind */
  mediaKind?: "photo" | "video" | "audio" | "file";
  // array-editor
  addLabel?: string;
  maxItems?: number;
  defaultItem?: Record<string, unknown>;
  itemFields?: ArrayEditorItemFieldSpec[];
  // code-editor
  outputsKey?: string;
  language?: "javascript" | "python";
  // collection-select
  withFieldMapping?: boolean;
  withFilters?: boolean;
  contextKeyField?: string;
  // state-type-select
  keyField?: string;
  typeField?: string;
  // condition-list
  operatorKey?: string;
  conditionsKey?: string;
  // cron-editor (key reused)
  // trigger-config
  kind?: "message" | "callback" | "reply";
  stateOptional?: boolean;
  // dynamic-params
  schemaKey?: string;
  paramsKey?: string;
  descriptionKey?: string;
  // credential field
  /** Required credential type key (e.g. "telegram", "openai"). When set the
   *  selector shows only credentials of this type and the "new credential"
   *  dialog opens pre-locked to this type. Omit to show all credentials. */
  credentialType?: string;
  // dynamic_select field
  /** Resource name passed to POST /v1/credentials/options/<resource>/ */
  resource?: string;
  /** Data key that holds the credential id used by this dynamic field (default: "credential_id") */
  credentialKey?: string;
  /** Other data keys this resource depends on (their values become `params`) */
  dependsOn?: string[];
  // nested-rows
  addRowLabel?: string;
  addColumnLabel?: string;
  maxColumns?: number;
  defaultColumn?: Record<string, unknown>;
  columnFields?: {
    key: string;
    type: "text" | "select" | "switch";
    label?: string;
    placeholder?: string;
    options?: NodeFieldOptionManifest[];
    visibleWhen?: NodeVisibilityRule;
  }[];
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

  /** State keys this node ALWAYS produces just by being used (no field needed).
   *  They appear in the variable panel for the node and its descendants.
   *  e.g. HTTPRequestNode → ["http_response"]. */
  producesState?: string[];

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
