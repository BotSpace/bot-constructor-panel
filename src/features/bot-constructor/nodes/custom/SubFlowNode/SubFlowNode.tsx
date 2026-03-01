"use client";

import { NodeProps, Handle, Position } from "reactflow";
import { memo, useCallback } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SubFlowNodeData } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon, Trash2, GripVertical } from "lucide-react";

const SubFlowNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SubFlowNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const handleParamChange = useCallback(
    (key: string, value: unknown) => {
      updateNodeData(id, {
        params: { ...data.params, [key]: value },
      });
    },
    [id, data.params, updateNodeData]
  );

  const paramFields = data.paramsSchema
    ? getSchemaFields(data.paramsSchema)
    : [];

  const outputs = data.outputs || [];

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="🔌"
        title={data.pluginName || "Plugin"}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          {data.pluginDescription && (
            <p className="text-xs text-muted-foreground">
              {data.pluginDescription}
            </p>
          )}

          {/* Parametrlar */}
          {paramFields.length > 0 && (
            <div className="flex flex-col gap-3">
              <Label className="text-xs font-semibold">Parametrlar</Label>
              {paramFields.map((field) => (
                <div key={field.name} className="flex flex-col gap-1">
                  {field.type === "array" ? (
                    <ArrayParamField
                      field={field}
                      value={(data.params?.[field.name] as Record<string, unknown>[]) || []}
                      onChange={(val) => handleParamChange(field.name, val)}
                    />
                  ) : field.type === "boolean" ? (
                    <BooleanParamField
                      field={field}
                      value={data.params?.[field.name] as boolean}
                      onChange={(val) => handleParamChange(field.name, val)}
                    />
                  ) : (
                    <StringParamField
                      field={field}
                      value={String(data.params?.[field.name] ?? "")}
                      onChange={(val) => handleParamChange(field.name, val)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Chiqishlar */}
          {outputs.length > 0 && (
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold">Chiqishlar</Label>
              <div className="flex flex-wrap gap-1">
                {outputs.map((out) => (
                  <Badge key={out.name} variant="outline" className="text-[10px]">
                    {out.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}

      {/* Har bir output uchun alohida source handle */}
      {outputs.length > 0 ? (
        outputs.map((out, idx) => (
          <Handle
            key={out.name}
            type="source"
            position={Position.Right}
            id={`output-${out.name}`}
            className="!w-6 !h-6 !bg-emerald-500 !rounded-full !border-2 !border-background translate-x-[-5px]"
            style={{ top: `${((idx + 1) / (outputs.length + 1)) * 100}%` }}
            title={out.name}
          >
            <PlusIcon size={10} className="w-2 h-2 text-white pointer-events-none ml-[7px] mt-[5px]" />
          </Handle>
        ))
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          id="source-handler"
          className="!w-6 !h-14 !bg-sky-500 !rounded-[10px] !border-gray-800 flex items-center justify-center translate-x-[-5px]"
        >
          <PlusIcon size={12} className="w-2 h-2 text-white pointer-events-none" />
        </Handle>
      )}
    </Card>
  );
};

/* ── String / text param ──────────────────────────────── */
function StringParamField({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <Label className="text-xs">
        {field.title || field.name}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.enumValues ? (
        <Select value={value || field.defaultValue as string} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={field.title || field.name} />
          </SelectTrigger>
          <SelectContent>
            {field.enumValues.map((v) => (
              <SelectItem key={v} value={v} className="text-xs">
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          placeholder={field.description || field.name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs"
        />
      )}
      {field.description && (
        <p className="text-[10px] text-muted-foreground">{field.description}</p>
      )}
    </>
  );
}

/* ── Boolean param ─────────────────────────────────────── */
function BooleanParamField({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: boolean | undefined;
  onChange: (v: boolean) => void;
}) {
  const checked = value ?? (field.defaultValue as boolean) ?? false;
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <span className="text-xs">{field.title || field.name}</span>
    </label>
  );
}

/* ── Array param (list of objects) ─────────────────────── */
function ArrayParamField({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: Record<string, unknown>[];
  onChange: (v: Record<string, unknown>[]) => void;
}) {
  const itemFields = field.itemFields || [];
  const items = Array.isArray(value) ? value : [];

  const addItem = () => {
    const newItem: Record<string, unknown> = {};
    for (const f of itemFields) {
      newItem[f.name] = f.defaultValue ?? "";
    }
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, key: string, val: unknown) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [key]: val } : item
    );
    onChange(updated);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Label className="text-xs">
          {field.title || field.name}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <span className="text-[10px] text-muted-foreground">{items.length} ta</span>
      </div>
      {field.description && (
        <p className="text-[10px] text-muted-foreground">{field.description}</p>
      )}

      {/* List of items */}
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="relative rounded-lg border border-border/60 bg-muted/30 p-2.5 flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1 text-muted-foreground">
                <GripVertical className="h-3 w-3" />
                <span className="text-[10px] font-medium">#{idx + 1}</span>
              </div>
              <button
                onClick={() => removeItem(idx)}
                className="text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            {itemFields.map((subField) => (
              <div key={subField.name} className="flex flex-col gap-0.5">
                <Label className="text-[10px] text-muted-foreground">
                  {subField.title || subField.name}
                </Label>
                {subField.enumValues ? (
                  <Select
                    value={String(item[subField.name] ?? subField.defaultValue ?? "")}
                    onValueChange={(v) => updateItem(idx, subField.name, v)}
                  >
                    <SelectTrigger className="h-7 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subField.enumValues.map((v) => (
                        <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : subField.type === "boolean" ? (
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      checked={item[subField.name] === true}
                      onCheckedChange={(v) => updateItem(idx, subField.name, v === true)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-[10px]">{subField.title || subField.name}</span>
                  </label>
                ) : (
                  <Input
                    placeholder={subField.title || subField.name}
                    value={String(item[subField.name] ?? "")}
                    onChange={(e) => updateItem(idx, subField.name, e.target.value)}
                    className="h-7 text-[11px]"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={addItem}
        className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-md border border-dashed border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Qo&#39;shish
      </button>
    </>
  );
}

/* ── Schema parsing ────────────────────────────────────── */
interface SchemaField {
  name: string;
  title?: string;
  type: string;
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  enumValues?: string[];
  // For array type: sub-fields from items.properties
  itemFields?: SchemaField[];
}

function getSchemaFields(schema: Record<string, unknown>): SchemaField[] {
  const properties = (schema as any)?.properties;
  const required = (schema as any)?.required || [];
  if (!properties) return [];

  return Object.entries(properties).map(([name, prop]: [string, any]) => {
    const field: SchemaField = {
      name,
      title: prop.title,
      type: prop.type || "string",
      description: prop.description,
      required: required.includes(name),
      defaultValue: prop.default,
      enumValues: prop.enum,
    };

    // Parse array items' sub-fields
    if (prop.type === "array" && prop.items?.properties) {
      const itemRequired = prop.items.required || [];
      field.itemFields = Object.entries(prop.items.properties).map(
        ([subName, subProp]: [string, any]) => ({
          name: subName,
          title: subProp.title,
          type: subProp.type || "string",
          description: subProp.description,
          required: itemRequired.includes(subName),
          defaultValue: subProp.default,
          enumValues: subProp.enum,
        })
      );
    }

    return field;
  });
}

export const SubFlowNode = memo(SubFlowNodeComponent);
