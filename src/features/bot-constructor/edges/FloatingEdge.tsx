"use client";
import { memo } from "react";
import {
    BaseEdge,
    type EdgeProps,
    getBezierPath,
    useNodes,
} from "reactflow";
import { getEdgeParams } from "./utils";

/**
 * FloatingEdge - Edge that dynamically calculates connection points
 * based on node positions rather than fixed handles
 *
 * Features:
 * - Automatically calculates optimal connection points on nodes
 * - Uses Bezier curves for smooth connections
 * - Shows visual feedback when selected
 */
function FloatingEdge({
    id,
    source,
    target,
    markerEnd,
    style = {},
    selected,
}: EdgeProps) {
    const nodes = useNodes();

    // Find source and target nodes
    const sourceNode = nodes.find((node) => node.id === source);
    const targetNode = nodes.find((node) => node.id === target);

    // If nodes are not found, return null (edge won't render)
    if (!sourceNode || !targetNode) {
        return null;
    }

    // Get edge positions from nodes
    const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } =
        getEdgeParams(sourceNode, targetNode);

    // Use Bezier path for floating edges
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    // Get original style values
    const originalStroke = (style as any)?.stroke || "#fff";
    const originalStrokeWidth = (style as any)?.strokeWidth || 4;

    // Selected state styling - more visible
    const selectedStyle = {
        stroke: "#3b82f6", // Blue color when selected
        strokeWidth: 5, // Thicker when selected
    };

    // Default style
    const defaultStyle = {
        stroke: originalStroke,
        strokeWidth: originalStrokeWidth,
    };

    // Apply selected style if edge is selected
    const dynamicStyle = selected ? selectedStyle : defaultStyle;

    // Marker color also changes when selected
    const markerColor = selected ? "#3b82f6" : originalStroke;

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

export default memo(FloatingEdge);
