"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { VariableNodeData, VariableOperation } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VariableNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<VariableNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const handleUpdate = (update: Partial<VariableNodeData>) => {
    updateNodeData(id, update);
  };

  // Default operation to 'set' if not provided
  const currentOperation = data.operation || "set";

  const needsValue = !["delete", "toggle"].includes(currentOperation);

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="🔢"
        title="O'zgaruvchi"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          {/* Operation */}
          <div className="flex flex-col gap-2">
            <Label>Operatsiya</Label>
            <Select
              value={currentOperation}
              onValueChange={(value: VariableOperation) =>
                handleUpdate({ operation: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="set">Set (o'rnatish)</SelectItem>
                <SelectItem value="increment">Increment (+)</SelectItem>
                <SelectItem value="decrement">Decrement (-)</SelectItem>
                <SelectItem value="append">Append (qo'shish)</SelectItem>
                <SelectItem value="remove">Remove (olib tashlash)</SelectItem>
                <SelectItem value="delete">Delete (o'chirish)</SelectItem>
                <SelectItem value="toggle">Toggle (almashtirish)</SelectItem>
                <SelectItem value="parse_json">Parse JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Variable Name */}
          <div className="flex flex-col gap-2">
            <Label>O'zgaruvchi nomi</Label>
            <Input
              placeholder="my_variable"
              value={data.variableName || ""}
              onChange={(e) => handleUpdate({ variableName: e.target.value })}
            />
          </div>

          {/* Value */}
          {needsValue && (
            <div className="flex flex-col gap-2">
              <Label>Qiymat</Label>
              {currentOperation === "parse_json" ? (
                <Textarea
                  placeholder='{"key": "value"}'
                  value={data.value?.toString() || ""}
                  onChange={(e) => handleUpdate({ value: e.target.value })}
                  rows={4}
                />
              ) : (
                <Input
                  placeholder="Qiymat kiriting"
                  value={data.value?.toString() || ""}
                  onChange={(e) => handleUpdate({ value: e.target.value })}
                />
              )}
            </div>
          )}

          {/* Help text */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Masalan:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              {currentOperation === "set" && <li>score = 100</li>}
              {currentOperation === "increment" && <li>score += 10</li>}
              {currentOperation === "decrement" && <li>lives -= 1</li>}
              {currentOperation === "append" && (
                <li>items.push("yangi element")</li>
              )}
            </ul>
          </div>
        </CardContent>
      )}

      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const VariableNode = memo(VariableNodeComponent);
