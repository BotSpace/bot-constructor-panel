"use client";
import { memo } from "react";
import {
    BaseEdge,
    type EdgeProps,
    Position,
    getBezierPath,
    useNodes,
} from "reactflow";

/**
 * FloatingEdge - Edge that dynamically exits from left or right
 * based on relative positions of source and target nodes
 *
 * Features:
 * - Dynamically determines exit/entry side (left or right)
 * - Uses handle Y positions from ReactFlow (edges come out of buttons/handles)
 * - Uses Bezier curves for smooth connections
 * - Shows visual feedback when selected
 */
function FloatingEdge({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    style = {},
    selected,
}: EdgeProps) {
    const nodes = useNodes();

    // Find source and target nodes for dynamic direction
    const sourceNode = nodes.find((node) => node.id === source);
    const targetNode = nodes.find((node) => node.id === target);

    // Dynamically determine direction based on node positions
    let dynSourcePos = sourcePosition;
    let dynTargetPos = targetPosition;
    let dynSourceX = sourceX;
    let dynTargetX = targetX;

    if (sourceNode && targetNode) {
        const sourceWidth = sourceNode.width || 150;
        const targetWidth = targetNode.width || 150;

        const sourceCenterX = sourceNode.position.x + sourceWidth / 2;
        const targetCenterX = targetNode.position.x + targetWidth / 2;

        if (targetCenterX >= sourceCenterX) {
            // Target o'ngda → source o'ngdan chiqadi, target chapdan kiradi
            dynSourcePos = Position.Right;
            dynTargetPos = Position.Left;
            dynSourceX = sourceNode.position.x + sourceWidth;
            dynTargetX = targetNode.position.x;
        } else {
            // Target chapda → source chapdan chiqadi, target o'ngdan kiradi
            dynSourcePos = Position.Left;
            dynTargetPos = Position.Right;
            dynSourceX = sourceNode.position.x;
            dynTargetX = targetNode.position.x + targetWidth;
        }
    }

    // Use Bezier path with dynamic positions
    const [edgePath] = getBezierPath({
        sourceX: dynSourceX,
        sourceY,
        targetX: dynTargetX,
        targetY,
        sourcePosition: dynSourcePos,
        targetPosition: dynTargetPos,
    });

    // Get original style values
    const originalStroke = "#fff";
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
