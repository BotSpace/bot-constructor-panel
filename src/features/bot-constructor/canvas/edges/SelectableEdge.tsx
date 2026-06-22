"use client";
import { memo, useState, useCallback } from "react";
import { BaseEdge, type EdgeProps, getSmoothStepPath, EdgeLabelRenderer, useNodes } from "reactflow";
import { useEdgeColor } from "@/features/bot-constructor/canvas/edges/useEdgeColor";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Trash2, Plus } from "lucide-react";

/**
 * SelectableEdge - Enhanced custom edge with animations and labels
 *
 * Features:
 * - Color-coded by handle type (success=green, error=red, default=blue)
 * - Animated flow indicator
 * - Edge labels showing target node name
 * - Visual feedback when selected (color and stroke width change)
 * - Smooth step path for cleaner look
 */
function SelectableEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  sourceHandleId,
  targetHandleId,
  style = {},
  markerEnd,
  selected,
  label,
}: EdgeProps) {
  const nodes = useNodes();
  const { stroke: edgeColor, selectedStroke } = useEdgeColor(sourceHandleId);
  const { onEdgesChange, setPendingEdgeInsert } = useFlowStore();
  const [hovered, setHovered] = useState(false);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdgesChange([{ id, type: "remove" }]);
    },
    [id, onEdgesChange]
  );

  const handleInsert = useCallback(
    (e: React.MouseEvent, midX: number, midY: number) => {
      e.stopPropagation();
      setPendingEdgeInsert({
        edgeId: id,
        source,
        sourceHandle: sourceHandleId,
        target,
        targetHandle: targetHandleId,
        midX,
        midY,
      });
    },
    [id, source, sourceHandleId, target, targetHandleId, setPendingEdgeInsert]
  );

  // Get target node name for label
  const targetNode = nodes.find((n) => n.id === target);
  const targetNodeTitle = (targetNode?.data as any)?.title || targetNode?.type?.replace('Node', '') || 'Node';

  // Calculate path using React Flow's smooth step path
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 15,
  });

  // Get original style values
  const originalStrokeWidth = (style as any)?.strokeWidth || 2.5;

  // Selected state styling - more visible
  const selectedStyle = {
    stroke: selectedStroke,
    strokeWidth: 4,
  };

  // Default style
  const defaultStyle = {
    stroke: edgeColor,
    strokeWidth: originalStrokeWidth,
  };

  // Apply selected style if edge is selected
  const dynamicStyle = selected ? selectedStyle : defaultStyle;

  // Marker color also changes when selected
  const markerColor = selected ? selectedStroke : edgeColor;

  // Accessory edges (sub-node → AI Agent acc: port) must not render an arrowhead
  const isAccessoryEdge = typeof targetHandleId === "string" && targetHandleId.startsWith("acc:");

  return (
    <>
      {/* Arrow marker — suppressed for accessory edges (acc: targetHandle) */}
      {markerEnd && !isAccessoryEdge && (
        <marker
          id={`arrowhead-${id}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerUnits="strokeWidth"
          markerWidth="10"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={markerColor} stroke="none" />
        </marker>
      )}

      {/* Invisible wide hover area */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: "pointer" }}
      />

      {/* Animated dashed line underneath for flow indication */}
      <path
        d={edgePath}
        fill="none"
        stroke={edgeColor}
        strokeWidth={dynamicStyle.strokeWidth}
        strokeDasharray="5,5"
        strokeOpacity={0.3}
        style={{
          animation: "dashdraw 0.5s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* Main Edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd && !isAccessoryEdge ? `url(#arrowhead-${id})` : undefined}
        style={{
          ...style,
          ...dynamicStyle,
          transition:
            "stroke-width 0.15s ease-in-out, stroke 0.15s ease-in-out",
          pointerEvents: "none",
        }}
      />

      {/* Edge mid-point action buttons (hover) */}
      {(hovered || selected) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => handleDelete(e)}
                title="O'chirish"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-[#1c1c1c] text-red-400 shadow-lg transition-all hover:border-red-500/60 hover:bg-red-500/20 hover:text-red-300 focus:outline-none"
              >
                <Trash2 className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => handleInsert(e, labelX, labelY)}
                title="Node qo'shish"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-[#1c1c1c] text-zinc-400 shadow-lg transition-all hover:border-primary/60 hover:bg-primary/20 hover:text-primary focus:outline-none"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Edge name label — shown only when selected and not hovering */}
      {selected && !hovered && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + 18}px)`,
              pointerEvents: "none",
            }}
            className="nodrag nopan"
          >
            <div
              className="px-2 py-0.5 text-[10px] font-medium rounded-full shadow-sm"
              style={{
                backgroundColor: edgeColor,
                color: "white",
              }}
            >
              {label || targetNodeTitle}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}

      <style jsx global>{`
        @keyframes dashdraw {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>
    </>
  );
}

export default memo(SelectableEdge);
