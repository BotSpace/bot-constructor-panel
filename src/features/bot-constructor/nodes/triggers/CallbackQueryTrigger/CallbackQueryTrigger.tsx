// FAYL: constructor/nodes/triggers/CallbackQueryTrigger/CallbackQueryTrigger.tsx (YANGILANGAN - Collection support)

import { memo, useMemo, useState } from "react";
import { NodeProps, useNodes, useEdges } from "reactflow";
import { useFlowStore } from "@/features/bot-constructor/store";
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
import { FilterSelector } from "@/features/bot-constructor/nodes/triggers/MessageTrigger/components/FilterSelector";
import { ValueInput } from "@/features/bot-constructor/nodes/triggers/MessageTrigger/components/ParameterInput/ValueInput";
import { ConstructorData } from "@/features/bot-constructor/data";
import { MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceHandles, TargetHandles } from "../../components";
import { Checkbox } from "@/components/ui/checkbox";
import { ElseMessageSource } from "../../components/shared/ReactFlowHandles/ElseMessageSource";
import { KeyboardConfig } from "@/features/bot-constructor/components";
import { TriggerHeader } from "../shared/TriggerHeader";
import { StateConfigUI, getStateTypesForCallbackQueryTrigger } from "../shared";

// YORDAMCHI INTERFEYS: Ota-ona node'ning `data` obyekti qanday bo'lishini tasvirlaydi
interface NodeWithKeyboardData {
  keyboard?: KeyboardConfig;
}

interface CallbackOption {
  id: string;
  text: string;
  value: string;
  isCollection: boolean;
  collectionName?: string;
  fieldName?: string;
}

const CallbackQueryTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CallbackQueryTriggerData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();
  const [isExpanded, setIsExpanded] = useState(true);

  // --- 1. OTA-ONA NODE'DAN CALLBACK TUGMALARINI OLISH (STATIC + COLLECTION) ---
  const availableCallbacks = useMemo(() => {
    const incomingEdge = edges.find((edge) => edge.target === id);
    if (!incomingEdge) return [];

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    if (!parentNode) return [];

    const parentNodeData = parentNode.data as NodeWithKeyboardData;
    if (!parentNodeData.keyboard || !parentNodeData.keyboard.inline) {
      return [];
    }

    const callbacks: CallbackOption[] = [];

    // Static va Collection callback tugmalarni olamiz
    for (const button of parentNodeData.keyboard.inline.flat()) {
      // Static callback button
      if (
        button.type === "callback" &&
        button.value &&
        !button.collectionData
      ) {
        callbacks.push({
          id: button.id,
          text: button.text,
          value: button.value,
          isCollection: false,
        });
      }

      // Collection button (dynamic)
      if (button.collectionData) {
        const { collection, text } = button.collectionData;
        callbacks.push({
          id: button.id,
          text: button.text.replace("📦 ", ""),
          value: `collection:${collection}:${text}`,
          isCollection: true,
          collectionName: collection,
          fieldName: text,
        });
      }
    }

    return callbacks;
  }, [nodes, edges, id]);

  const isConnected = useMemo(
    () => edges.some((edge) => edge.target === id),
    [edges, id]
  );

  // --- 2. "AQLLI" REJIMNI YOQISH UCHUN SHART ---
  // Endi faqat filter === "equals" da emas, balki "collection" da ham ko'rsatamiz
  const showStaticSelector =
    isConnected && availableCallbacks.length > 0 && data.filter === "equals";

  const showCollectionSelector =
    isConnected &&
    availableCallbacks.filter((c) => c.isCollection).length > 0 &&
    data.filter === "collection";

  const handleUpdate = (update: Partial<CallbackQueryTriggerData>) => {
    updateNodeData(id, update);
  };

  const onFilterChange = (newFilter: string) => {
    handleUpdate({ ...data, filter: newFilter });
  };

  const onValueChange = (newValue: string) => {
    handleUpdate({ context: { ...data.context, value: newValue } });
  };

  const isConfigured =
    data.filter === "any" || (!!data.filter && !!data.context?.value);

  const filterOptions = useMemo(
    () => ConstructorData.Filters.callbackFilters,
    []
  );

  const availableStateTypes = useMemo(() => {
    // Check if the selected callback value is from a collection button
    const selectedValue = data.context?.value || "";
    const isCollectionButton = selectedValue.startsWith("collection:");
    return getStateTypesForCallbackQueryTrigger(isCollectionButton);
  }, [data.context?.value]);

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <ElseMessageSource />

      <TriggerHeader
        icon={<MousePointerClick className="h-4 w-4 text-primary flex-shrink-0" />}
        title="Callback Handler"
        isExpanded={isExpanded}
        isConfigured={isConfigured}
        onToggle={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
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

          {/* --- 3. SMART SELECTOR (STATIC YA COLLECTION) --- */}
          {data.filter && data.filter !== "any" && (
            <div className="space-y-1.5 animate-in fade-in-50">
              <Label className="text-xs text-muted-foreground">Parametr</Label>
              {showStaticSelector ? (
                // Static callback tugmalar uchun selector
                <Select
                  value={data.context?.value || ""}
                  onValueChange={onValueChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Static callback tanlang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCallbacks
                      .filter((button) => !button.isCollection)
                      .map((button) => (
                        <SelectItem key={button.id} value={button.value}>
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{button.text}</span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {button.value}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : showCollectionSelector ? (
                // Collection callback tugmalar uchun selector
                <Select
                  value={data.context?.value || ""}
                  onValueChange={onValueChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Collection callback tanlang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCallbacks
                      .filter((button) => button.isCollection)
                      .map((button) => (
                        <SelectItem key={button.id} value={button.value}>
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="flex items-center gap-1.5">
                              📦 {button.text}
                              <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                                Dynamic
                              </span>
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {button.collectionName}.{button.fieldName}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                // Qo'lda kiritish uchun input
                <ValueInput
                  value={data.context?.value || ""}
                  onChange={onValueChange}
                  placeholder={
                    data.filter === "regex"
                      ? "Masalan: item:.*"
                      : data.filter === "collection"
                        ? "Masalan: collection:users:id"
                        : "Masalan: main_menu"
                  }
                />
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="global-checkbox"
              checked={data.global}
              onCheckedChange={(e) =>
                handleUpdate({
                  ...data,
                  global: e as boolean,
                })
              }
            />
            <Label htmlFor="global-checkbox" className="text-sm cursor-pointer">
              Global
            </Label>
          </div>

          {/* State Configuration */}
          <StateConfigUI
            state={data.state}
            onStateChange={(state) => handleUpdate({ state })}
            availableTypes={availableStateTypes}
            nodeId={id}
          />
        </CardContent>
      )}

      <SourceHandles />
    </Card>
  );
};

export const CallbackQueryTriggerNode = memo(CallbackQueryTriggerNodeComponent);
