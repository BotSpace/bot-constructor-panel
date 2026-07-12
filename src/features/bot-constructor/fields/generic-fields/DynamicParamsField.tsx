"use client";

import { Badge } from "@/components/ui/badge";
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
import { useFlowStore } from "@/features/bot-constructor/store";
import { GripVertical, PlusIcon, Trash2 } from "lucide-react";
import { useCallback, useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SchemaField {
  name: string;
  title?: string;
  type: string;
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  enumValues?: string[];
  itemFields?: SchemaField[];
}

export interface DynamicParamsFieldConfig {
  type: "dynamic-params";
  schemaKey?: string;     // default "paramsSchema"
  paramsKey?: string;     // default "params"
  outputsKey?: string;    // default "outputs"
  descriptionKey?: string; // default "pluginDescription"
  label?: string;
}

export interface DynamicParamsFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: DynamicParamsFieldConfig;
}

// ---------------------------------------------------------------------------
// Schema field parser
// ---------------------------------------------------------------------------

function getSchemaFields(schema: Record<string, unknown>): SchemaField[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties = (schema as any)?.properties;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const required: string[] = (schema as any)?.required ?? [];
  if (!properties) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.entries(properties).map(([name, prop]: [string, any]) => {
    const schemaField: SchemaField = {
      name,
      title: prop.title,
      type: prop.type ?? "string",
      description: prop.description,
      required: required.includes(name),
      defaultValue: prop.default,
      enumValues: prop.enum,
    };

    if (prop.type === "array" && prop.items?.properties) {
      const itemRequired: string[] = prop.items.required ?? [];
      schemaField.itemFields = Object.entries(prop.items.properties).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ([subName, subProp]: [string, any]) => ({
          name: subName,
          title: subProp.title,
          type: subProp.type ?? "string",
          description: subProp.description,
          required: itemRequired.includes(subName),
          defaultValue: subProp.default,
          enumValues: subProp.enum,
        })
      );
    }

    return schemaField;
  });
}

// ---------------------------------------------------------------------------
// Sub-field renderers
// ---------------------------------------------------------------------------

