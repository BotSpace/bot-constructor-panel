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
  StateConfigUI,
  getStateTypesForCommandTrigger,
} from "@/features/bot-constructor/nodes/triggers/shared";
import { NodeFieldManifest } from "@/features/bot-constructor/nodes/registry/types";
import { renderCustomWidget } from "@/features/bot-constructor/nodes/widgets/widgetRegistry";
import { ArrayEditorField } from "@/features/bot-constructor/nodes/widgets/generic-fields/ArrayEditorField";
import { CodeEditorField } from "@/features/bot-constructor/nodes/widgets/generic-fields/CodeEditorField";
import { CollectionSelectField } from "@/features/bot-constructor/nodes/widgets/generic-fields/CollectionSelectField";
import { StateTypeSelectField } from "@/features/bot-constructor/nodes/widgets/generic-fields/StateTypeSelectField";
import {
  RichTextMessageField,
  MediaMessageField,
} from "@/features/bot-constructor/nodes/widgets/shared-message-fields";
import { useFlowStore } from "@/features/bot-constructor/store";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

interface ModalFieldWidgetProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: NodeFieldManifest;
}

function HelpText({ text }: { text?: string }) {
  if (!text) {
    return null;
  }

  return <p className="text-xs leading-5 text-zinc-500">{text}</p>;
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
        "rounded-2xl border border-white/10 bg-white/[0.03] p-4",
        compact ? "space-y-2" : "space-y-3"
      )}
    >
      {label ? (
        <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
          {label}
        </Label>
      ) : null}
      {children}
      <HelpText text={helpText} />
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
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm leading-6 text-zinc-400">
        {field.textFallback}
      </div>
    );
  }

  if (field.type === "richTextMessage") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <RichTextMessageField
          nodeId={nodeId}
          data={data}
          textKey={field.key || "messageText"}
          dynamicKey="dynamicMessages"
          label={field.label || "Xabar matni"}
          intro={field.intro}
          showParseMode={false}
        />
      </div>
    );
  }

  if (field.type === "mediaMessage") {
    const kind = field.mediaKind || "photo";
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <MediaMessageField nodeId={nodeId} data={data} kind={kind} />
      </div>
    );
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

  if (field.type === "widget") {
    const widget = renderCustomWidget({ nodeId, data, field });

    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        {widget ?? (
          <p className="text-sm text-red-300">
            Modal widget topilmadi: {field.widgetKey || "unknown"}
          </p>
        )}
      </div>
    );
  }

  if (field.type === "stateConfig") {
    return <StateConfigField nodeId={nodeId} data={data} field={field} />;
  }

  if (field.type === "stringArray") {
    return <StringArrayField nodeId={nodeId} data={data} field={field} />;
  }

  if (field.type === "select") {
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

  if (field.type === "checkbox") {
    return (
      <FieldShell compact>
        <Label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-200">
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(checked) =>
              updateNodeData(nodeId, { [fieldKey]: Boolean(checked) })
            }
          />
          <span>{field.label}</span>
        </Label>
      </FieldShell>
    );
  }

  if (field.type === "switch") {
    return (
      <FieldShell compact>
        <div className="flex items-center justify-between gap-3">
          {field.label ? <Label className="text-sm text-zinc-200">{field.label}</Label> : null}
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => updateNodeData(nodeId, { [fieldKey]: checked })}
          />
        </div>
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
