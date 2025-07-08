import { memo, useMemo } from "react";
import { Handle, NodeProps, Position, useEdges } from "reactflow";
import { useFlowStore } from "@/constructor/store";
import { CallbackQueryTriggerData } from "./types";
import {
  Card,
  CardContent,
  CardDescription, // <-- YANGI IMPORT
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FilterSelector } from "@/constructor/nodes/triggers/MessageTrigger/components/FilterSelector";
import { ValueInput } from "@/constructor/nodes/triggers/MessageTrigger/components/ParameterInput/ValueInput";
import { ConstructorData } from "@/constructor/data";
import { MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceHandler, TargetHandler } from "../../components";

const CallbackQueryTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CallbackQueryTriggerData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const edges = useEdges();

  // --- NODE'NING IKKI XIL HOLATINI ANIQLASH UCHUN LOGIKA ---
  const isConnected = useMemo(() => {
    return edges.some((edge) => edge.target === id);
  }, [edges, id]);

  const handleUpdate = (update: Partial<CallbackQueryTriggerData>) => {
    updateNodeData(id, update);
  };

  const onFilterChange = (newFilter: string) => {
    handleUpdate({ filter: newFilter, context: {} });
  };

  const onValueChange = (newValue: string) => {
    handleUpdate({ context: { value: newValue } });
  };

  const isConfigured =
    data.filter === "any" || (!!data.filter && !!data.context?.value);

  const filterOptions = useMemo(() => ConstructorData.Filters.textFilters, []);

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      {/* Ulanish uchun handle doim mavjud bo'ladi */}
      <TargetHandler />

      <CardHeader className="pb-2">
        {" "}
        {/* Pastdagi masofani kichraytirdik */}
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-5 w-5 text-primary" />
            <span>Callback Query Handler</span>
          </div>
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              isConfigured ? "bg-green-500" : "bg-destructive/50"
            }`}
            title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
          />
        </CardTitle>
        {/* --- FOYDALANUVCHIGA VIZUAL ISHORA BERUVCHI QISM --- */}
        <CardDescription className="text-xs pt-1">
          {isConnected
            ? "Oldingi qadamdan so'ng callback'larni tinglaydi."
            : "Yangi sxemani boshlovchi global handler."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {/* Sozlamalar doim ko'rinib turadi, bloklanmaydi */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Callback ma'lumoti filtri
          </Label>
          <FilterSelector
            value={data.filter || ""}
            onValueChange={onFilterChange}
            options={filterOptions}
          />
        </div>

        {data.filter && data.filter !== "any" && (
          <div className="space-y-1.5 animate-in fade-in-50">
            <Label className="text-xs text-muted-foreground">Parametr</Label>
            <ValueInput
              value={data.context?.value || ""}
              onChange={onValueChange}
              placeholder="Masalan, 'main_menu' yoki 'item:.*'"
            />
          </div>
        )}
      </CardContent>

      <SourceHandler />
    </Card>
  );
};

export const CallbackQueryTriggerNode = memo(CallbackQueryTriggerNodeComponent);
