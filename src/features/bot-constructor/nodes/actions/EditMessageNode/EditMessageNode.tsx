import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { memo } from "react";
import { NodeProps } from "reactflow";
import { EditMessageNodeData, MessageIdSource } from "./types";
import { cn } from "@/lib/utils";
import { SourceHandles, TargetHandles } from "../../components";
import { NodeHeader } from "../shared/NodeHeader";
import { findNearestParentAction } from "@/features/bot-constructor/lib/findNearestParentAction";
import { ElementItemType } from "@/types/element-types";
import { useFlowStore } from "@/features/bot-constructor/store";
import { ActionPanel } from "../../components/shared/ActionPanel";
import { EditMessageSource } from "../../components/shared/ReactFlowHandles/EditMessageSource";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";
import ForTextMessageNode from "./components/ForTextMessageNode";
import ForVideoPhotoDocumentAudio from "./components/ForVideoPhotoDocumentAudio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export const EditMessageNode = memo(
  ({ id, data, selected }: NodeProps<EditMessageNodeData>) => {
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
          <Select
            onValueChange={(value) =>
              handleUpdate({ messageIdSource: value as MessageIdSource })
            }
            value={data.messageIdSource}
          >
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_message">Yuqoridagi xabar</SelectItem>
              <SelectItem value="connected_node">Ko'rsatilgan xabar</SelectItem>
              <SelectItem value="message_id">Ko'rsatilgan xabar</SelectItem>
            </SelectContent>
          </Select>

          {nearestParentAction ? null : (
            <div>
              <p className="p-4 text-center text-red-500">
                No parent action found
              </p>
            </div>
          )}

          {data.messageIdSource === "message_id" ? (
            <>
              <Input
                value={data.messageId || ""}
                onChange={(e) => handleUpdate({ messageId: e.target.value })}
                placeholder="Enter message id"
              />
            </>
          ) : parrentActionType === "SendTextMessageNode" ? (
            <ForTextMessageNode
              data={data}
              handleUpdate={handleUpdate}
              id={id}
            />
          ) : (
            parrentActionType === "SendPhotoNode" ||
            parrentActionType === "SendVideoNode" ||
            parrentActionType === "SendFileNode" ||
            (parrentActionType === "SendAudioNode" && (
              <ForVideoPhotoDocumentAudio
                data={data}
                handleUpdate={handleUpdate}
                id={id}
              />
            ))
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <ActionPanel keyboard={data.keyboard} parseMode={data.parseMode} id={id} />
        </CardFooter>

        {/* Handler list */}
        <HandlersList sourceNodeId={id} />

        <SourceHandles />
        <EditMessageSource />
      </Card>
    );
  }
);

EditMessageNode.displayName = "EditMessageNode";
