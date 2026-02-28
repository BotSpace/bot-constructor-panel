import { Node, Position, XYPosition } from "reactflow";

/**
 * Get edge parameters (source and target positions) from nodes
 * This calculates the optimal connection points on the node boundaries
 */
export function getEdgeParams(source: Node, target: Node) {
  // Default dimensions if not available (fallback)
  const sourceWidth = source.width || 150;
  const sourceHeight = source.height || 100;
  const targetWidth = target.width || 150;
  const targetHeight = target.height || 100;

  const sourcePos = getNodePosition(source, sourceWidth, sourceHeight);
  const targetPos = getNodePosition(target, targetWidth, targetHeight);

  // Calculate the direction
  const dx = targetPos.x - sourcePos.x;

  // Source chiqish faqat o'ng yoki chap
  const sourcePosition: Position = dx >= 0 ? Position.Right : Position.Left;

  const sourceX =
    sourcePos.x + (sourcePosition === Position.Right ? sourceWidth / 2 : -sourceWidth / 2);
  const sourceY = sourcePos.y;

  // Target kirish - 4 tomondan eng yaqinini tanlash
  const candidates: { pos: Position; x: number; y: number }[] = [
    { pos: Position.Left, x: targetPos.x - targetWidth / 2, y: targetPos.y },
    { pos: Position.Right, x: targetPos.x + targetWidth / 2, y: targetPos.y },
    { pos: Position.Top, x: targetPos.x, y: targetPos.y - targetHeight / 2 },
    { pos: Position.Bottom, x: targetPos.x, y: targetPos.y + targetHeight / 2 },
  ];

  let targetPosition: Position = Position.Left;
  let targetX = candidates[0].x;
  let targetY = candidates[0].y;
  let minDist = Infinity;

  for (const c of candidates) {
    const dist = Math.hypot(c.x - sourceX, c.y - sourceY);
    if (dist < minDist) {
      minDist = dist;
      targetPosition = c.pos;
      targetX = c.x;
      targetY = c.y;
    }
  }

  return {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  };
}

/**
 * Get the center position of a node
 */
function getNodePosition(
  node: Node,
  width: number,
  height: number
): XYPosition {
  return {
    x: node.position.x + width / 2,
    y: node.position.y + height / 2,
  };
}
