import { useIsInNodePanel } from "@/features/bot-constructor/hooks/NodePanelContext";
import { useFlowStore } from "@/features/bot-constructor/store";
import { ReactNode, useEffect, useMemo } from "react";
import { Position, useUpdateNodeInternals } from "reactflow";
import { SourceHandles, TargetHandles } from "@/features/bot-constructor/canvas/handles";
import { DeleteMessageSource } from "@/features/bot-constructor/canvas/handles/DeleteMessageSource";
import { EditMessageSource } from "@/features/bot-constructor/canvas/handles/EditMessageSource";
import { ElseMessageSource } from "@/features/bot-constructor/canvas/handles/ElseMessageSource";
import { SelectedMessageTarget } from "@/features/bot-constructor/canvas/handles/SelectedMessageTarget";
import {
  PillHandle,
  PillHandleTone,
} from "@/features/bot-constructor/canvas/handles/PillHandle";
import { NodeHandleManifest, NodeAccessoryPortManifest } from "@/features/bot-constructor/manifest/types";

const HANDLE_SIDE_TO_POSITION: Record<string, Position> = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

// PillHandle uses translate(calc(100% + 8px), -50%) for right-side handles.
// When the wrapper div already sets top:0 (anchored to its own center), we keep the
// same transform so the pill dot lands 8px outside the card edge, vertically centered.
const HANDLE_LABEL_OFFSET: Record<string, string> = {
  right: "translate(calc(100% + 8px), -50%)",
  left: "translate(calc(-100% - 8px), -50%)",
  top: "translate(-50%, calc(-100% - 8px))",
  bottom: "translate(-50%, calc(100% + 8px))",
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
  accessoryPorts?: NodeAccessoryPortManifest[];
}

function GenericHandleRenderer({
  handle,
  nodeId,
  accessoryPorts,
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

  if (handle.preset === "source-bottom") {
    return <SourceHandles nodeId={nodeId} position={Position.Bottom} />;
  }

  if (handle.preset === "source-top") {
    return <SourceHandles nodeId={nodeId} position={Position.Top} />;
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

  if (
    handle.preset === "subflow-dynamic-sources" ||
    handle.preset === "dynamic-outputs-sources"
  ) {
    return <DynamicOutputsSources nodeId={nodeId} />;
  }

  if (handle.preset === "switch-case-sources") {
    return <SwitchCaseSources nodeId={nodeId} />;
  }

  if (handle.preset === "accessory-ports") {
    return <AccessoryPortHandles ports={accessoryPorts ?? []} />;
  }

  if (!handle.kind || !handle.side) {
    return null;
  }

  const tone = HANDLE_VARIANT_TONE[handle.styleVariant || "default"];

  // When `hidden` is true the handle must remain in the DOM so React Flow can
  // still route edges to it, but it must not be visible on the canvas.
  // opacity:0 hides the pill while keeping pointer-events active so the
  // handle still acts as a valid edge drop target.
  if (handle.hidden) {
    return (
      <PillHandle
        id={handle.id ?? `${handle.kind}-${handle.side}`}
        type={handle.kind}
        position={HANDLE_SIDE_TO_POSITION[handle.side]}
        tone={tone}
        isConnectableStart={true}
        showPlus={false}
        className={handle.offsetClass}
        style={{ opacity: 0 }}
      />
    );
  }

  if (handle.label) {
    const isRight = handle.side === "right";
    const isLeft = handle.side === "left";
    // Wrapper sits at top:50% (node center) then offsetClass (e.g. translate-y-[-85%])
    // shifts it vertically — exactly the same mechanic as plain PillHandle + offsetClass.
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          ...(isRight ? { right: 0 } : isLeft ? { left: 0 } : {}),
        }}
        className={handle.offsetClass}
      >
        <PillHandle
          id={handle.id ?? `${handle.kind}-${handle.side}`}
          type={handle.kind}
          position={HANDLE_SIDE_TO_POSITION[handle.side]}
          tone={tone}
          isConnectableStart={handle.kind !== "target"}
          showPlus={handle.kind === "source"}
          title={handle.label}
          // PillHandle applies its own translate, we reset top so it anchors to the wrapper div
          style={{ top: 0, transform: HANDLE_LABEL_OFFSET[handle.side ?? "right"] }}
        />
        <span
          style={{
            position: "absolute",
            top: 0,
            transform: "translateY(-50%)",
            ...(isRight ? { right: "calc(100% + 14px)" } : isLeft ? { left: "calc(100% + 14px)" } : {}),
            whiteSpace: "nowrap",
            fontSize: 9,
            lineHeight: "12px",
            pointerEvents: "none",
            userSelect: "none",
          }}
          className="text-muted-foreground font-medium"
        >
          {handle.label}
        </span>
      </div>
    );
  }

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

const ACC_PORT_LEFT_POSITIONS: Record<number, string[]> = {
  1: ["50%"],
  2: ["30%", "70%"],
  3: ["20%", "50%", "80%"],
};

