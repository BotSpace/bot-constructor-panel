import { Card, CardContent } from "@/components/ui/card";
import { memo } from "react";
import { NodeProps } from "reactflow";
import { EditMessageNodeData } from "./types";
import { cn } from "@/lib/utils";
import { SourceHandles, TargetHandles } from "../../components";
import { NodeHeader } from "../shared/NodeHeader";
import { findNearestParentAction } from "@/features/bot-constructor/lib/findNearestParentAction";
import { ElementItemType } from "@/types/element-types";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DynamicMessageConstructor } from "../TextMessageNode/components/dynamic-message-constructor-modal";
import { ListPlus } from "lucide-react";
import TelegramEditor from "@/features/bot-constructor/components/RichTextEditor/editor/TelegramEditor";

export const EditMessageNode = memo(
  ({ id, data, selected, isConnectable }: NodeProps<EditMessageNodeData>) => {
    const updateNodeData = useFlowStore((state) => state.updateNodeData);

    const nearestParentAction = findNearestParentAction(id);
    const parrentActionType =
      nearestParentAction?.type as ElementItemType["triggerId"];

    // Ma'lumotlarni global store'da yangilash uchun markaziy funksiya
    const handleUpdate = (update: Partial<EditMessageNodeData>) => {
      updateNodeData(id, update);
    };

    return (
      <Card
        className={cn(
          "w-100 shadow-lg relative",
          selected && "ring-2 ring-primary"
        )}
      >
        <TargetHandles />
        <NodeHeader icon="✍️" title="Edit Message" nodeId={id} />

        <CardContent>
          {nearestParentAction ? null : (
            <div>
              <p className="p-4 text-center text-red-500">
                No parent action found
              </p>
            </div>
          )}
          {/* Xabar matni */}

          {parrentActionType === "SendTextMessageNode" ? (
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>Yangi xabar matni</Label>

                <DynamicMessageConstructor data={data} id={id}>
                  <Button size={"icon-sm"} variant={"outline"}>
                    <ListPlus />
                  </Button>
                </DynamicMessageConstructor>
              </div>

              <TelegramEditor
                initialData={data.newText || undefined}
                onSave={(data) => handleUpdate({ newText: data })}
                data={data}
              />
            </div>
          ) : null}
        </CardContent>
        {/* <ButtonCreator
          nodeId={id}
          keyboard={data.keyboard}
          data={data}
          onUpdate={handleUpdate}
        /> */}

        <SourceHandles />
      </Card>
    );
  }
);

EditMessageNode.displayName = "EditMessageNode";
