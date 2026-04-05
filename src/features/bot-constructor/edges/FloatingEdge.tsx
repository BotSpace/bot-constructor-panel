"use client";
import { memo } from "react";
import {
    BaseEdge,
    type EdgeProps,
    Position,
    getBezierPath,
    useNodes,
    EdgeLabelRenderer,
} from "reactflow";
import { useEdgeColor } from "./useEdgeColor";

/**
 * FloatingEdge - Enhanced edge with dynamic routing, colors and animations
 *
 * Features:
 * - Color-coded by handle type (success=green, error=red, default=blue)
 * - Animated flow indicator
 * - Edge labels for handle names
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
    sourceHandleId,
    markerEnd,
    style = {},
    selected,
    label,
}: EdgeProps) {
    const nodes = useNodes();
    const { stroke: edgeColor, selectedStroke } = useEdgeColor(sourceHandleId);

    // Get target node name for label
    const targetNodeTitle = targetNode?.data?.title || targetNode?.type?.replace('Node', '') || 'Node';
    const sourceNode = nodes.find((node) => node.id === source);

    // Dynamically determine direction based on node positions
    let dynSourcePos = sourcePosition;
    let dynTargetPos = targetPosition;
    let dynSourceX = sourceX;
    let dynTargetX = targetX;
    let dynTargetY = targetY;

    if (sourceNode && targetNode) {
        const sourceWidth = sourceNode.width || 150;
        const targetWidth = targetNode.width || 150;
        const targetHeight = targetNode.height || 100;

        const sourceCenterX = sourceNode.position.x + sourceWidth / 2;
        const targetCenterX = targetNode.position.x + targetWidth / 2;

        // Source chiqish faqat o'ng yoki chap
        if (targetCenterX >= sourceCenterX) {
            dynSourcePos = Position.Right;
            dynSourceX = sourceNode.position.x + sourceWidth;
        } else {
            dynSourcePos = Position.Left;
            dynSourceX = sourceNode.position.x;
        }

        // Target kirish - 4 tomondan eng yaqinini tanlash
        const sourceExitX = dynSourceX;
        const sourceExitY = sourceY;

        const targetCenterY = targetNode.position.y + targetHeight / 2;

        // 4 ta kirish nuqtasi
        const candidates: {
            pos: Position;
            x: number;
            y: number;
        }[] = [
                {
                    pos: Position.Left,
                    x: targetNode.position.x,
                    y: targetCenterY,
                },
                {
                    pos: Position.Right,
                    x: targetNode.position.x + targetWidth,
                    y: targetCenterY,
                },
                {
                    pos: Position.Top,
                    x: targetCenterX,
                    y: targetNode.position.y,
                },
                {
                    pos: Position.Bottom,
                    x: targetCenterX,
                    y: targetNode.position.y + targetHeight,
                },
            ];

        // Eng yaqin kirish nuqtasini topish
        let minDist = Infinity;
        for (const c of candidates) {
            const dist = Math.hypot(c.x - sourceExitX, c.y - sourceExitY);
            if (dist < minDist) {
                minDist = dist;
                dynTargetPos = c.pos;
                dynTargetX = c.x;
                dynTargetY = c.y;
            }
        }
    }

    // Use Bezier path with dynamic positions
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX: dynSourceX,
        sourceY,
        targetX: dynTargetX,
        targetY: dynTargetY,
        sourcePosition: dynSourcePos,
        targetPosition: dynTargetPos,
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

    // Get label from handle ID
    const handleLabel = sourceHandleId?.replace(/[-_]/g, " ").toUpperCase();

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

export default memo(FloatingEdge);
