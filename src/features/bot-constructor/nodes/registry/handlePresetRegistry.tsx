import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";
import { useFlowStore } from "@/features/bot-constructor/store";
import { ReactNode, useMemo } from "react";
import { Position } from "reactflow";
import { SourceHandles, TargetHandles } from "../components";
import { DeleteMessageSource } from "../components/shared/ReactFlowHandles/DeleteMessageSource";
import { EditMessageSource } from "../components/shared/ReactFlowHandles/EditMessageSource";
import { ElseMessageSource } from "../components/shared/ReactFlowHandles/ElseMessageSource";
import { SelectedMessageTarget } from "../components/shared/ReactFlowHandles/SelectedMessageTarget";
import {
  PillHandle,
  PillHandleTone,
} from "../components/shared/ReactFlowHandles/PillHandle";
import { NodeHandleManifest } from "./types";

const HANDLE_SIDE_TO_POSITION: Record<string, Position> = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

const HANDLE_VARIANT_TONE: Record<string, PillHandleTone> = {
  default: "neutral",
  success: "success",
  warning: "warning",
  danger: "danger",
  accent: "accent",
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

  if (handle.preset === "subflow-dynamic-sources") {
    return <SubFlowDynamicSources nodeId={nodeId} />;
  }

  if (!handle.kind || !handle.side) {
    return null;
  }

  const tone = HANDLE_VARIANT_TONE[handle.styleVariant || "default"];

  return (
    <PillHandle
      id={handle.id ?? `${handle.kind}-${handle.side}`}
      type={handle.kind}
      position={HANDLE_SIDE_TO_POSITION[handle.side]}
      tone={tone}
      isConnectableStart={handle.kind !== "target"}
      showPlus={handle.kind === "source"}
      className={handle.offsetClass}
    />
  );
}

function SubFlowDynamicSources({ nodeId }: { nodeId: string }) {
  const nodes = useFlowStore((state) => state.nodes);
  const outputs = useMemo(() => {
    const node = nodes.find((item) => item.id === nodeId);
    return Array.isArray(node?.data?.outputs)
      ? (node.data.outputs as Array<{ name: string }>)
      : [];
  }, [nodeId, nodes]);

  if (outputs.length > 0) {
    return (
      <>
        {outputs.map((output, index) => (
          <PillHandle
            key={output.name}
            id={`output-${output.name}`}
            type="source"
            position={Position.Right}
            tone="success"
            title={output.name}
            style={{ top: `${((index + 1) / (outputs.length + 1)) * 100}%` }}
          />
        ))}
      </>
    );
  }

  return (
    <PillHandle
      id="source-handler"
      type="source"
      position={Position.Right}
      tone="accent"
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
