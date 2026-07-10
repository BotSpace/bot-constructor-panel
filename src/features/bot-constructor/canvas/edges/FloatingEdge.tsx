"use client";
import { memo, useState, useCallback } from "react";
import {
    BaseEdge,
    type EdgeProps,
    Position,
    getBezierPath,
    useStore,
    EdgeLabelRenderer,
} from "reactflow";
import { useEdgeColor } from "@/features/bot-constructor/canvas/edges/useEdgeColor";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Trash2, Plus } from "lucide-react";

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
    targetHandleId,
    style = {},
    selected,
    label,
}: Omit<EdgeProps, "markerEnd">) {
    // Subscribe to ONLY the target node (via React Flow's store), not the whole
    // node array. useNodes() returns a fresh array on every store change — incl.
    // viewport/zoom — which re-rendered every edge on each zoom frame and froze
    // the canvas for seconds on larger flows. nodeInternals.get(target) is a
    // stable reference that changes only when THAT node moves/resizes, so edges
    // no longer re-render on zoom/pan.
    const targetNode = useStore(useCallback((s) => s.nodeInternals.get(target), [target]));
    const { stroke: defaultColor, selectedStroke, neutralStroke } = useEdgeColor(sourceHandleId);
    // Targeted selectors — the whole-store useFlowStore() subscription re-rendered
    // every edge on any store change. These action refs are stable.
    const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
    const setPendingEdgeInsert = useFlowStore((s) => s.setPendingEdgeInsert);
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
    // Accessory edges (tool/provider → AI agent) should use the neutral edge
    // color instead of the handle-type color so they blend with regular edges.
    const isAccessoryEdgeCheck = typeof targetHandleId === "string" && targetHandleId.startsWith("acc:");
    // Prefer edge's own style.stroke (e.g. orange for edit-message) over computed color
    const edgeColor = isAccessoryEdgeCheck
      ? neutralStroke
      : (style as any)?.stroke || defaultColor;

    // targetNode (above) drives entry-side geometry and the fallback label.

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
            {/* Invisible wide hover area on the path */}
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

            {/* Edge name label — shown only when selected and buttons hidden */}
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

export default memo(FloatingEdge);
