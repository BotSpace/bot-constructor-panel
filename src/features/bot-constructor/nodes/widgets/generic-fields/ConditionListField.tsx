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

type Condition = Record<string, unknown>;

export interface ConditionListFieldConfig {
  type: "condition-list";
  operatorKey?: string;       // default "operator" → "AND" | "OR"
  conditionsKey?: string;     // default "conditions" → [{...}]
  label?: string;
  /** Sub-field key for the column/variable name inside each condition item.
   *  Default: "variable". Use "field" for engine-compatible filter conditions. */
  conditionFieldKey?: string;
  /** Sub-field key for the operator inside each condition item.
   *  Default: "operator". Use "op" for engine-compatible filter conditions. */
  conditionOpKey?: string;
  /** Operator set variant.
   *  "default" = internal flow operators (equals, not_equals, …)
   *  "engine"  = Google Sheets / collection engine operators (eq, ne, gt, …)
   * Default: "default" */
  operatorSet?: "default" | "engine";
  /** Placeholder text for the field/variable name input. */
  fieldPlaceholder?: string;
}

export interface ConditionListFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: ConditionListFieldConfig;
}

// ---------------------------------------------------------------------------
// Operator option sets
// ---------------------------------------------------------------------------

const DEFAULT_OPERATORS = [
  { value: "equals",       label: "Teng (=)" },
  { value: "not_equals",   label: "Teng emas (≠)" },
  { value: "greater_than", label: "Katta (>)" },
  { value: "less_than",    label: "Kichik (<)" },
  { value: "greater_equal",label: "Katta yoki teng (≥)" },
  { value: "less_equal",   label: "Kichik yoki teng (≤)" },
  { value: "contains",     label: "O'z ichiga oladi" },
  { value: "not_contains", label: "O'z ichiga olmaydi" },
  { value: "starts_with",  label: "Boshlanadi" },
  { value: "ends_with",    label: "Tugaydi" },
  { value: "is_empty",     label: "Bo'sh" },
  { value: "not_empty",    label: "Bo'sh emas" },
  { value: "exists",       label: "Mavjud" },
  { value: "not_exists",   label: "Mavjud emas" },
  { value: "in",           label: "Ro'yxatda bor" },
  { value: "not_in",       label: "Ro'yxatda yo'q" },
] as const;

/** Engine-compatible operators for GoogleSheetsNode filter / collection filter. */
const ENGINE_OPERATORS = [
  { value: "eq",       label: "= (teng)" },
  { value: "ne",       label: "≠ (teng emas)" },
  { value: "gt",       label: "> (katta)" },
  { value: "gte",      label: "≥ (katta yoki teng)" },
  { value: "lt",       label: "< (kichik)" },
  { value: "lte",      label: "≤ (kichik yoki teng)" },
  { value: "in",       label: "ichida (vergul bilan)" },
  { value: "nin",      label: "ichida emas" },
  { value: "contains", label: "o'z ichiga oladi" },
  { value: "exists",   label: "mavjud" },
] as const;

/** Operators that do not require a value input. */
const NO_VALUE_OPS_DEFAULT = new Set(["is_empty", "not_empty", "exists", "not_exists"]);
const NO_VALUE_OPS_ENGINE  = new Set(["exists"]);

// ---------------------------------------------------------------------------
// Inner editor (stateless, driven by parent)
// ---------------------------------------------------------------------------

interface ConditionListEditorProps {
  conditions: Condition[];
  fieldKey: string;
  opKey: string;
  operatorSet: "default" | "engine";
  fieldPlaceholder: string;
  onChange: (nextConditions: Condition[]) => void;
}

function ConditionListEditor({
  conditions,
  fieldKey,
  opKey,
  operatorSet,
  fieldPlaceholder,
  onChange,
}: ConditionListEditorProps) {
  const operators = operatorSet === "engine" ? ENGINE_OPERATORS : DEFAULT_OPERATORS;
  const noValueOps = operatorSet === "engine" ? NO_VALUE_OPS_ENGINE : NO_VALUE_OPS_DEFAULT;
  const defaultOp = operatorSet === "engine" ? "eq" : "equals";

  const addCondition = () => {
    onChange([...conditions, { [fieldKey]: "", [opKey]: defaultOp, value: "" }]);
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

      {conditions.map((condition, index) => {
        const currentOp = typeof condition[opKey] === "string" ? (condition[opKey] as string) : defaultOp;
        const currentField = typeof condition[fieldKey] === "string" ? (condition[fieldKey] as string) : "";
        const currentValue = condition.value !== undefined && condition.value !== null ? String(condition.value) : "";
        const hideValue = noValueOps.has(currentOp);

        return (
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
              placeholder={fieldPlaceholder}
              value={currentField}
              className="border-white/10 bg-zinc-950/60 text-xs"
              onChange={(e) =>
                onChange(
                  conditions.map((item, currentIndex) =>
                    currentIndex === index ? { ...item, [fieldKey]: e.target.value } : item
                  )
                )
              }
            />

            <Select
              value={currentOp}
              onValueChange={(op) =>
                onChange(
                  conditions.map((item, currentIndex) =>
                    currentIndex === index ? { ...item, [opKey]: op } : item
                  )
                )
              }
            >
              <SelectTrigger className="border-white/10 bg-zinc-950/60 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!hideValue ? (
              <Input
                placeholder={`Qiymat ({{chat_id}}, {{state_*}} mumkin)`}
                value={currentValue}
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
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function ConditionListField({ nodeId, data, field }: ConditionListFieldProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const operatorKey    = field.operatorKey     ?? "operator";
  const conditionsKey  = field.conditionsKey   ?? "conditions";
  const fieldKey       = field.conditionFieldKey ?? "variable";
  const opKey          = field.conditionOpKey   ?? "operator";
  const operatorSet    = field.operatorSet      ?? "default";
  const fieldPlaceholder = field.fieldPlaceholder ?? "O'zgaruvchi nomi";

  const matchValue =
    typeof data[operatorKey] === "string" ? (data[operatorKey] as string) : "and";
  const conditions: Condition[] = Array.isArray(data[conditionsKey])
    ? (data[conditionsKey] as Condition[])
    : [];

  // Normalise legacy uppercase AND/OR written by IfConditionNode defaults.
  const displayMatch = matchValue.toLowerCase() === "or" ? "or" : "and";

  return (
    <div className="grid gap-3">
      {field.label ? (
        <Label className="text-xs font-bold uppercase text-white/40">{field.label}</Label>
      ) : null}

      <div className="grid gap-2">
        <Label>Mantiq operatori</Label>
        <Select
          value={displayMatch}
          onValueChange={(nextOperator) =>
            updateNodeData(nodeId, { [operatorKey]: nextOperator })
          }
        >
          <SelectTrigger className="border-white/10 bg-zinc-950/60 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="and">AND — barcha shartlar bajarilsin</SelectItem>
            <SelectItem value="or">OR — biror shart bajarilsin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ConditionListEditor
        conditions={conditions}
        fieldKey={fieldKey}
        opKey={opKey}
        operatorSet={operatorSet}
        fieldPlaceholder={fieldPlaceholder}
        onChange={(nextConditions) =>
          updateNodeData(nodeId, { [conditionsKey]: nextConditions })
        }
      />
    </div>
  );
}
