"use client";

import { Button } from "@/components/ui/button";
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
  StateConfigUI,
  getStateTypesForCommandTrigger,
} from "@/features/bot-constructor/nodes/triggers/shared";
import { NodeFieldManifest } from "@/features/bot-constructor/nodes/registry/types";
import { renderCustomWidget } from "@/features/bot-constructor/nodes/widgets/widgetRegistry";
import { ArrayEditorField } from "@/features/bot-constructor/nodes/widgets/generic-fields/ArrayEditorField";
import { CodeEditorField } from "@/features/bot-constructor/nodes/widgets/generic-fields/CodeEditorField";
import { CollectionSelectField } from "@/features/bot-constructor/nodes/widgets/generic-fields/CollectionSelectField";
import { StateTypeSelectField } from "@/features/bot-constructor/nodes/widgets/generic-fields/StateTypeSelectField";
import { ConditionListField } from "@/features/bot-constructor/nodes/widgets/generic-fields/ConditionListField";
import { CronEditorField } from "@/features/bot-constructor/nodes/widgets/generic-fields/CronEditorField";
import { TriggerConfigField } from "@/features/bot-constructor/nodes/widgets/generic-fields/TriggerConfigField";
import { DynamicParamsField } from "@/features/bot-constructor/nodes/widgets/generic-fields/DynamicParamsField";
import { NestedRowsField } from "@/features/bot-constructor/nodes/widgets/generic-fields/NestedRowsField";
import {
  DynamicButtonForm,
  DEFAULT_COLLECTION_BUTTON,
  type CollectionButtonData,
} from "@/features/bot-constructor/nodes/widgets/generic-fields/DynamicButtonForm";
import {
  RichTextMessageField,
  MediaMessageField,
} from "@/features/bot-constructor/nodes/widgets/shared-message-fields";
import { RecipientsManager } from "@/features/bot-constructor/nodes/actions/shared/RecipientSelector";
import { KeyboardConfig } from "@/features/bot-constructor/components";
import { ButtonConfig } from "@/features/bot-constructor/components/ButtonGenerator/types";
import { InlineKeyboardEditor } from "@/features/bot-constructor/components/ButtonGenerator/InlineKeyboardEditor";
import { HandlerAdder } from "@/features/bot-constructor/nodes/actions/shared/HandlerBuilder";
import { useFlowStore } from "@/features/bot-constructor/store";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

interface ModalFieldWidgetProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: NodeFieldManifest;
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
      {label ? (
        <Label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {label}
        </Label>
      ) : null}
      {children}
      {helpText ? <p className="text-xs leading-relaxed text-zinc-500">{helpText}</p> : null}
    </div>
  );
}

