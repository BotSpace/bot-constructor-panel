"use client";
import { memo } from "react";
import { BaseEdge, type EdgeProps, getSmoothStepPath, EdgeLabelRenderer, useNodes } from "reactflow";
import { useEdgeColor } from "./useEdgeColor";

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
  style = {},
  markerEnd,
  selected,
  label,
}: EdgeProps) {
  const nodes = useNodes();
  const { stroke: edgeColor, selectedStroke } = useEdgeColor(sourceHandleId);

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

  return (
    <>
      {/* Arrow marker */}
      {markerEnd && (
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
        }}
      />

      {/* Main Edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd ? `url(#arrowhead-${id})` : undefined}
        style={{
          ...style,
          ...dynamicStyle,
          transition:
            "stroke-width 0.15s ease-in-out, stroke 0.15s ease-in-out",
        }}
      />

      {/* Edge Label */}
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            <div
              className="px-2 py-0.5 text-[10px] font-medium rounded-full shadow-sm"
              style={{
                backgroundColor: edgeColor,
                color: "white",
                opacity: selected ? 1 : 0.7,
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
