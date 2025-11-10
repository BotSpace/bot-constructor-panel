"use client";
import { memo, useMemo } from "react";
import { BaseEdge, type EdgeProps, useNodes, Position } from "reactflow";
import {
  computeOrthogonalPath,
  computeBezierPath,
  avoidNodeCollision,
  getNearestAnchorPoint,
  getPathMidpoint,
  getLabelRotation,
  type EdgePathConfig,
} from "../lib/edge-utils";
import { getObstacleNodes } from "../lib/geometry";

export interface SmartEdgeProps extends EdgeProps {
  data?: {
    label?: string;
    showArrowStart?: boolean;
    showArrowEnd?: boolean;
    strokeDasharray?: string;
    // Custom anchor points (if manually adjusted)
    sourceAnchor?: { x: number; y: number };
    targetAnchor?: { x: number; y: number };
  };
}

/**
 * SmartEdge - Miro-like intelligent edge routing
 *
 * Features:
 * - Smart routing: orthogonal for aligned nodes, bezier for others
 * - Automatic anchor point optimization
 * - Collision avoidance with obstacle nodes
 * - Optional label placement at midpoint
 * - Customizable arrow styles
 * - Performance optimized with memoization
 */
function SmartEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  markerStart,
  selected,
  data,
  label,
  labelStyle,
  labelShowBg,
  labelBgStyle,
}: SmartEdgeProps) {
  const nodes = useNodes();

  // Get source and target nodes for anchor calculation
  const sourceNode = useMemo(
    () => nodes.find((n) => n.id === source),
    [nodes, source]
  );
  const targetNode = useMemo(
    () => nodes.find((n) => n.id === target),
    [nodes, target]
  );

  // Calculate optimal anchor points
  const sourceAnchor = useMemo(() => {
    if (data?.sourceAnchor) {
      return data.sourceAnchor;
    }
    if (sourceNode) {
      return getNearestAnchorPoint(
        sourceNode,
        { x: targetX, y: targetY },
        sourcePosition
      );
    }
    return { x: sourceX, y: sourceY };
  }, [sourceNode, sourceX, sourceY, targetX, targetY, sourcePosition, data]);

  const targetAnchor = useMemo(() => {
    if (data?.targetAnchor) {
      return data.targetAnchor;
    }
    if (targetNode) {
      return getNearestAnchorPoint(
        targetNode,
        { x: sourceX, y: sourceY },
        targetPosition
      );
    }
    return { x: targetX, y: targetY };
  }, [targetNode, sourceX, sourceY, targetX, targetY, targetPosition, data]);

  // Get obstacle nodes
  const obstacles = useMemo(() => {
    const potentialObstacles = nodes.filter(
      (n) => n.id !== source && n.id !== target
    );
    return getObstacleNodes(sourceAnchor, targetAnchor, potentialObstacles);
  }, [nodes, source, target, sourceAnchor, targetAnchor]);

  // Determine routing strategy
  const routingStrategy = useMemo<"orthogonal" | "bezier">(() => {
    const dx = Math.abs(targetAnchor.x - sourceAnchor.x);
    const dy = Math.abs(targetAnchor.y - sourceAnchor.y);
    const alignmentThreshold = 50;

    // Use orthogonal for roughly aligned nodes
    if (
      Math.abs(dx) < alignmentThreshold ||
      Math.abs(dy) < alignmentThreshold
    ) {
      return "orthogonal";
    }

    // Use bezier for non-aligned nodes
    return "bezier";
  }, [sourceAnchor, targetAnchor]);

  // Compute path
  const pathConfig: EdgePathConfig = useMemo(
    () => ({
      sourcePos: sourceAnchor,
      targetPos: targetAnchor,
      sourceNode: sourceNode,
      targetNode: targetNode,
      sourcePosition: sourcePosition || Position.Bottom,
      targetPosition: targetPosition || Position.Top,
      obstacles,
      borderRadius: 15,
      padding: 20,
    }),
    [
      sourceAnchor,
      targetAnchor,
      sourceNode,
      targetNode,
      sourcePosition,
      targetPosition,
      obstacles,
    ]
  );

  const rawPath = useMemo(() => {
    if (routingStrategy === "orthogonal") {
      return computeOrthogonalPath(pathConfig);
    } else {
      return computeBezierPath(pathConfig).path;
    }
  }, [routingStrategy, pathConfig]);

  // Apply collision avoidance
  const edgePath = useMemo(() => {
    if (obstacles.length > 0) {
      return avoidNodeCollision(rawPath, sourceAnchor, targetAnchor, obstacles);
    }
    return rawPath;
  }, [rawPath, sourceAnchor, targetAnchor, obstacles]);

  // Calculate label position
  const labelPosition = useMemo(() => {
    return getPathMidpoint(sourceAnchor, targetAnchor, routingStrategy);
  }, [sourceAnchor, targetAnchor, routingStrategy]);

  const labelRotation = useMemo(() => {
    return getLabelRotation(sourceAnchor, targetAnchor);
  }, [sourceAnchor, targetAnchor]);

  // Edge styling
  const originalStroke = (style as any)?.stroke || "#495057";
  const strokeWidth = (style as any)?.strokeWidth || 1.5;
  const strokeDasharray =
    data?.strokeDasharray || (style as any)?.strokeDasharray;

  const selectedStyle = {
    stroke: "#3b82f6",
    strokeWidth: 2.5,
  };

  const defaultStyle = {
    stroke: originalStroke,
    strokeWidth,
    strokeDasharray,
  };

  const dynamicStyle = selected ? selectedStyle : defaultStyle;

  // Arrow markers
  const showArrowStart = data?.showArrowStart ?? false;
  const showArrowEnd = data?.showArrowEnd ?? true;
  const markerColor = selected ? "#3b82f6" : originalStroke;

  // Determine which label to show (data.label takes precedence)
  const displayLabel = data?.label || label;

  return (
    <>
      {/* Arrow markers */}
      {showArrowEnd && (
        <marker
          id={`arrowhead-end-${id}`}
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

      {showArrowStart && (
        <marker
          id={`arrowhead-start-${id}`}
          viewBox="0 0 10 10"
          refX="1"
          refY="5"
          markerUnits="strokeWidth"
          markerWidth="10"
          markerHeight="8"
          orient="auto"
        >
          <path d="M 10 0 L 0 5 L 10 10 z" fill={markerColor} stroke="none" />
        </marker>
      )}

      {/* Edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={showArrowEnd ? `url(#arrowhead-end-${id})` : undefined}
        markerStart={showArrowStart ? `url(#arrowhead-start-${id})` : undefined}
        style={{
          ...dynamicStyle,
          ...style,
          // Ensure stroke doesn't scale with zoom
          vectorEffect: "non-scaling-stroke" as any,
          transition:
            "stroke-width 0.15s ease-in-out, stroke 0.15s ease-in-out",
        }}
      />

      {/* Label */}
      {displayLabel && (
        <g transform={`translate(${labelPosition.x}, ${labelPosition.y})`}>
          {labelShowBg && (
            <rect
              x={-20}
              y={-10}
              width={40}
              height={16}
              fill="white"
              fillOpacity={0.8}
              stroke="none"
              rx={4}
              style={labelBgStyle}
            />
          )}
          <text
            x={0}
            y={-8}
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${labelRotation})`}
            style={{
              fontSize: 12,
              fill: "#374151",
              pointerEvents: "none",
              userSelect: "none",
              ...labelStyle,
            }}
            className="react-flow__edge-text"
          >
            <tspan>{displayLabel}</tspan>
          </text>
        </g>
      )}
    </>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(SmartEdge);
