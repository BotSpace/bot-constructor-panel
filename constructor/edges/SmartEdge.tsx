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
  const loopOffset = data?.loopOffset || 80;

  // Sizning node'laringiz uchun maxsus o'lchamlar
  const NODE_WIDTH = 320; // w-80 = 320px
  const NODE_HEIGHT = 200; // Taxminiy balandlik
  const HANDLE_OFFSET = 16; // Handle'ning markazdan masofasi
  const MIN_LOOP_DISTANCE = 60; // Minimal aylanish masofasi

  const getFeedbackLoopPath = () => {
    // Target yuqorida bo'lsa feedback loop kerak
    const needsLoop = targetY < sourceY - 20;

    if (!needsLoop) {
      // Oddiy smooth step path
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

    // Feedback loop yo'lini hisoblash
    const horizontalDistance = Math.abs(targetX - sourceX);
    const verticalDistance = sourceY - targetY;

    // Qaysi tomonga aylanishni aniqlash
    const shouldLoopRight = sourceX <= targetX;
    const loopDirection = shouldLoopRight ? 1 : -1;

    // Aylanish masofasini hisoblash
    const baseOffset = Math.max(
      loopOffset,
      horizontalDistance / 2 + NODE_WIDTH / 2 + MIN_LOOP_DISTANCE
    );
    const sideOffset = baseOffset * loopDirection;

    // Yo'l nuqtalari
    const points = [
      // Source'dan boshlanish (pastki handle)
      { x: sourceX, y: sourceY },
      // Pastga tushish
      { x: sourceX, y: sourceY + 40 },
      // Yon tomonga burilish
      { x: sourceX + sideOffset, y: sourceY + 40 },
      // Target'dan yuqoriga ko'tarilish
      { x: sourceX + sideOffset, y: targetY - 40 },
      // Target tomon burilish
      { x: targetX, y: targetY - 40 },
      // Target'ga kirish (yuqori handle)
      { x: targetX, y: targetY },
    ];

    // Smooth path yaratish
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];

      if (i === points.length - 1) {
        // Oxirgi segment - to'g'ri chiziq
        path += ` L ${current.x} ${current.y}`;
      } else {
        const next = points[i + 1];
        const cornerRadius = 15;

        // Gorizontal yoki vertikal harakat ekanligini aniqlash
        const isHorizontalMove =
          Math.abs(current.x - previous.x) > Math.abs(current.y - previous.y);

        if (isHorizontalMove) {
          // Gorizontal harakat
          const direction = current.x > previous.x ? 1 : -1;
          const cornerStartX = current.x - cornerRadius * direction;

          path += ` L ${cornerStartX} ${previous.y}`;

          if (next) {
            const nextDirection = next.y > current.y ? 1 : -1;
            const cornerEndY = current.y + cornerRadius * nextDirection;
            path += ` Q ${current.x} ${previous.y} ${current.x} ${cornerEndY}`;
          }
        } else {
          // Vertikal harakat
          const direction = current.y > previous.y ? 1 : -1;
          const cornerStartY = current.y - cornerRadius * direction;

          path += ` L ${previous.x} ${cornerStartY}`;

          if (next) {
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
        stroke: "#495057", // Sizning loyihangizga mos rang
        strokeWidth: 1.5,
        ...style,
      }}
    />
  );
}