function AccessoryPortHandles({ ports }: { ports: NodeAccessoryPortManifest[] }) {
  const positions = ACC_PORT_LEFT_POSITIONS[ports.length] ?? ports.map((_, i) => `${((i + 1) / (ports.length + 1)) * 100}%`);

  return (
    <>
      {ports.map((port, index) => {
        const tone = HANDLE_VARIANT_TONE[port.styleVariant ?? "accent"] as PillHandleTone;
        const left = positions[index] ?? "50%";
        return (
          // pointer-events: none on the wrapper so it never intercepts handle drag events.
          // The Handle element itself manages its own pointer interactions via React Flow.
          <div key={port.portType} style={{ position: "absolute", bottom: 0, left, pointerEvents: "none" }}>
            <PillHandle
              id={`acc:${port.portType}`}
              type="target"
              position={Position.Bottom}
              tone={tone}
              title={port.labelFallback}
              // In ConnectionMode.Loose the target handle can also initiate a connection drag.
              // Keeping isConnectableStart undefined (defaults to true in ReactFlow) so users
              // can drag from either side of the accessory edge.
              isConnectableStart={true}
              showPlus={false}
              style={{
                // Re-apply the standard bottom-handle offset so the pill sits just outside the card edge.
                transform: `translate(-50%, calc(100% + 8px))`,
                // Restore pointer events for the handle dot itself.
                pointerEvents: "all",
              }}
            />
            <span
              style={{
                position: "absolute",
                // 44px below the card bottom: handle dot is ~8+16=24px below edge, label adds 20px gap.
                bottom: -44,
                left: "50%",
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                fontSize: 9,
                lineHeight: "12px",
                pointerEvents: "none",
                userSelect: "none",
              }}
              className="text-muted-foreground font-medium"
            >
              {port.labelFallback}
            </span>
          </div>
        );
      })}
    </>
  );
}

function DynamicOutputsSources({ nodeId }: { nodeId: string }) {
  const nodes = useFlowStore((state) => state.nodes);
  const updateNodeInternals = useUpdateNodeInternals();
  const outputs = useMemo(() => {
    const node = nodes.find((item) => item.id === nodeId);
    return Array.isArray(node?.data?.outputs)
      ? (node.data.outputs as Array<{ name: string }>)
      : [];
  }, [nodeId, nodes]);

  // React Flow caches handle DOM positions internally. When outputs change
  // (added/removed/reordered), the handle `top` percentages change but
  // React Flow doesn't re-measure them automatically. Calling
  // updateNodeInternals forces a re-scan of all handles for this node so
  // that new edges draw from the correct position instead of the node center.
  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [nodeId, outputs, updateNodeInternals]);

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

interface SwitchCase {
  id: string;
  match: string;
  label?: string;
}

function SwitchCaseSources({ nodeId }: { nodeId: string }) {
  const nodes = useFlowStore((state) => state.nodes);
  const updateNodeInternals = useUpdateNodeInternals();

  const { cases, hasDefault } = useMemo(() => {
    const node = nodes.find((item) => item.id === nodeId);
    const rawCases = Array.isArray(node?.data?.cases)
      ? (node.data.cases as SwitchCase[])
      : [];
    const def = node?.data?.default === true;
    return { cases: rawCases, hasDefault: def };
  }, [nodeId, nodes]);

  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [nodeId, cases, hasDefault, updateNodeInternals]);

  const totalHandles = cases.length + (hasDefault ? 1 : 0);

  if (totalHandles === 0) {
    return (
      <PillHandle
        id="source-handler"
        type="source"
        position={Position.Right}
        tone="accent"
      />
    );
  }

  return (
    <>
      {cases.map((c, index) => {
        const topPct = ((index + 1) / (totalHandles + 1)) * 100;
        const label = c.label || c.match || `Case ${index + 1}`;
        // id bo'sh bo'lsa index'dan stable key yasaymiz
        const caseId = c.id || `case_${index}`;
        return (
          <div
            key={caseId}
            style={{ position: "absolute", right: 0, top: `${topPct}%`, transform: "translateY(-50%)" }}
          >
            <PillHandle
              id={`output-${caseId}`}
              type="source"
              position={Position.Right}
              tone="neutral"
              title={label}
              style={{ top: 0, transform: "translate(calc(100% + 8px), -50%)" }}
            />
            <span
              style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                right: "calc(100% + 14px)",
                whiteSpace: "nowrap",
                fontSize: 9,
                lineHeight: "12px",
                pointerEvents: "none",
                userSelect: "none",
              }}
              className="text-muted-foreground font-medium"
            >
              {label}
            </span>
          </div>
        );
      })}
      {hasDefault && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: `${(totalHandles / (totalHandles + 1)) * 100}%`,
            transform: "translateY(-50%)",
          }}
        >
          <PillHandle
            id="output-default"
            type="source"
            position={Position.Right}
            tone="accent"
            title="Default"
            style={{ top: 0, transform: "translate(calc(100% + 8px), -50%)" }}
          />
          <span
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              right: "calc(100% + 14px)",
              whiteSpace: "nowrap",
              fontSize: 9,
              lineHeight: "12px",
              pointerEvents: "none",
              userSelect: "none",
            }}
            className="text-muted-foreground font-medium"
          >
            Default
          </span>
        </div>
      )}
    </>
  );
}

export function renderHandleFromManifest(
  handle: NodeHandleManifest,
  nodeId: string,
  key: string,
  accessoryPorts?: NodeAccessoryPortManifest[]
) {
  return (
    <GenericHandleRenderer
      key={key}
      handle={handle}
      nodeId={nodeId}
      accessoryPorts={accessoryPorts}
    />
  );
}
