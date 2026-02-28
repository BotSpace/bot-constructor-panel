"use client";
import { memo } from "react";
import {
  type ConnectionLineComponentProps,
  getBezierPath,
} from "reactflow";
import { getEdgeParams } from "./utils";

/**
 * FloatingConnectionLine - Custom connection line component
 * for floating edges that shows the preview while connecting
 */
function FloatingConnectionLine({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
  fromNode,
  toNode,
}: ConnectionLineComponentProps & { toNode?: any }) {
  // If we have both nodes, use the utility to get proper positions
  let sourceX = fromX;
  let sourceY = fromY;
  let targetX = toX;
  let targetY = toY;
  let finalSourcePosition = fromPosition;
  let finalTargetPosition = toPosition;

  if (fromNode && toNode) {
    try {
      const params = getEdgeParams(fromNode, toNode);
      sourceX = params.sourceX;
      sourceY = params.sourceY;
      targetX = params.targetX;
      targetY = params.targetY;
      finalSourcePosition = params.sourcePosition;
      finalTargetPosition = params.targetPosition;
    } catch (e) {
      // Fallback to default positions if calculation fails
      console.warn("Failed to calculate floating edge params:", e);
    }
  }

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: finalSourcePosition,
    targetPosition: finalTargetPosition,
  });

  return (
    <g>
      <path
        fill="none"
        stroke="#fff"
        strokeWidth={4}
        className="animated"
        d={edgePath}
      />
      <circle
        cx={targetX}
        cy={targetY}
        fill="#fff"
        r={3}
        stroke="#fff"
        strokeWidth={1.5}
      />
    </g>
  );
}

export default memo(FloatingConnectionLine);
