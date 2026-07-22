"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  HighlightedInput,
  HighlightedTextarea,
} from "@/features/bot-constructor/components/HighlightedInput";
import { FieldHelp } from "@/features/bot-constructor/components/FieldHelp";
import { NodeFieldManifest } from "@/features/bot-constructor/manifest/types";
import { renderCustomWidget } from "@/features/bot-constructor/fields/widgetRegistry";
import { ArrayEditorField } from "@/features/bot-constructor/fields/generic-fields/ArrayEditorField";
import { CodeEditorField } from "@/features/bot-constructor/fields/generic-fields/CodeEditorField";
import { ToolParamsField } from "@/features/bot-constructor/fields/generic-fields/ToolParamsField";
import { CollectionSelectField } from "@/features/bot-constructor/fields/generic-fields/CollectionSelectField";
import { BoardSelectField } from "@/features/bot-constructor/fields/generic-fields/BoardSelectField";
import { CredentialSelectField } from "@/features/bot-constructor/fields/generic-fields/CredentialSelectField";
import { NodeSelectField } from "@/features/bot-constructor/fields/generic-fields/NodeSelectField";
import { LocalizedField } from "@/features/bot-constructor/fields/generic-fields/LocalizedField";
import { DynamicSelectField } from "@/features/bot-constructor/fields/generic-fields/DynamicSelectField";
import { WebhookUrlField } from "@/features/bot-constructor/fields/generic-fields/WebhookUrlField";
import { DynamicInputsField } from "@/features/bot-constructor/fields/generic-fields/DynamicInputsField";
import { ConditionListField } from "@/features/bot-constructor/fields/generic-fields/ConditionListField";
import { CronEditorField } from "@/features/bot-constructor/fields/generic-fields/CronEditorField";
import { TriggerConfigField } from "@/features/bot-constructor/fields/generic-fields/TriggerConfigField";
import { DynamicParamsField } from "@/features/bot-constructor/fields/generic-fields/DynamicParamsField";
import { NestedRowsField } from "@/features/bot-constructor/fields/generic-fields/NestedRowsField";
import {
  DynamicButtonForm,
  DEFAULT_COLLECTION_BUTTON,
  type CollectionButtonData,
} from "@/features/bot-constructor/fields/generic-fields/DynamicButtonForm";
import {
  RichTextMessageField,
  MediaMessageField,
} from "@/features/bot-constructor/fields/shared-message-fields";
import { RecipientsManager } from "@/features/bot-constructor/nodes/shared/RecipientSelector";
import { KeyboardConfig } from "@/features/bot-constructor/panels";
import { ButtonConfig } from "@/features/bot-constructor/panels/ButtonGenerator/types";
import { InlineKeyboardEditor } from "@/features/bot-constructor/panels/ButtonGenerator/InlineKeyboardEditor";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useVarSuggestions } from "@/features/bot-constructor/hooks/useVarSuggestions";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

interface ModalFieldWidgetProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: NodeFieldManifest;
  /**
   * OVERRIDE: when provided, the widget reads this value instead of data[field.key].
   * Used by ArrayEditorField to render per-item fields without touching the node root.
   */
  valueOverride?: unknown;
  /**
   * OVERRIDE: when provided, all writes go through onPatch instead of updateNodeData.
   * Used by ArrayEditorField to route writes into the item object.
   */
  onPatch?: (partial: Record<string, unknown>) => void;
}

