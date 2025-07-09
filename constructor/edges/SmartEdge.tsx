"use client";
import { BaseEdge, type EdgeProps, getSmoothStepPath } from "reactflow";

export interface FeedbackLoopEdgeProps extends EdgeProps {
  data?: {
    loopOffset?: number;
  };
}

export default function FeedbackLoopEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: FeedbackLoopEdgeProps) {
  const loopOffset = data?.loopOffset || 100;

  // Calculate the feedback loop path
  const getFeedbackLoopPath = () => {
    // Determine if we need to loop (target is above source)
    const needsLoop = targetY < sourceY;

    if (!needsLoop) {
      // Use standard smooth step path for normal cases
      const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 15,
      });
      return edgePath;
    }

    // Create feedback loop path
    // Determine which side to loop around based on horizontal distance
    const horizontalDistance = Math.abs(targetX - sourceX);
    const shouldLoopRight = sourceX <= targetX;

    // Calculate loop points
    const loopDirection = shouldLoopRight ? 1 : -1;
    const sideOffset = Math.max(loopOffset, horizontalDistance / 2 + 50);

    // Path points for the feedback loop
    const points = [
      // Start at source
      { x: sourceX, y: sourceY },
      // Go down from source
      { x: sourceX, y: sourceY + 30 },
      // Turn horizontally
      { x: sourceX + sideOffset * loopDirection, y: sourceY + 30 },
      // Go up past the target
      { x: sourceX + sideOffset * loopDirection, y: targetY - 30 },
      // Turn toward target
      { x: targetX, y: targetY - 30 },
      // End at target
      { x: targetX, y: targetY },
    ];

    // Create smooth step path manually
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];

      if (i === points.length - 1) {
        // Last segment - straight line to target
        path += ` L ${current.x} ${current.y}`;
      } else {
        // Calculate smooth corners
        const isHorizontal =
          Math.abs(current.x - previous.x) > Math.abs(current.y - previous.y);
        const cornerRadius = 15;

        if (isHorizontal) {
          // Horizontal segment with rounded corner
          const direction = current.x > previous.x ? 1 : -1;
          const cornerStartX = current.x - cornerRadius * direction;

          path += ` L ${cornerStartX} ${previous.y}`;

          if (i < points.length - 1) {
            const next = points[i + 1];
            const nextDirection = next.y > current.y ? 1 : -1;
            const cornerEndY = current.y + cornerRadius * nextDirection;

            path += ` Q ${current.x} ${previous.y} ${current.x} ${cornerEndY}`;
          }
        } else {
          // Vertical segment with rounded corner
          const direction = current.y > previous.y ? 1 : -1;
          const cornerStartY = current.y - cornerRadius * direction;

          path += ` L ${previous.x} ${cornerStartY}`;

          if (i < points.length - 1) {
            const next = points[i + 1];
            const nextDirection = next.x > current.x ? 1 : -1;
            const cornerEndX = current.x + cornerRadius * nextDirection;

            path += ` Q ${previous.x} ${current.y} ${cornerEndX} ${current.y}`;
          }
        }
      }
    }

    return path;
  };

  const edgePath = getFeedbackLoopPath();

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        stroke: "#b1b1b7",
        strokeWidth: 2,
        ...style,
      }}
    />
  );
}
