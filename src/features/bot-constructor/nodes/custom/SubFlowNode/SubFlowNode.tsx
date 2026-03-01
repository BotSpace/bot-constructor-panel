"use client";

import { NodeProps, Handle, Position } from "reactflow";
import { memo } from "react";
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
import { PlusIcon } from "lucide-react";

const SubFlowNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SubFlowNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const handleParamChange = (key: string, value: string) => {
    updateNodeData(id, {
      params: { ...data.params, [key]: value },
    });
  };

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
                  <Label className="text-xs">
                    {field.title || field.name}
                    {field.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                  {field.type === "string" && !field.isLong ? (
                    <Input
                      placeholder={field.description || field.name}
                      value={String(data.params?.[field.name] || "")}
                      onChange={(e) => handleParamChange(field.name, e.target.value)}
                    />
                  ) : (
                    <Textarea
                      placeholder={field.description || field.name}
                      value={String(data.params?.[field.name] || "")}
                      onChange={(e) => handleParamChange(field.name, e.target.value)}
                      rows={3}
                    />
                  )}
                  {field.description && (
                    <p className="text-[10px] text-muted-foreground">
                      {field.description}
                    </p>
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

// JSON Schema dan form field larni chiqarish
interface SchemaField {
  name: string;
  title?: string;
  type: string;
  description?: string;
  required: boolean;
  isLong: boolean;
}

function getSchemaFields(schema: Record<string, unknown>): SchemaField[] {
  const properties = (schema as any)?.properties;
  const required = (schema as any)?.required || [];
  if (!properties) return [];

  return Object.entries(properties).map(([name, prop]: [string, any]) => ({
    name,
    title: prop.title,
    type: prop.type || "string",
    description: prop.description,
    required: required.includes(name),
    isLong: prop.type === "array" || prop.type === "object",
  }));
}

export const SubFlowNode = memo(SubFlowNodeComponent);
