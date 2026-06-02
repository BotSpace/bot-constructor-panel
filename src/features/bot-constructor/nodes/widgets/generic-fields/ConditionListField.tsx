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
import { useFlowStore } from "@/features/bot-constructor/store";
import { ListPlus } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Condition = {
  variable?: string;
  operator?: string;
  value?: unknown;
};

export interface ConditionListFieldConfig {
  type: "condition-list";
  operatorKey?: string;   // default "operator" → "AND" | "OR"
  conditionsKey?: string; // default "conditions" → [{variable, operator, value}]
  label?: string;
}

export interface ConditionListFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: ConditionListFieldConfig;
}

// ---------------------------------------------------------------------------
// Inner editor (stateless, driven by parent)
// ---------------------------------------------------------------------------

interface ConditionListEditorProps {
  conditions: Condition[];
  onChange: (nextConditions: Condition[]) => void;
}

function ConditionListEditor({ conditions, onChange }: ConditionListEditorProps) {
  const addCondition = () => {
    onChange([...conditions, { variable: "", operator: "equals", value: "" }]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label>Shartlar</Label>
        <Button
          size="sm"
          variant="outline"
          onClick={addCondition}
          className="h-8 border-white/10 bg-transparent text-xs text-white/60 hover:bg-white/5 hover:text-white/90"
        >
          <ListPlus className="mr-1 h-4 w-4" />
          Qo&apos;shish
        </Button>
      </div>

      {conditions.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-zinc-950/60 py-4 text-center text-sm text-white/30">
          Hali shart qo&apos;shilmagan
        </div>
      ) : null}

      {conditions.map((condition, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-md border border-white/10 bg-zinc-950/60 p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/60">Shart {index + 1}</span>
            <button
              type="button"
              aria-label="O'chirish"
              onClick={() =>
                onChange(conditions.filter((_, currentIndex) => currentIndex !== index))
              }
              className="flex h-6 w-6 items-center justify-center rounded text-white/30 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <Input
            placeholder="O'zgaruvchi nomi"
            value={condition.variable ?? ""}
            className="border-white/10 bg-zinc-950/60 text-xs"
            onChange={(e) =>
              onChange(
                conditions.map((item, currentIndex) =>
                  currentIndex === index ? { ...item, variable: e.target.value } : item
                )
              )
            }
          />

          <Select
            value={condition.operator ?? "equals"}
            onValueChange={(operator) =>
              onChange(
                conditions.map((item, currentIndex) =>
                  currentIndex === index ? { ...item, operator } : item
                )
              )
            }
          >
            <SelectTrigger className="border-white/10 bg-zinc-950/60 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Teng (=)</SelectItem>
              <SelectItem value="not_equals">Teng emas (≠)</SelectItem>
              <SelectItem value="greater_than">Katta (&gt;)</SelectItem>
              <SelectItem value="less_than">Kichik (&lt;)</SelectItem>
              <SelectItem value="greater_equal">Katta yoki teng (≥)</SelectItem>
              <SelectItem value="less_equal">Kichik yoki teng (≤)</SelectItem>
              <SelectItem value="contains">O&apos;z ichiga oladi</SelectItem>
              <SelectItem value="not_contains">O&apos;z ichiga olmaydi</SelectItem>
              <SelectItem value="starts_with">Boshlanadi</SelectItem>
              <SelectItem value="ends_with">Tugaydi</SelectItem>
              <SelectItem value="is_empty">Bo&apos;sh</SelectItem>
              <SelectItem value="not_empty">Bo&apos;sh emas</SelectItem>
              <SelectItem value="exists">Mavjud</SelectItem>
              <SelectItem value="not_exists">Mavjud emas</SelectItem>
              <SelectItem value="in">Ro&apos;yxatda bor</SelectItem>
              <SelectItem value="not_in">Ro&apos;yxatda yo&apos;q</SelectItem>
            </SelectContent>
          </Select>

          {!["is_empty", "not_empty", "exists", "not_exists"].includes(
            condition.operator ?? "equals"
          ) ? (
            <Input
              placeholder="Qiymat"
              value={condition.value?.toString() ?? ""}
              className="border-white/10 bg-zinc-950/60 text-xs"
              onChange={(e) =>
                onChange(
                  conditions.map((item, currentIndex) =>
                    currentIndex === index ? { ...item, value: e.target.value } : item
                  )
                )
              }
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function ConditionListField({ nodeId, data, field }: ConditionListFieldProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const operatorKey = field.operatorKey ?? "operator";
  const conditionsKey = field.conditionsKey ?? "conditions";

  const operator =
    typeof data[operatorKey] === "string" ? (data[operatorKey] as string) : "AND";
  const conditions: Condition[] = Array.isArray(data[conditionsKey])
    ? (data[conditionsKey] as Condition[])
    : [];

  return (
    <div className="grid gap-3">
      {field.label ? (
        <Label className="text-xs font-bold uppercase text-white/40">{field.label}</Label>
      ) : null}

      <div className="grid gap-2">
        <Label>Mantiq operatori</Label>
        <Select
          value={operator}
          onValueChange={(nextOperator) =>
            updateNodeData(nodeId, { [operatorKey]: nextOperator })
          }
        >
          <SelectTrigger className="border-white/10 bg-zinc-950/60 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND (Barcha shartlar)</SelectItem>
            <SelectItem value="OR">OR (Biror shart)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ConditionListEditor
        conditions={conditions}
        onChange={(nextConditions) =>
          updateNodeData(nodeId, { [conditionsKey]: nextConditions })
        }
      />
    </div>
  );
}
