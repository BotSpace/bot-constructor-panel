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
    source: _source,
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
    selected,
    label,
}: Omit<EdgeProps, "markerEnd">) {
    const nodes = useNodes();
    const { stroke: defaultColor, selectedStroke } = useEdgeColor(sourceHandleId);
    // Prefer edge's own style.stroke (e.g. orange for edit-message) over computed color
    const edgeColor = (style as any)?.stroke || defaultColor;

    // Find target node for entry-side selection and label
    const targetNode = nodes.find((node) => node.id === target);

    // Get target node name for label
    const targetNodeTitle = (targetNode?.data as any)?.title || targetNode?.type?.replace('Node', '') || 'Node';

    // Use the exact handle coordinates that React Flow provides.
    // sourceX/sourceY already point to the actual handle (the "+" pill) because
    // React Flow computes them from the DOM-measured handle centre.  Do not
    // override them with the node-body edge – that caused edges to detach from
    // the "+" marker visually.
    //
    // For accessory edges (targetHandleId starts with "acc:"), React Flow already
    // measured the exact port handle position — use targetX/targetY directly so
    // the edge terminates at the specific Model/Tools port rather than a
    // floating face-centre on the AI Agent node.
    //
    // For all other edges we still pick the best entry side (closest face) for a
    // clean floating connection.
    let dynSourcePos = sourcePosition;
    let dynTargetPos = targetPosition;
    let dynTargetX = targetX;
    let dynTargetY = targetY;

    const isAccessoryEdge = typeof targetHandleId === "string" && targetHandleId.startsWith("acc:");

    if (!isAccessoryEdge && targetNode) {
        const targetHeight = targetNode.height || 100;
        const targetCenterY = targetNode.position.y + targetHeight / 2;

        // TargetHandles always renders on Position.Left (id="target-handler").
        // Fix the entry side to Left so all edges — AI-generated and manually
        // drawn — arrive from the same side, matching the actual handle position.
        dynTargetPos = Position.Left;
        dynTargetX = targetNode.position.x;
        dynTargetY = targetCenterY;
    }

    // Use Bezier path with dynamic positions
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
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

    // Get label from handle ID
    const handleLabel = sourceHandleId?.replace(/[-_]/g, " ").toUpperCase();

    return (
        <>
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

            {/* Main Edge path — no arrowhead on any edge type */}
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={undefined}
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
