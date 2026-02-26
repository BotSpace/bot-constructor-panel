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

  // Calculate the direction and optimal connection points
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;

  // Determine source position based on relative node positions
  let sourcePosition: Position;
  let targetPosition: Position;

  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal alignment
    sourcePosition = dx > 0 ? Position.Right : Position.Left;
    targetPosition = dx > 0 ? Position.Left : Position.Right;
  } else {
    // Vertical alignment
    sourcePosition = dy > 0 ? Position.Bottom : Position.Top;
    targetPosition = dy > 0 ? Position.Top : Position.Bottom;
  }

  const sourceX =
    sourcePos.x +
    (sourcePosition === Position.Right
      ? sourceWidth / 2
      : sourcePosition === Position.Left
        ? -sourceWidth / 2
        : 0);
  const sourceY =
    sourcePos.y +
    (sourcePosition === Position.Bottom
      ? sourceHeight / 2
      : sourcePosition === Position.Top
        ? -sourceHeight / 2
        : 0);

  const targetX =
    targetPos.x +
    (targetPosition === Position.Right
      ? targetWidth / 2
      : targetPosition === Position.Left
        ? -targetWidth / 2
        : 0);
  const targetY =
    targetPos.y +
    (targetPosition === Position.Bottom
      ? targetHeight / 2
      : targetPosition === Position.Top
        ? -targetHeight / 2
        : 0);

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
