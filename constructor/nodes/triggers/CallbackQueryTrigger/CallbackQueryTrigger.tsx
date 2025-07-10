// FAYL: constructor/nodes/triggers/CallbackQueryTrigger/CallbackQueryTrigger.tsx (YANGI, "AQLLI" VERSIYA)

import { memo, useMemo } from "react";
import { NodeProps, useNodes, useEdges } from "reactflow";
import { useFlowStore } from "@/constructor/store";
import { CallbackQueryTriggerData } from "./types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FilterSelector } from "@/constructor/nodes/triggers/MessageTrigger/components/FilterSelector";
import { ValueInput } from "@/constructor/nodes/triggers/MessageTrigger/components/ParameterInput/ValueInput";
import { ConstructorData } from "@/constructor/data";
import { MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceHandler, TargetHandler } from "../../components";
import { KeyboardConfig } from "../../actions/TextMessageNode/types";

// YORDAMCHI INTERFEYS: Ota-ona node'ning `data` obyekti qanday bo'lishini tasvirlaydi
interface NodeWithKeyboardData {
  keyboard?: KeyboardConfig;
}

const CallbackQueryTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CallbackQueryTriggerData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();

  // --- 1. OTA-ONA NODE'DAN CALLBACK TUGMALARINI OLISH UCHUN "AQLLI" LOGIKA ---
  const availableCallbacks = useMemo(() => {
    const incomingEdge = edges.find((edge) => edge.target === id);
    if (!incomingEdge) return [];

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    if (!parentNode) return [];

    const parentNodeData = parentNode.data as NodeWithKeyboardData;
    if (!parentNodeData.keyboard || !parentNodeData.keyboard.inline) {
      return [];
    }

    // Faqat "callback" turidagi, "value"si mavjud bo'lgan tugmalarni olamiz
    return parentNodeData.keyboard.inline
      .flat()
      .filter((button) => button.type === "callback" && button.value);
  }, [nodes, edges, id]);

  const isConnected = useMemo(
    () => edges.some((edge) => edge.target === id),
    [edges, id]
  );

  // --- 2. "AQLLI" REJIMNI YOQISH UCHUN SHART ---
  // Node ulangan, unda callback'lar bor va "teng" filtri tanlangan bo'lsa
  const showSmartSelector =
    isConnected && availableCallbacks.length > 0 && data.filter === "equals";

  const handleUpdate = (update: Partial<CallbackQueryTriggerData>) => {
    updateNodeData(id, update);
  };

  const onFilterChange = (newFilter: string) => {
    // Agar filtr o'zgarsa, tanlangan qiymatni tozalab qo'yamiz
    handleUpdate({ filter: newFilter, context: { value: "" } });
  };

  const onValueChange = (newValue: string) => {
    handleUpdate({ context: { value: newValue } });
  };

  const isConfigured =
    data.filter === "any" || (!!data.filter && !!data.context?.value);

  const filterOptions = useMemo(
    () =>
      ConstructorData.Filters.textFilters.filter((f) => f.value !== "command"),
    []
  );

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-5 w-5 text-primary" />
            <span>Advanced Callback Handler</span>
          </div>
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              isConfigured ? "bg-green-500" : "bg-destructive/50"
            }`}
            title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
          />
        </CardTitle>
        <CardDescription className="text-xs pt-1">
          {isConnected
            ? "Oldingi qadamdan so'ng callback'larni tinglaydi."
            : "Yangi sxemani boshlovchi global handler."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
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

        {/* --- 3. KONDISIONAL RENDER QISMI (SHARTGA QARAB INPUT YOKI SELECT KO'RSATISH) --- */}
        {data.filter && data.filter !== "any" && (
          <div className="space-y-1.5 animate-in fade-in-50">
            <Label className="text-xs text-muted-foreground">Parametr</Label>
            {showSmartSelector ? (
              <Select
                value={data.context?.value || ""}
                onValueChange={onValueChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Mavjud callback'lardan birini tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCallbacks.map((button) => (
                    <SelectItem key={button.id} value={button.value!}>
                      <div className="flex items-center justify-between w-full">
                        <span>{button.text}</span>
                        <span className="text-xs text-muted-foreground font-mono ml-4">
                          {button.value}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              // STANDART REJIM: Oddiy matn kiritish maydoni (Input)
              <ValueInput
                value={data.context?.value || ""}
                onChange={onValueChange}
                placeholder={
                  data.filter === "regex"
                    ? "Masalan: item:.*"
                    : "Masalan: main_menu"
                }
              />
            )}
          </div>
        )}
      </CardContent>

      <SourceHandler />
    </Card>
  );
};

export const CallbackQueryTriggerNode = memo(CallbackQueryTriggerNodeComponent);
