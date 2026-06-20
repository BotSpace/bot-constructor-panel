import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterRow } from "@/features/bot-constructor/nodes/actions/shared/filter/filter-row";
import type { Filter, FilterBuilderProps, FilterField } from "@/features/bot-constructor/nodes/actions/shared/filter/types";
import { generateId } from "@/lib/utils";

export function FilterBuilder({
  fields,
  filters,
  onChange,
  stateKeys = [],
}: FilterBuilderProps) {
  const addFilter = () => {
    const newFilter: Filter = {
      id: generateId(),
      field: "",
      operator: "contains",
      value: "",
      valueSource: "static",
    };
    onChange([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    onChange(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<Filter>) => {
    onChange(
      filters.map((f) => {
        if (f.id === id) {
          const updatedFilter = { ...f, ...updates };

          // Reset value when field changes
          if (updates.field) {
            const newField = fields.find((field) => field.id === updates.field);
            if (newField) {
              updatedFilter.operator = getDefaultOperator(newField.type);
              updatedFilter.value = getDefaultValue(newField.type);
            }
          }

          return updatedFilter;
        }
        return f;
      })
    );
  };

  return (
    <>
      {filters.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="mb-4">No filters added yet</p>
          <Button onClick={addFilter} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add your first filter
          </Button>
        </div>
      ) : (
        <>
          {filters.map((filter) => (
            <FilterRow
              key={filter.id}
              filter={filter}
              fields={fields}
              stateKeys={stateKeys}
              onUpdate={(updates) => updateFilter(filter.id, updates)}
              onRemove={() => removeFilter(filter.id)}
            />
          ))}
          <Button
            onClick={addFilter}
            variant="outline"
            size="sm"
            className="w-full mt-2 hover:bg-filter-hover transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add filter
          </Button>
        </>
      )}
    </>
  );
}

function getDefaultOperator(type: FilterField["type"]): Filter["operator"] {
  switch (type) {
    case "text":
    case "file":
    case "audio":
    case "video":
    case "photo":
      return "contains";
    case "number":
      return "equals";
    case "bool":
      return "is_true";
    case "datetime":
      return "equals";
    default:
      return ""
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
    default:
      return ""
  }
}
