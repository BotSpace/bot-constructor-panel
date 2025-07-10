"use client";
import {
  BaseEdge,
  type EdgeProps,
  getSmoothStepPath,
  useNodes,
} from "reactflow";
import { getObstacleNodes } from "../lib/geometry";

import { EdgeContextMenu } from "./components/EdgeContextMenu";

export interface SmartEdgeProps extends EdgeProps {
  data?: {
    // Kelajakda qo'shimcha sozlamalar uchun
  };
}

export default function SmartEdge({
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
  selected,
}: SmartEdgeProps) {
  const nodes = useNodes();

  const getPath = (): string => {
    // 1. To'siqlarni aniqlash
    const potentialObstacles = nodes.filter(
      (n) => n.id !== source && n.id !== target
    );
    const obstacles = getObstacleNodes(
      { x: sourceX, y: sourceY },
      { x: targetX, y: targetY },
      potentialObstacles
    );

    // 2. Aylanma yo'l kerakmi?
    const needsLoop = targetY < sourceY - 20 || obstacles.length > 0;

    if (!needsLoop) {
      // Yo'l toza bo'lsa, standart silliq chiziq
      const [path] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 15,
      });
      return path;
    }

    // --- MUKAMMALLASHTIRILGAN, ANIQ VA SILLIQ AYLANMA YO'L CHIZISH ALGORITMI ---
    const verticalMargin = 40;
    const cornerRadius = 15;

    // Asosiy nuqtalarni va yo'nalishlarni hisoblash
    const sourceNode = nodes.find((n) => n.id === source);
    const targetNode = nodes.find((n) => n.id === target);

    // Qaysi tomondan aylanib o'tish
    const loopDirection = targetX >= sourceX ? 1 : -1;

    // Aylanib o'tish yo'lagining X koordinatasi
    let laneX: number;
    if (loopDirection === 1) {
      // O'ngdan
      const sourceRight = sourceNode
        ? sourceNode.position.x + (sourceNode.width || 0)
        : sourceX;
      const targetRight = targetNode
        ? targetNode.position.x + (targetNode.width || 0)
        : targetX;
      laneX = Math.max(sourceRight, targetRight) + 60;
    } else {
      // Chapdan
      const sourceLeft = sourceNode ? sourceNode.position.x : sourceX;
      const targetLeft = targetNode ? targetNode.position.x : targetX;
      laneX = Math.min(sourceLeft, targetLeft) - 60;
    }

    // Yo'lning burilish nuqtalari
    const p1 = { x: sourceX, y: sourceY + verticalMargin };
    const p2 = { x: laneX, y: p1.y };
    const p3 = { x: laneX, y: targetY - verticalMargin };
    const p4 = { x: targetX, y: p3.y };

    // Har bir segment uchun aniq yo'nalishlarni hisoblash
    const vDir1 = Math.sign(p2.y - p1.y); // Bu deyarli har doim 0, lekin qoldiramiz
    const hDir1 = Math.sign(p2.x - p1.x); // Bu loopDirection bilan bir xil

    const vDir2 = Math.sign(p3.y - p2.y); // Bu eng muhim vertikal yo'nalish
    const hDir2 = Math.sign(p4.x - p3.x); // Bu -loopDirection bilan bir xil

    const vDir3 = Math.sign(targetY - p4.y); // Bu har doim +1

    // SVG path stringini qismlab, ehtiyotkorlik bilan yig'amiz
    return [
      `M ${sourceX} ${sourceY}`, // Boshlang'ich nuqta
      `V ${p1.y - cornerRadius * vDir1}`, // 1-burilishgacha vertikal harakat
      `Q ${p1.x} ${p1.y}, ${p1.x + cornerRadius * hDir1} ${p1.y}`, // 1-burilish (silliq)
      `H ${p2.x - cornerRadius * hDir1}`, // 2-burilishgacha gorizontal harakat
      `Q ${p2.x} ${p2.y}, ${p2.x} ${p2.y + cornerRadius * vDir2}`, // 2-burilish
      `V ${p3.y - cornerRadius * vDir2}`, // 3-burilishgacha vertikal harakat
      `Q ${p3.x} ${p3.y}, ${p3.x + cornerRadius * hDir2} ${p3.y}`, // 3-burilish
      `H ${p4.x - cornerRadius * hDir2}`, // 4-burilishgacha gorizontal harakat
      `Q ${p4.x} ${p4.y}, ${p4.x} ${p4.y + cornerRadius * vDir3}`, // 4-burilish
      `V ${targetY}`, // Manzilga yetib borish
    ].join(" ");
  };

  const edgePath = getPath();

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        stroke: "#495057",
        strokeWidth: 1.5,
        ...style,
      }}
    />
  );
}
