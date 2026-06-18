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
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  StateConfigUI,
  getStateTypesForCommandTrigger,
} from "@/features/bot-constructor/nodes/triggers/shared";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { memo } from "react";
import { NodeFieldManifest } from "./types";
import { renderCustomWidget } from "@/features/bot-constructor/nodes/widgets/widgetRegistry";
import {
  RichTextMessageField,
  MediaMessageField,
} from "@/features/bot-constructor/nodes/widgets/shared-message-fields";
import { CredentialSelectField } from "@/features/bot-constructor/nodes/widgets/generic-fields/CredentialSelectField";

interface FieldWidgetProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: NodeFieldManifest;
}

function HelpText({ text }: { text?: string }) {
  if (!text) {
    return null;
  }

  return <p className="text-xs text-muted-foreground">{text}</p>;
}

function StringArrayField({ nodeId, data, field }: FieldWidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const values = Array.isArray(data[field.key || ""])
    ? (data[field.key || ""] as string[])
    : [""];

  const handleValueChange = (index: number, value: string) => {
    const nextValues = [...values];
    nextValues[index] = value;
    updateNodeData(nodeId, { [field.key || ""]: nextValues });
  };

  const handleAdd = () => {
    updateNodeData(nodeId, { [field.key || ""]: [...values, ""] });
  };

  const handleRemove = (index: number) => {
    if (values.length <= 1) {
      return;
    }

    updateNodeData(nodeId, {
      [field.key || ""]: values.filter((_, currentIndex) => currentIndex !== index),
    });
  };

  return (
    <div className="grid gap-2">
      {field.label ? <Label>{field.label}</Label> : null}
      <div className="grid gap-2">
        {values.map((value, index) => (
          <div key={`${field.key}-${index}`} className="flex items-center gap-2">
            <Input
              placeholder={field.itemPlaceholder}
              value={value}
              onChange={(event) => handleValueChange(index, event.target.value)}
              className="flex-1"
            />
            {values.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => handleRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {field.addButtonLabel || "Qo'shish"}
        </Button>
      </div>
    </div>
  );
}

function StateConfigField({ nodeId, data, field }: FieldWidgetProps) {
  if (field.variant !== "commandTrigger") {
    return null;
  }

  return (
    <StateConfigUI
      state={data.state as never}
      nodeId={nodeId}
      availableTypes={getStateTypesForCommandTrigger()}
      onStateChange={(state) => {
        useFlowStore.getState().updateNodeData(nodeId, { state });
      }}
    />
  );
}

// Field types that are only meaningful in the side panel — never rendered on
// the compact canvas node body.
const PANEL_ONLY_FIELD_TYPES = new Set([
  "nested-rows",
  "action-keyboard",
  "action-recipients",
  "code-editor",
  "collection-select",
  "condition-list",
  "cron-editor",
  "trigger-config",
  "dynamic-params",
  "array-editor",
  "state-type-select",
  "collection-binding",
  "credential",
  "dynamic_select",
]);

function DefaultFieldWidget({ nodeId, data, field }: FieldWidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const fieldKey = field.key || "";
  const value = data[fieldKey];

  if (PANEL_ONLY_FIELD_TYPES.has(field.type)) {
    return null;
  }

  if (field.type === "description") {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        {field.textFallback}
      </div>
    );
  }

  if (field.type === "widget") {
    return renderCustomWidget({ nodeId, data, field });
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

  if (field.type === "stateConfig") {
    return <StateConfigField nodeId={nodeId} data={data} field={field} />;
  }

  if (field.type === "stringArray") {
    return <StringArrayField nodeId={nodeId} data={data} field={field} />;
  }

  if (field.type === "select") {
    return (
      <div className="grid gap-2">
        {field.label ? <Label>{field.label}</Label> : null}
        <Select
          value={typeof value === "string" ? value : ""}
          onValueChange={(nextValue) =>
            updateNodeData(nodeId, { [fieldKey]: nextValue })
          }
        >
          <SelectTrigger>
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
        <HelpText text={field.helpText} />
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <Label className="flex items-center gap-2 cursor-pointer">
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(checked) =>
            updateNodeData(nodeId, { [fieldKey]: Boolean(checked) })
          }
        />
        <span>{field.label}</span>
      </Label>
    );
  }

  if (field.type === "switch") {
    return (
      <div className="flex items-center justify-between gap-2">
        {field.label ? <Label>{field.label}</Label> : null}
        <Switch
          checked={Boolean(value)}
          onCheckedChange={(checked) =>
            updateNodeData(nodeId, { [fieldKey]: checked })
          }
        />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="grid gap-2">
        {field.label ? <Label>{field.label}</Label> : null}
        <Textarea
          placeholder={field.placeholder}
          rows={field.rows}
          value={typeof value === "string" ? value : ""}
          onChange={(event) =>
            updateNodeData(nodeId, { [fieldKey]: event.target.value })
          }
        />
        <HelpText text={field.helpText} />
      </div>
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
    <div className="grid gap-2">
      {field.label ? <Label>{field.label}</Label> : null}
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
      />
      <HelpText text={field.helpText} />
    </div>
  );
}

export const FieldWidget = memo(DefaultFieldWidget);

export function isFieldVisible(
  data: Record<string, unknown>,
  field: NodeFieldManifest
) {
  if (!field.visibleWhen) {
    return true;
  }

  const currentValue = data[field.visibleWhen.key];

  if (Object.prototype.hasOwnProperty.call(field.visibleWhen, "equals")) {
    return currentValue === field.visibleWhen.equals;
  }

  if (Object.prototype.hasOwnProperty.call(field.visibleWhen, "notEquals")) {
    return currentValue !== field.visibleWhen.notEquals;
  }

  return true;
}

export function getContentClassName(fieldType: NodeFieldManifest["type"]) {
  if (fieldType === "description") {
    return "pt-0";
  }

  if (fieldType === "richTextMessage" || fieldType === "mediaMessage") {
    return "grid gap-3";
  }

  return cn("grid gap-3", fieldType === "checkbox" && "pt-1");
}
