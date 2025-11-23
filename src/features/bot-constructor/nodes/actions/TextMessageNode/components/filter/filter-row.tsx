import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
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
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Filter, FilterField, FilterOperator } from "./types";

interface FilterRowProps {
  filter: Filter;
  fields: FilterField[];
  onUpdate: (updates: Partial<Filter>) => void;
  onRemove: () => void;
}

export function FilterRow({
  filter,
  fields,
  onUpdate,
  onRemove,
}: FilterRowProps) {
  const selectedField = fields.find((f) => f.id === filter.field);

  const renderOperatorSelect = () => {
    if (!selectedField) return null;

    const operators = getOperatorsForType(selectedField.type);

    return (
      <Select
        value={filter.operator}
        onValueChange={(value) =>
          onUpdate({ operator: value as FilterOperator })
        }
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const renderValueInput = () => {
    if (!selectedField) return null;

    switch (selectedField.type) {
      case "text":
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
            type="number"
            value={filter.value as number}
            onChange={(e) =>
              onUpdate({ value: parseFloat(e.target.value) || 0 })
            }
            placeholder="Enter number..."
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
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        );
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card hover:bg-filter-hover transition-all group">
      <Select
        value={filter.field}
        onValueChange={(value) => onUpdate({ field: value })}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fields.map((field) => (
            <SelectItem key={field.id} value={field.id}>
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {renderOperatorSelect()}
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
  }
}