function FieldShell({
  label,
  helpText,
  children,
  compact = false,
}: {
  label?: string;
  helpText?: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-1.5",
        compact && "flex items-center justify-between gap-3 space-y-0"
      )}
    >
      {label || helpText ? (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {label ? (
            <Label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {label}
            </Label>
          ) : null}
          {helpText ? <FieldHelp text={helpText} /> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function StringArrayField({ nodeId, data, field, onPatch }: ModalFieldWidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const fieldKey = field.key || "";
  const values = Array.isArray(data[fieldKey]) ? (data[fieldKey] as string[]) : [""];

  const write = (partial: Record<string, unknown>) => {
    if (onPatch) {
      onPatch(partial);
    } else {
      updateNodeData(nodeId, partial);
    }
  };

  const updateValue = (index: number, value: string) => {
    const nextValues = [...values];
    nextValues[index] = value;
    write({ [fieldKey]: nextValues });
  };

  return (
    <FieldShell label={field.label} helpText={field.helpText}>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={`${fieldKey}-${index}`} className="flex items-center gap-2">
            <Input
              placeholder={field.itemPlaceholder}
              value={value}
              onChange={(event) => updateValue(index, event.target.value)}
              className="h-10 border-white/10 bg-zinc-950/60"
            />
            {values.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 text-zinc-400 hover:text-red-300"
                onClick={() =>
                  write({
                    [fieldKey]: values.filter((_, currentIndex) => currentIndex !== index),
                  })
                }
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full border-white/10 bg-zinc-950/40"
        onClick={() => write({ [fieldKey]: [...values, ""] })}
      >
        <Plus className="mr-2 h-4 w-4" />
        {field.addButtonLabel || "Qo'shish"}
      </Button>
    </FieldShell>
  );
}

/** Read a value from data by a possibly-dotted key ("context.value", "a.b.c"). */
function getNestedValue(data: Record<string, unknown>, key: string): unknown {
  if (!key.includes(".")) return data[key];
  const parts = key.split(".");
  let current: unknown = data;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Immutably set a value at a dotted path inside data and return a shallow-
 * merge patch suitable for updateNodeData. Only the top-level key changes.
 * E.g. key="context.value", value="hello" produces { context: { ...data.context, value: "hello" } }
 */
function buildNestedPatch(
  data: Record<string, unknown>,
  key: string,
  value: unknown
): Record<string, unknown> {
  if (!key.includes(".")) return { [key]: value };
  const parts = key.split(".");
  const topKey = parts[0];
  // Build from the inside out.
  let patch: unknown = value;
  for (let i = parts.length - 1; i >= 1; i--) {
    const parentPath = parts.slice(0, i);
    // Read current nested parent to preserve sibling keys.
    let currentParent: Record<string, unknown> = {};
    let cursor: unknown = data;
    for (const p of parentPath) {
      if (cursor === null || cursor === undefined || typeof cursor !== "object") { cursor = undefined; break; }
      cursor = (cursor as Record<string, unknown>)[p];
    }
    if (cursor !== null && cursor !== undefined && typeof cursor === "object") {
      currentParent = cursor as Record<string, unknown>;
    }
    patch = { ...currentParent, [parts[i]]: patch };
  }
  return { [topKey]: patch };
}

export function ModalFieldWidget({ nodeId, data, field, valueOverride, onPatch }: ModalFieldWidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const suggestions = useVarSuggestions(nodeId);
  const fieldKey = field.key || "";
  // When valueOverride is defined use it; otherwise read from data.
  const value = valueOverride !== undefined ? valueOverride : getNestedValue(data, fieldKey);
  // Route all writes through onPatch when it's provided; otherwise update the node root.
  const write = (partial: Record<string, unknown>) => {
    if (onPatch) {
      onPatch(partial);
    } else {
      updateNodeData(nodeId, partial);
    }
  };

  if (field.type === "description") {
    return (
      <p className="text-sm leading-6 text-zinc-500">{field.textFallback}</p>
    );
  }

  if (field.type === "richTextMessage") {
    // When i18n: true, delegate to LocalizedField which adds the language-tab
    // strip (only renders tabs when the project has >1 language).
    if (field.i18n) {
      return <LocalizedField nodeId={nodeId} data={data} field={field} />;
    }
    return (
      <RichTextMessageField
        nodeId={nodeId}
        data={data}
        textKey={field.key || "messageText"}
        label={field.label || "Xabar matni"}
        helpText={field.helpText}
        intro={field.intro}
        showParseMode={false}
      />
    );
  }

  if (field.type === "mediaMessage") {
    const kind = field.mediaKind || "photo";
    return <MediaMessageField nodeId={nodeId} data={data} kind={kind} />;
  }

  if (field.type === "array-editor" && field.key && field.itemFields) {
    return (
      <ArrayEditorField
        nodeId={nodeId}
        data={data}
        field={field as Parameters<typeof ArrayEditorField>[0]["field"]}
      />
    );
  }

  if (field.type === "code-editor" && field.key) {
    return (
      <CodeEditorField
        nodeId={nodeId}
        data={data}
        field={field as Parameters<typeof CodeEditorField>[0]["field"]}
        onPatch={onPatch}
      />
    );
  }

  if (field.type === "tool-params") {
    return (
      <ToolParamsField
        nodeId={nodeId}
        data={data}
        field={field as Parameters<typeof ToolParamsField>[0]["field"]}
      />
    );
  }

  if (field.type === "collection-select" && field.key) {
    return (
      <CollectionSelectField
        nodeId={nodeId}
        data={data}
        field={field as Parameters<typeof CollectionSelectField>[0]["field"]}
        onPatch={onPatch}
      />
    );
  }

	if (field.type === "board-select" && field.key) {
		return <BoardSelectField nodeId={nodeId} data={data} field={field} onPatch={onPatch} />;
	}

  if (field.type === "condition-list") {
    return (
      <ConditionListField
        nodeId={nodeId}
        data={data}
        field={field as Parameters<typeof ConditionListField>[0]["field"]}
      />
    );
  }

  if (field.type === "cron-editor") {
    return (
      <CronEditorField
        nodeId={nodeId}
        data={data}
        field={field as Parameters<typeof CronEditorField>[0]["field"]}
      />
    );
  }

  if (field.type === "trigger-config" && field.kind && field.kind !== "message") {
    return (
      <TriggerConfigField
        nodeId={nodeId}
        data={data}
        field={field as Parameters<typeof TriggerConfigField>[0]["field"]}
      />
    );
  }

  if (field.type === "dynamic-params") {
    return (
      <DynamicParamsField
        nodeId={nodeId}
        data={data}
        field={field as Parameters<typeof DynamicParamsField>[0]["field"]}
      />
    );
  }

  if (field.type === "credential") {
    return (
      <CredentialSelectField
        nodeId={nodeId}
        data={data}
        dataKey={field.key || "credential_id"}
        typeKey={field.credentialType}
        label={field.label}
        required={field.required ?? false}
        onPatch={onPatch}
      />
    );
  }

  if (field.type === "node-select") {
    return <NodeSelectField nodeId={nodeId} data={data} field={field} onPatch={onPatch} />;
  }

  if (field.type === "dynamic_select" && field.resource) {
    return (
      <DynamicSelectField
        nodeId={nodeId}
        data={data}
        dataKey={field.key || ""}
        resource={field.resource}
        credentialKey={field.credentialKey}
        dependsOn={field.dependsOn}
        label={field.label}
        placeholder={field.placeholder}
      />
    );
  }

  if (field.type === "read-only") {
    return <WebhookUrlField nodeId={nodeId} data={data} field={field} />;
  }

  if (field.type === "dynamic_inputs" && field.resource) {
    return (
      <DynamicInputsField
        nodeId={nodeId}
        data={data}
        dataKey={field.key || "values"}
        resource={field.resource}
        credentialKey={field.credentialKey}
        dependsOn={field.dependsOn}
        label={field.label}
      />
    );
  }

  if (field.type === "action-recipients") {
    const recipients = (data.recipients as { sendToSender: boolean; additionalIds: string[] }) ?? {
      sendToSender: true,
      additionalIds: [],
    };
    return (
      <RecipientsManager
        recipients={recipients}
        onUpdate={(update) => write(update)}
      />
    );
  }

  if (field.type === "nested-rows" && field.key && field.columnFields) {
    return (
      <NestedRowsField
        nodeId={nodeId}
        data={data}
        field={field as Parameters<typeof NestedRowsField>[0]["field"]}
      />
    );
  }

  // Generic collection binding — reusable in ANY node (not only keyboards).
  if (field.type === "collection-binding" && field.key) {
    const key = field.key;
    const val = (data[key] as CollectionButtonData) ?? DEFAULT_COLLECTION_BUTTON;
    return (
      <DynamicButtonForm
        value={val}
        onChange={(v) => write({ [key]: v })}
      />
    );
  }

  if (field.type === "action-keyboard") {
    const keyboard = (data.keyboard as KeyboardConfig | undefined) ?? {
      active: "inline" as const,
      inline: [] as ButtonConfig[][],
      reply: [] as ButtonConfig[][],
    };
    return <InlineKeyboardEditor initialKeyboard={keyboard} node_id={nodeId} />;
  }

  if (field.type === "widget") {
    const widget = renderCustomWidget({ nodeId, data, field });
    return widget ?? (
      <p className="text-sm text-red-300">
        Modal widget topilmadi: {field.widgetKey || "unknown"}
      </p>
    );
  }

  if (field.type === "stringArray") {
    return <StringArrayField nodeId={nodeId} data={data} field={field} onPatch={onPatch} />;
  }

  if (field.type === "select") {
    // Tab-style variant: render options as a segmented control (good for ≤4 options)
    if (field.variant === "tabs") {
      const current = typeof value === "string" ? value : "";
      return (
        <FieldShell label={field.label} helpText={field.helpText}>
          <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
            {field.options?.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => write(buildNestedPatch(data, fieldKey, option.value))}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  current === option.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FieldShell>
      );
    }

    // Radix Select.Item rejects value="" — map empty-string option values to the
    // sentinel "__empty__" internally so Radix doesn't throw, then convert back
    // to "" when persisting so the engine receives the expected empty value.
    const EMPTY_SENTINEL = "__empty__";
    const toSelectValue = (v: string) => (v === "" ? EMPTY_SENTINEL : v);
    const fromSelectValue = (v: string) => (v === EMPTY_SENTINEL ? "" : v);
    const currentSelectValue = toSelectValue(typeof value === "string" ? value : "");

    return (
      <FieldShell label={field.label} helpText={field.helpText}>
        <Select
          value={currentSelectValue}
          onValueChange={(nextValue) =>
            write(buildNestedPatch(data, fieldKey, fromSelectValue(nextValue)))
          }
        >
          <SelectTrigger className="h-10 border-white/10 bg-zinc-950/60">
            <SelectValue placeholder={field.placeholder || "Tanlang"} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => {
              const itemValue = toSelectValue(option.value);
              return (
                <SelectItem key={itemValue} value={itemValue}>
                  {option.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </FieldShell>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="space-y-1">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-200">
            <Checkbox
              checked={Boolean(value)}
              onCheckedChange={(checked) =>
                write(buildNestedPatch(data, fieldKey, checked === true))
              }
            />
            {field.label}
          </Label>
          {field.helpText ? <FieldHelp text={field.helpText} /> : null}
        </div>
      </div>
    );
  }

  if (field.type === "switch") {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => write(buildNestedPatch(data, fieldKey, checked))}
          />
          {field.label ? <Label className="cursor-pointer text-sm text-zinc-200">{field.label}</Label> : null}
          {field.helpText ? <FieldHelp text={field.helpText} /> : null}
        </div>
      </div>
    );
  }

  if (field.type === "textarea") {
    // When i18n: true, delegate to LocalizedField which adds language-tab strip.
    if (field.i18n) {
      return <LocalizedField nodeId={nodeId} data={data} field={field} />;
    }
    return (
      <FieldShell label={field.label} helpText={field.helpText}>
        <HighlightedTextarea
          placeholder={field.placeholder}
          rows={field.rows}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => write(buildNestedPatch(data, fieldKey, event.target.value))}
          className="border-white/10 bg-zinc-950/60"
          suggestions={suggestions}
        />
      </FieldShell>
    );
  }

  const inputType = field.type === "number" ? "number" : "text";
  // `text` fields legitimately hold numbers — e.g. a PaymentNode `amount` the
  // agent/import wrote as a JSON number (the field is `text` so it can also take
  // `{{state.summa}}`). Coerce numeric values to string; otherwise the input
  // renders empty even though the value exists and the engine reads it fine.
  const normalizedValue =
    field.type === "number"
      ? value === undefined || value === null
        ? ""
        : String(value)
      : typeof value === "string"
        ? value
        : typeof value === "number"
          ? String(value)
          : "";

  // number fields don't contain {{vars}}, use plain Input
  if (field.type === "number") {
    return (
      <FieldShell label={field.label} helpText={field.helpText}>
        <Input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={field.placeholder}
          value={normalizedValue}
          onChange={(event) => {
            const rawValue = event.target.value;
            write(buildNestedPatch(data, fieldKey, rawValue === "" ? undefined : Number(rawValue)));
          }}
          className="h-10 border-white/10 bg-zinc-950/60"
        />
      </FieldShell>
    );
  }

  // text fields with i18n: true — delegate to LocalizedField for language tabs.
  if (field.i18n) {
    return <LocalizedField nodeId={nodeId} data={data} field={field} />;
  }

  return (
    <FieldShell label={field.label} helpText={field.helpText}>
      <HighlightedInput
        type={inputType}
        min={field.min}
        max={field.max}
        step={field.step}
        placeholder={field.placeholder}
        value={normalizedValue}
        onChange={(event) => {
          write(buildNestedPatch(data, fieldKey, event.target.value));
        }}
        className="h-10 border-white/10 bg-zinc-950/60"
        suggestions={suggestions}
      />
    </FieldShell>
  );
}