function StringArrayField({ nodeId, data, field }: ModalFieldWidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const fieldKey = field.key || "";
  const values = Array.isArray(data[fieldKey]) ? (data[fieldKey] as string[]) : [""];

  const updateValue = (index: number, value: string) => {
    const nextValues = [...values];
    nextValues[index] = value;
    updateNodeData(nodeId, { [fieldKey]: nextValues });
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
                  updateNodeData(nodeId, {
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
        onClick={() => updateNodeData(nodeId, { [fieldKey]: [...values, ""] })}
      >
        <Plus className="mr-2 h-4 w-4" />
        {field.addButtonLabel || "Qo'shish"}
      </Button>
    </FieldShell>
  );
}

function StateConfigField({ nodeId, data, field }: ModalFieldWidgetProps) {
  if (field.variant !== "commandTrigger") {
    return null;
  }

  return (
    <FieldShell label="State sozlamasi">
      <StateConfigUI
        state={data.state as never}
        nodeId={nodeId}
        availableTypes={getStateTypesForCommandTrigger()}
        onStateChange={(state) => {
          useFlowStore.getState().updateNodeData(nodeId, { state });
        }}
      />
    </FieldShell>
  );
}

export function ModalFieldWidget({ nodeId, data, field }: ModalFieldWidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const fieldKey = field.key || "";
  const value = data[fieldKey];

  if (field.type === "description") {
    return (
      <p className="text-sm leading-6 text-zinc-500">{field.textFallback}</p>
    );
  }

  if (field.type === "richTextMessage") {
    return (
      <RichTextMessageField
        nodeId={nodeId}
        data={data}
        textKey={field.key || "messageText"}
        dynamicKey="dynamicMessages"
        label={field.label || "Xabar matni"}
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
      />
    );
  }

  if (field.type === "collection-select" && field.key) {
    return (
      <CollectionSelectField
        nodeId={nodeId}
        data={data}
        field={field as Parameters<typeof CollectionSelectField>[0]["field"]}
      />
    );
  }

  if (field.type === "state-type-select") {
    return (
      <StateTypeSelectField
        nodeId={nodeId}
        data={data}
        field={field as Parameters<typeof StateTypeSelectField>[0]["field"]}
      />
    );
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

  if (field.type === "trigger-config" && field.kind) {
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

  if (field.type === "action-recipients") {
    const recipients = (data.recipients as { sendToSender: boolean; additionalIds: string[] }) ?? {
      sendToSender: true,
      additionalIds: [],
    };
    return (
      <RecipientsManager
        recipients={recipients}
        onUpdate={(update) => updateNodeData(nodeId, update)}
      />
    );
  }

  if (field.type === "action-handlers") {
    return <HandlerAdder sourceNodeId={nodeId} />;
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
        onChange={(v) => useFlowStore.getState().updateNodeData(nodeId, { [key]: v })}
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

  if (field.type === "stateConfig") {
    return <StateConfigField nodeId={nodeId} data={data} field={field} />;
  }

  if (field.type === "stringArray") {
    return <StringArrayField nodeId={nodeId} data={data} field={field} />;
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
                onClick={() => updateNodeData(nodeId, { [fieldKey]: option.value })}
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

    return (
      <FieldShell label={field.label} helpText={field.helpText}>
        <Select
          value={typeof value === "string" ? value : ""}
          onValueChange={(nextValue) => updateNodeData(nodeId, { [fieldKey]: nextValue })}
        >
          <SelectTrigger className="h-10 border-white/10 bg-zinc-950/60">
            <SelectValue placeholder={field.placeholder || "Tanlang"} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldShell>
    );
  }

  if (field.type === "checkbox" || field.type === "switch") {
    return (
      <FieldShell compact>
        {field.label ? <Label className="cursor-pointer text-sm text-zinc-200">{field.label}</Label> : null}
        <Switch
          checked={Boolean(value)}
          onCheckedChange={(checked) => updateNodeData(nodeId, { [fieldKey]: checked })}
        />
      </FieldShell>
    );
  }

  if (field.type === "textarea") {
    return (
      <FieldShell label={field.label} helpText={field.helpText}>
        <Textarea
          placeholder={field.placeholder}
          rows={field.rows}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => updateNodeData(nodeId, { [fieldKey]: event.target.value })}
          className="min-h-28 border-white/10 bg-zinc-950/60"
        />
      </FieldShell>
    );
  }

  const inputType = field.type === "number" ? "number" : "text";
  const normalizedValue =
    field.type === "number"
      ? value === undefined || value === null
        ? ""
        : String(value)
      : typeof value === "string"
        ? value
        : "";

  return (
    <FieldShell label={field.label} helpText={field.helpText}>
      <Input
        type={inputType}
        min={field.min}
        max={field.max}
        step={field.step}
        placeholder={field.placeholder}
        value={normalizedValue}
        onChange={(event) => {
          if (field.type === "number") {
            const rawValue = event.target.value;
            updateNodeData(nodeId, {
              [fieldKey]: rawValue === "" ? undefined : Number(rawValue),
            });
            return;
          }

          updateNodeData(nodeId, { [fieldKey]: event.target.value });
        }}
        className="h-10 border-white/10 bg-zinc-950/60"
      />
    </FieldShell>
  );
}
