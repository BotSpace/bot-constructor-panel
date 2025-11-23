import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterRow } from "./filter-row";
import type { Filter, FilterBuilderProps, FilterField } from "./types";

export function FilterBuilder({
  fields,
  filters,
  onChange,
}: FilterBuilderProps) {
  const addFilter = () => {
    const defaultField = fields[0];
    const newFilter: Filter = {
      id: crypto.randomUUID(),
      field: defaultField.id,
      operator: getDefaultOperator(defaultField.type),
      value: getDefaultValue(defaultField.type),
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
      return "contains";
    case "number":
      return "equals";
    case "bool":
      return "is_true";
    case "datetime":
      return "equals";
  }
}

function getDefaultValue(type: FilterField["type"]): Filter["value"] {
  switch (type) {
    case "text":
      return "";
    case "number":
      return 0;
    case "bool":
      return true;
    case "datetime":
      return new Date();
  }
}

// import { useState } from "react";
// import { FilterBuilder } from "@/components/FilterBuilder";
// import type { Filter, FilterField } from "@/types/filter";

// // Example fields - customize these for your use case
// const sampleFields: FilterField[] = [
//   { id: "name", label: "Name", type: "text" },
//   { id: "email", label: "Email", type: "text" },
//   { id: "age", label: "Age", type: "number" },
//   { id: "score", label: "Score", type: "number" },
//   { id: "is_active", label: "Is Active", type: "bool" },
//   { id: "is_verified", label: "Is Verified", type: "bool" },
//   { id: "created_at", label: "Created Date", type: "datetime" },
//   { id: "updated_at", label: "Updated Date", type: "datetime" },
// ];

// const Index = () => {
//   const [filters, setFilters] = useState<Filter[]>([]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 py-12 px-4">
//       <div className="max-w-5xl mx-auto">
//         <div className="text-center mb-12 space-y-4">
//           <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
//             Advanced Filter Builder
//           </h1>
//           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//             Build complex filters with an intuitive interface. Support for text,
//             numbers, booleans, and dates.
//           </p>
//         </div>

//         <div className="space-y-8">
// <FilterBuilder
//   fields={sampleFields}
//   filters={filters}
//   onChange={setFilters}
// />

//           {filters.length > 0 && (
//             <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
//               <h2 className="text-xl font-semibold mb-4">
//                 Current Filters (JSON)
//               </h2>
//               <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
//                 {JSON.stringify(filters, null, 2)}
//               </pre>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Index;
