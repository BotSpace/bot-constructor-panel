"use client";
import { memo } from "react";
import { BaseEdge, type EdgeProps, getSmoothStepPath } from "reactflow";
import { useEdgeColor } from "./useEdgeColor";

/**
 * SelectableEdge - Minimal custom edge that shows selected state
 *
 * Features:
 * - Shows visual feedback when selected (color and stroke width change)
 * - Uses React Flow's default step path
 * - Maintains original styling when not selected
 */
function SelectableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  const { stroke: edgeColor, selectedStroke } = useEdgeColor();

  // Calculate path using React Flow's smooth step path
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 15,
  });

  // Get original style values
  const originalStrokeWidth = (style as any)?.strokeWidth || 4;

  // Selected state styling - more visible
  const selectedStyle = {
    stroke: selectedStroke,
    strokeWidth: 5,
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

      {/* Edge path */}
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
    </>
  );
}

export default memo(SelectableEdge);
