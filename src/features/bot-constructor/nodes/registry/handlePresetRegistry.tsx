import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Handle, Position } from "reactflow";
import { SourceHandles, TargetHandles } from "../components";
import { DeleteMessageSource } from "../components/shared/ReactFlowHandles/DeleteMessageSource";
import { EditMessageSource } from "../components/shared/ReactFlowHandles/EditMessageSource";
import { ElseMessageSource } from "../components/shared/ReactFlowHandles/ElseMessageSource";
import { SelectedMessageTarget } from "../components/shared/ReactFlowHandles/SelectedMessageTarget";
import { NodeHandleManifest } from "./types";

const HANDLE_SIDE_TO_POSITION: Record<string, Position> = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

const HANDLE_VARIANT_CLASS: Record<string, string> = {
  default:
    "!w-4 !h-4 !rounded-full !bg-zinc-400/60 !border-2 !border-background",
  success: "!w-4 !h-4 !rounded-full !bg-green-500 !border-2 !border-background",
  warning:
    "!w-4 !h-4 !rounded-full !bg-orange-400 !border-2 !border-background",
  danger: "!w-4 !h-4 !rounded-full !bg-red-500 !border-2 !border-background",
  accent: "!w-4 !h-4 !rounded-full !bg-sky-500 !border-2 !border-background",
};

interface GenericHandleRendererProps {
  handle: NodeHandleManifest;
  nodeId: string;
}

function GenericHandleRenderer({
  handle,
  nodeId,
}: GenericHandleRendererProps): ReactNode {
  const inPanel = useIsInNodePanel();

  if (inPanel) {
    return null;
  }

  if (handle.preset === "target-default") {
    return <TargetHandles />;
  }

  if (handle.preset === "source-default") {
    return <SourceHandles nodeId={nodeId} />;
  }

  if (handle.preset === "else-source") {
    return <ElseMessageSource />;
  }

  if (handle.preset === "selected-message-target") {
    return <SelectedMessageTarget />;
  }

  if (handle.preset === "edit-message-source") {
    return <EditMessageSource />;
  }

  if (handle.preset === "delete-message-source") {
    return <DeleteMessageSource />;
  }

  if (!handle.kind || !handle.side) {
    return null;
  }

  return (
    <Handle
      type={handle.kind}
      position={HANDLE_SIDE_TO_POSITION[handle.side]}
      id={handle.id}
      isConnectableStart={handle.kind !== "target"}
      className={cn(
        HANDLE_VARIANT_CLASS[handle.styleVariant || "default"],
        handle.offsetClass
      )}
    />
  );
}

export function renderHandleFromManifest(
  handle: NodeHandleManifest,
  nodeId: string,
  key: string
) {
  return <GenericHandleRenderer key={key} handle={handle} nodeId={nodeId} />;
}
