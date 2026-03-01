"use client";

import { NodeProps } from "reactflow";
import { EditOrSendMessageNodeData } from "./types";
import { useFlowStore } from "@/features/bot-constructor/store";
import { memo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PenLine, ListPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-dropdown-menu";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { DynamicMessageConstructor } from "../TextMessageNode/components/dynamic-message-constructor-modal";
import { Button } from "@/components/ui/button";
import TextArea from "../shared/text-area";
import { ActionPanel } from "../../components/shared/ActionPanel";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";

const EditOrSendMessageNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<EditOrSendMessageNodeData>) => {
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const handleUpdate = (update: Partial<EditOrSendMessageNodeData>) => {
    updateNodeData(id, update);
  };

  const keyboard = data.keyboard ?? { active: "inline" as const, inline: [], reply: [] };

  const buttonCount =
    (keyboard.active === "inline"
      ? keyboard.inline
      : keyboard.reply
    )?.flat().length || 0;

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary relative")}>
      <TargetHandles />

      <NodeHeader
        icon={<PenLine className="text-primary" />}
        title="Edit yoki Yuborish"
        buttonCount={buttonCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      {!isCollapsed && (
        <>
          <CardContent className="grid gap-2">
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1.5">
              Callback bo&#39;lsa — xabarni tahrirlaydi, aks holda yangi xabar yuboradi
            </div>

            <div className="flex justify-between items-center">
              <Label>Xabar matni</Label>
              <DynamicMessageConstructor
                handleUpdate={handleUpdate}
                initialDynamicMessages={data.dynamicMessages}
                id={id}
              >
                <Button size={"icon-sm"} variant={"outline"}>
                  <ListPlus />
                </Button>
              </DynamicMessageConstructor>
            </div>
            <TextArea
              placeholder="Xabar matni..."
              defaultValue={data.messageText}
              onChange={(e) => handleUpdate({ messageText: e })}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <ActionPanel
              keyboard={keyboard}
              disableNotification={data.disableNotification}
              parseMode={data.parseMode}
              id={id}
              recipients={data.recipients ?? { sendToSender: true, additionalIds: [] }}
              hideHandlers
            />
          </CardFooter>
        </>
      )}

      <HandlersList keyboard={data.keyboard} sourceNodeId={id} />
      <SourceHandles />
    </Card>
  );
};

export const EditOrSendMessageNode = memo(EditOrSendMessageNodeComponent);
