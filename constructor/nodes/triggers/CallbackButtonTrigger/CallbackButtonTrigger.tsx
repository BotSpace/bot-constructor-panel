import { memo, useMemo } from "react";
import { Handle, NodeProps, Position, useNodes, useEdges } from "reactflow";
import { useFlowStore } from "@/constructor/store/flowStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CallbackButtonTriggerData } from "./types";
import { ButtonConfig } from "@/constructor/components/ButtonGenerator";
import { AlertCircle, Zap } from "lucide-react"; // Ikonkani o'zgartirdik
import { cn } from "@/lib/utils";

interface NodeWithButtonsData {
  buttons?: ButtonConfig[][];
}

const CallbackButtonTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CallbackButtonTriggerData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();

  const availableCallbackButtons = useMemo(() => {
    const incomingEdge = edges.find((edge) => edge.target === id);
    if (!incomingEdge) return [];

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    if (!parentNode) return [];

    const parentNodeData = parentNode.data as NodeWithButtonsData;
    const parentButtons = parentNodeData.buttons || [];

    // --- ASOSIY O'ZGARISH: Faqat 'callback' tipli tugmalarni olamiz ---
    return parentButtons
      .flat()
      .filter((button) => button.type === "callback" || button.type === "url");
  }, [nodes, edges, id]);

  const handleSelectionChange = (callbackValue: string, checked: boolean) => {
    const currentSelection = data.selectedCallbacks || [];
    let newSelection: string[];

    if (checked) {
      newSelection = [...currentSelection, callbackValue];
    } else {
      newSelection = currentSelection.filter(
        (value) => value !== callbackValue
      );
    }
    // MUHIM: `selectedCallbacks` maydonini yangilaymiz
    updateNodeData(id, { selectedCallbacks: newSelection });
  };

  const isConfigured = (data.selectedCallbacks?.length ?? 0) > 0;

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> {/* Yangi ikonka */}
            <span>Callback Tugma Handleri</span>
          </div>
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              isConfigured ? "bg-green-500" : "bg-destructive/50"
            }`}
            title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
          />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {availableCallbackButtons.length > 0 ? (
          <div className="space-y-2 p-3 bg-muted/50 rounded-md border">
            <Label className="text-xs text-muted-foreground">
              Qaysi callback'lar ushlansin?
            </Label>
            {availableCallbackButtons.map((button) => (
              <div key={button.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${id}-${button.id}`}
                  // MUHIM: `selectedCallbacks` ichidan qidiramiz
                  checked={data.selectedCallbacks?.includes(button.value || "")}
                  onCheckedChange={(checked) =>
                    // MUHIM: `button.value` ni (callback_data) yuboramiz
                    handleSelectionChange(button.value || "", !!checked)
                  }
                />
                <Label
                  htmlFor={`${id}-${button.id}`}
                  className="font-normal cursor-pointer"
                >
                  {button.text}{" "}
                  <span className="text-xs text-muted-foreground font-mono">
                    ({button.value})
                  </span>
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-center text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>
              Iltimos, bu nodeni Inline (callback) tugmalari mavjud bo'lgan
              node'ga ulang.
            </span>
          </div>
        )}
      </CardContent>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-500"
      />
    </Card>
  );
};

export const CallbackButtonTriggerNode = memo(
  CallbackButtonTriggerNodeComponent
);
