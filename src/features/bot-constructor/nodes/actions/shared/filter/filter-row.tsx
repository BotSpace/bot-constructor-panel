import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Filter, FilterField, FilterOperator } from "@/features/bot-constructor/nodes/actions/shared/filter/types";

interface FilterRowProps {
  filter: Filter;
  fields: FilterField[];
  stateKeys?: string[];
  onUpdate: (updates: Partial<Filter>) => void;
  onRemove: () => void;
}

export function FilterRow({
  filter,
  fields,
  stateKeys = [],
  onUpdate,
  onRemove,
}: FilterRowProps) {
  const selectedField = fields.find((f) => f.id === filter.field);
  const valueSource = filter.valueSource || "static";

  const EmptySelector = ({ placeholder }: { placeholder: string }) => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
    </Select>
  );

  const renderOperatorSelect = () => {
    if (!selectedField) return <EmptySelector placeholder="Select operator" />;

    const operators = getOperatorsForType(selectedField.type);

    return (
      <Select
        value={filter.operator}
        onValueChange={(value) =>
          onUpdate({ operator: value as FilterOperator })
        }
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Select operator" />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const renderValueSourceSelector = () => {
    return (
      <Select
        value={valueSource}
        onValueChange={(source) => {
          if (source === "state") {
            onUpdate({
              valueSource: "state",
              stateKey: stateKeys[0] || "",
            });
          } else {
            onUpdate({
              valueSource: "static",
              stateKey: undefined,
              value: getDefaultValue(selectedField?.type || "text"),
            });
          }
        }}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="static">Static</SelectItem>
          <SelectItem value="state">
            <div className="flex items-center gap-2">
              <Key className="h-3 w-3" />
              State
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    );
  };

  const renderStateKeySelect = () => {
    if (valueSource !== "state")
      return <EmptySelector placeholder="Select operator" />;

    return (
      <Select
        value={filter.stateKey || ""}
        onValueChange={(key) => onUpdate({ stateKey: key })}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="State key tanlang..." />
        </SelectTrigger>
        <SelectContent>
          {stateKeys.length ? (
            stateKeys.map((key) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <Key className="h-3 w-3" />
                  {key}
                </div>
              </SelectItem>
            ))
          ) : (
            <>
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Hech narsa topilmadi
              </div>
            </>
          )}
        </SelectContent>
      </Select>
    );
  };

  const renderValueInput = () => {
    if (!selectedField) return null;

    // If valueSource is "state", show state key select instead
    if (valueSource === "state") {
      return renderStateKeySelect();
    }

    switch (selectedField.type) {
      case "text":
      case "file":
      case "audio":
      case "video":
      case "photo":
        return (
          <Input
            type="text"
            value={filter.value as string}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder="Enter value..."
            className="flex-1"
          />
        );
      case "number":
        return (
          <Input
            type="text" // it's for dynamic message
            value={filter.value as number}
            onChange={(e) =>
              onUpdate({ value: parseFloat(e.target.value) || 0 })
            }
            placeholder="Enter number..."
            className="flex-1"
          />
        );

      case "relation":
        return (
          <Input
            type="text"
            value={filter.value as string}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder="Enter value..."
            className="flex-1"
          />
        );

      case "bool":
        return (
          <div className="flex items-center gap-2 flex-1 px-3 h-10 rounded-md border border-input bg-background">
            <Switch
              checked={filter.value as boolean}
              onCheckedChange={(checked) => onUpdate({ value: checked })}
            />
            <Label className="cursor-pointer">
              {filter.value ? "True" : "False"}
            </Label>
          </div>
        );

      case "datetime":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 justify-start text-left font-normal",
                  !filter.value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filter.value ? (
                  format(filter.value as Date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filter.value as Date}
                onSelect={(date) => date && onUpdate({ value: date })}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        );
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card hover:bg-filter-hover transition-all group">
      {/* Select for sorting element
        Example: chat_id, name, age, created at, etc.
      */}
      <Select
        value={filter.field}
        onValueChange={(value) => onUpdate({ field: value })}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Field" />
        </SelectTrigger>
        <SelectContent>
          {fields.map((field) => (
            <SelectItem key={field.id} value={field.id}>
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Operation select */}
      {renderOperatorSelect()}

      {/* Value source select (static or state) */}
      {renderValueSourceSelector()}

      {/* Value input (text, number, date picker, etc.) */}
      {renderValueInput()}

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function getOperatorsForType(type: FilterField["type"]) {
  switch (type) {
    case "text":
    case "file":
    case "audio":
    case "video":
    case "photo":
      return [
        { value: "equals", label: "Equals" },
        { value: "not_equals", label: "Not equals" },
        { value: "contains", label: "Contains" },
        { value: "not_contains", label: "Does not contain" },
        { value: "starts_with", label: "Starts with" },
        { value: "ends_with", label: "Ends with" },
      ];

    case "number":
      return [
        { value: "equals", label: "Equals" },
        { value: "not_equals", label: "Not equals" },
        { value: "greater_than", label: "Greater than" },
        { value: "less_than", label: "Less than" },
        { value: "greater_or_equal", label: "Greater or equal" },
        { value: "less_or_equal", label: "Less or equal" },
      ];

    case "bool":
      return [
        { value: "is_true", label: "Is true" },
        { value: "is_false", label: "Is false" },
      ];

    case "datetime":
      return [
        { value: "equals", label: "Equals" },
        { value: "before", label: "Before" },
        { value: "after", label: "After" },
      ];
    case "relation":
      return [
        { value: "equals", label: "Equals" },
        { value: "not_equals", label: "Not equals" },
      ];
    default: return [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not equals" },
    ]
  }
}

function getDefaultValue(type: FilterField["type"]): Filter["value"] {
  switch (type) {
    case "text":
    case "file":
    case "audio":
    case "video":
    case "photo":
      return "";
    case "number":
      return 0;
    case "bool":
      return true;
    case "datetime":
      return new Date();
    case "relation":
      return "";
    default: return "";
  }
}
