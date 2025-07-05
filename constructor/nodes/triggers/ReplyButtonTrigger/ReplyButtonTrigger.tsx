import { memo, useMemo } from "react";
import { Handle, NodeProps, Position, useNodes, useEdges } from "reactflow";
import { useFlowStore } from "@/constructor/store/flowStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ReplyButtonTriggerData } from "./types";
import { ButtonConfig } from "@/constructor/components/ButtonGenerator";
import { AlertCircle, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// YORDAMCHI INTERFEYS: Ota-ona node'ning `data` obyekti qanday bo'lishini tasvirlaydi
interface NodeWithButtonsData {
  buttons?: ButtonConfig[][];
}

const ReplyButtonTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<ReplyButtonTriggerData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();

  const availableReplyButtons = useMemo(() => {
    console.log("--- Trigger re-calculating ---"); // Har safar hisoblaganda ko'ramiz

    const incomingEdge = edges.find((edge) => edge.target === id);
    console.log("Incoming edge:", incomingEdge); // Ulanishni topdimi?

    if (!incomingEdge) return [];

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    console.log("Parent node:", parentNode); // Ota-onani topdimi?

    if (!parentNode) return [];

    const parentNodeData = parentNode.data as NodeWithButtonsData;
    console.log("Parent node DATA:", parentNodeData); // Ota-onaning ma'lumotlari qanday?

    const parentButtons = parentNodeData.buttons || [];
    console.log("Buttons from parent:", parentButtons); // Tugmalar massivi qanday?

    const filteredButtons = parentButtons.flat().filter((button) => {
      // HAR BIR TUGMANI FILTERDAN OLDIN TEKSHIRAMIZ
      console.log("TUGMANI TEKSHIRISH:", button);
      // return button.type === "reply";
      switch (button.type) {
        case "request_contact":
        case "request_location":
        case "reply":
          return true;
        default:
          return false;
      }
    });

    return filteredButtons;
  }, [nodes, edges, id]);

  const handleSelectionChange = (buttonText: string, checked: boolean) => {
    const currentSelection = data.selectedButtons || [];
    let newSelection: string[];

    if (checked) {
      newSelection = [...currentSelection, buttonText];
    } else {
      newSelection = currentSelection.filter((text) => text !== buttonText);
    }
    updateNodeData(id, { selectedButtons: newSelection });
  };

  const isConfigured = (data.selectedButtons?.length ?? 0) > 0;

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <CornerDownLeft className="h-5 w-5 text-primary" />
            <span>Reply Tugma Handleri</span>
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
        {availableReplyButtons.length > 0 ? (
          <div className="space-y-2 p-3 bg-muted/50 rounded-md border">
            <Label className="text-xs text-muted-foreground">
              Qaysi tugmalar ushlansin?
            </Label>
            {availableReplyButtons.map((button) => (
              <div key={button.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${id}-${button.id}`}
                  checked={data.selectedButtons?.includes(button.text)}
                  onCheckedChange={(checked) =>
                    handleSelectionChange(button.text, !!checked)
                  }
                />
                <Label
                  htmlFor={`${id}-${button.id}`}
                  className="font-normal cursor-pointer"
                >
                  {button.text}
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-center text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>
              Iltimos, bu nodeni Reply-tugmalari mavjud bo'lgan node'ga ulang.
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

export const ReplyButtonTriggerNode = memo(ReplyButtonTriggerNodeComponent);
