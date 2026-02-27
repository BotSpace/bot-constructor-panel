"use client";

import { NodeProps, Position } from "reactflow";
import { memo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { SourceHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { ElseIfNodeData } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Handle } from "reactflow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const ElseIfNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<ElseIfNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const handleUpdate = (update: Partial<ElseIfNodeData>) => {
    updateNodeData(id, update);
  };

  const addCondition = () => {
    const newCondition = {
      variable: "",
      operator: "equals",
      value: "",
    };
    handleUpdate({
      conditions: [...(data.conditions || []), newCondition],
    });
  };

  const removeCondition = (index: number) => {
    const newConditions = [...(data.conditions || [])];
    newConditions.splice(index, 1);
    handleUpdate({ conditions: newConditions });
  };

  const updateCondition = (index: number, update: any) => {
    const newConditions = [...(data.conditions || [])];
    newConditions[index] = { ...newConditions[index], ...update };
    handleUpdate({ conditions: newConditions });
  };

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      {/* Input - FAQAT chap tomonda (IF/ElseIf dan NEXT) */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-handler"
        className="!w-4 !h-4 !bg-sky-500 !border-2 !border-gray-800"
      />

      <NodeHeader
        icon="🔄"
        title="Else If (Aks holda agar)"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          {/* Operator */}
          <div className="flex flex-col gap-2">
            <Label>Mantiq operatori</Label>
            <Select
              value={data.operator || "AND"}
              onValueChange={(value: "AND" | "OR") =>
                handleUpdate({ operator: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND (Barcha shartlar)</SelectItem>
                <SelectItem value="OR">OR (Biror shart)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Shartlar</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={addCondition}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                Qo'shish
              </Button>
            </div>

            {(data.conditions || []).map((condition, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 p-3 border rounded-md bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Shart {index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeCondition(index)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div className="flex flex-col gap-1">
                  <Input
                    placeholder="O'zgaruvchi nomi (masalan: age)"
                    value={condition.variable || ""}
                    onChange={(e) =>
                      updateCondition(index, { variable: e.target.value })
                    }
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Oddiy nom yozing. Template sintaksisi shart emas.
                  </p>
                </div>

                <Select
                  value={condition.operator}
                  onValueChange={(value) =>
                    updateCondition(index, { operator: value })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Teng (=)</SelectItem>
                    <SelectItem value="not_equals">Teng emas (≠)</SelectItem>
                    <SelectItem value="greater_than">Katta (&gt;)</SelectItem>
                    <SelectItem value="less_than">Kichik (&lt;)</SelectItem>
                    <SelectItem value="contains">O'z ichiga oladi</SelectItem>
                  </SelectContent>
                </Select>

                {!["is_empty", "not_empty", "exists", "not_exists"].includes(
                  condition.operator
                ) && (
                  <div className="flex flex-col gap-1">
                    <Input
                      placeholder="Qiymat (masalan: 18, {{other_var}})"
                      value={condition.value?.toString() || ""}
                      onChange={(e) =>
                        updateCondition(index, { value: e.target.value })
                      }
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Kontekstdan qiymat olish uchun {"{{var_name}}"}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {(!data.conditions || data.conditions.length === 0) && (
              <div className="text-sm text-muted-foreground text-center py-4">
                Hali shart qo'shilmagan
              </div>
            )}
          </div>
        </CardContent>
      )}

      {/* Input - chap tomonda (IF/ElseIf dan NEXT) */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-handler"
        className="!w-4 !h-4 !bg-sky-500 !border-2 !border-gray-800"
      />

      {/* TRUE - pastda (bu shart bajarilsa) */}
      <SourceHandles id="true" position={Position.Bottom} />

      {/* NEXT - o'ng tomonda (keyingi ElseIf/Else ga) */}
      <SourceHandles id="next" position={Position.Right} />
    </Card>
  );
};

export const ElseIfNode = memo(ElseIfNodeComponent);