function StringParamField({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <>
      <Label className="text-xs">
        {field.title ?? field.name}
        {field.required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {field.enumValues ? (
        <Select
          value={value || (field.defaultValue as string)}
          onValueChange={onChange}
        >
          <SelectTrigger className="h-8 border-white/10 bg-zinc-950/60 text-xs">
            <SelectValue placeholder={field.title ?? field.name} />
          </SelectTrigger>
          <SelectContent>
            {field.enumValues.map((option) => (
              <SelectItem key={option} value={option} className="text-xs">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          placeholder={field.description ?? field.name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 border-white/10 bg-zinc-950/60 text-xs"
        />
      )}
      {field.description ? (
        <p className="text-[10px] text-white/30">{field.description}</p>
      ) : null}
    </>
  );
}

function BooleanParamField({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}) {
  const checked = value ?? (field.defaultValue as boolean) ?? false;
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <Checkbox
        checked={checked}
        onCheckedChange={(nextValue) => onChange(nextValue === true)}
      />
      <span className="text-xs">{field.title ?? field.name}</span>
    </label>
  );
}

function ArrayParamField({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: Record<string, unknown>[];
  onChange: (value: Record<string, unknown>[]) => void;
}) {
  const itemFields = field.itemFields ?? [];
  const items = Array.isArray(value) ? value : [];

  const addItem = () => {
    const newItem: Record<string, unknown> = {};
    itemFields.forEach((itemField) => {
      newItem[itemField.name] = itemField.defaultValue ?? "";
    });
    onChange([...items, newItem]);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Label className="text-xs">
          {field.title ?? field.name}
          {field.required ? <span className="ml-1 text-destructive">*</span> : null}
        </Label>
        <span className="text-[10px] text-white/30">{items.length} ta</span>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-1.5 rounded-lg border border-white/10 bg-zinc-950/60 p-2.5"
          >
            <div className="mb-0.5 flex items-center justify-between">
              <div className="flex items-center gap-1 text-white/30">
                <GripVertical className="h-3 w-3" />
                <span className="text-[10px] font-medium">#{index + 1}</span>
              </div>
              <button
                type="button"
                aria-label="O'chirish"
                onClick={() =>
                  onChange(items.filter((_, itemIndex) => itemIndex !== index))
                }
                className="rounded p-0.5 text-white/30 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            {itemFields.map((itemField) => (
              <div key={itemField.name} className="flex flex-col gap-0.5">
                <Label className="text-[10px] text-white/40">
                  {itemField.title ?? itemField.name}
                </Label>
                {itemField.enumValues ? (
                  <Select
                    value={String(item[itemField.name] ?? itemField.defaultValue ?? "")}
                    onValueChange={(nextValue) =>
                      onChange(
                        items.map((currentItem, itemIndex) =>
                          itemIndex === index
                            ? { ...currentItem, [itemField.name]: nextValue }
                            : currentItem
                        )
                      )
                    }
                  >
                    <SelectTrigger className="h-7 border-white/10 bg-zinc-950/60 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {itemField.enumValues.map((option) => (
                        <SelectItem key={option} value={option} className="text-xs">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : itemField.type === "boolean" ? (
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <Checkbox
                      checked={item[itemField.name] === true}
                      onCheckedChange={(nextValue) =>
                        onChange(
                          items.map((currentItem, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...currentItem,
                                  [itemField.name]: nextValue === true,
                                }
                              : currentItem
                          )
                        )
                      }
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-[10px]">{itemField.title ?? itemField.name}</span>
                  </label>
                ) : (
                  <Input
                    placeholder={itemField.title ?? itemField.name}
                    value={String(item[itemField.name] ?? "")}
                    onChange={(event) =>
                      onChange(
                        items.map((currentItem, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...currentItem,
                                [itemField.name]: event.target.value,
                              }
                            : currentItem
                        )
                      )
                    }
                    className="h-7 border-white/10 bg-zinc-950/60 text-[11px]"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-white/10 py-1.5 text-xs text-white/30 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Qo&apos;shish
      </button>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function DynamicParamsField({ nodeId, data, field }: DynamicParamsFieldProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const schemaKey = field.schemaKey ?? "paramsSchema";
  const paramsKey = field.paramsKey ?? "params";
  const outputsKey = field.outputsKey ?? "outputs";
  const descriptionKey = field.descriptionKey ?? "pluginDescription";

  const params = useMemo(
    () =>
      data[paramsKey] && typeof data[paramsKey] === "object"
        ? (data[paramsKey] as Record<string, unknown>)
        : {},
    [data, paramsKey],
  );

  const paramFields =
    data[schemaKey] && typeof data[schemaKey] === "object"
      ? getSchemaFields(data[schemaKey] as Record<string, unknown>)
      : [];

  const outputs = Array.isArray(data[outputsKey])
    ? (data[outputsKey] as Array<{ name: string; description?: string }>)
    : [];

  const handleParamChange = useCallback(
    (key: string, value: unknown) => {
      updateNodeData(nodeId, {
        [paramsKey]: { ...params, [key]: value },
      });
    },
    [nodeId, params, paramsKey, updateNodeData]
  );

  return (
    <div className="flex flex-col gap-3">
      {field.label ? (
        <Label className="text-[11px] font-bold uppercase text-white/40">
          {field.label}
        </Label>
      ) : null}

      {typeof data[descriptionKey] === "string" && data[descriptionKey] ? (
        <p className="text-xs text-white/40">{data[descriptionKey] as string}</p>
      ) : null}

      {paramFields.length > 0 ? (
        <div className="flex flex-col gap-3">
          <Label className="text-xs font-semibold">Parametrlar</Label>
          {paramFields.map((paramField) => (
            <div key={paramField.name} className="flex flex-col gap-1">
              {paramField.type === "array" ? (
                <ArrayParamField
                  field={paramField}
                  value={
                    (params[paramField.name] as Record<string, unknown>[]) ?? []
                  }
                  onChange={(value) => handleParamChange(paramField.name, value)}
                />
              ) : paramField.type === "boolean" ? (
                <BooleanParamField
                  field={paramField}
                  value={params[paramField.name] as boolean | undefined}
                  onChange={(value) => handleParamChange(paramField.name, value)}
                />
              ) : (
                <StringParamField
                  field={paramField}
                  value={String(params[paramField.name] ?? "")}
                  onChange={(value) => handleParamChange(paramField.name, value)}
                />
              )}
            </div>
          ))}
        </div>
      ) : null}

      {outputs.length > 0 ? (
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-semibold">Chiqishlar</Label>
          <div className="flex flex-wrap gap-1">
            {outputs.map((output) => (
              <Badge
                key={output.name}
                variant="outline"
                className="border-white/10 text-[10px] text-white/50"
              >
                {output.name}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
