/**
 * Smart Edge Path Calculation Utilities
 *
 * Pure functions for computing edge paths with smart routing,
 * collision avoidance, and anchor point optimization.
 */

import { Node, Position, XYPosition, getSmoothStepPath } from "reactflow";

// Types
export interface PathPoint extends XYPosition {
  type?: "source" | "target" | "waypoint";
}

export interface EdgePathConfig {
  sourcePos: XYPosition;
  targetPos: XYPosition;
  sourceNode?: Node;
  targetNode?: Node;
  sourcePosition: Position;
  targetPosition: Position;
  obstacles: Node[];
  borderRadius?: number;
  padding?: number;
}

export interface BezierPath {
  path: string;
  controlPoints: XYPosition[];
}

/**
 * Calculate the nearest logical anchor point on a node
 * Returns the actual connection point (x, y) on the node boundary
 */
export function getNearestAnchorPoint(
  node: Node,
  targetPoint: XYPosition,
  handlePosition?: Position
): XYPosition {
  if (!node.width || !node.height) {
    return { x: node.position.x, y: node.position.y };
  }

  const centerX = node.position.x + node.width / 2;
  const centerY = node.position.y + node.height / 2;

  // If handle position is specified, use it
  if (handlePosition) {
    switch (handlePosition) {
      case Position.Top:
        return { x: centerX, y: node.position.y };
      case Position.Bottom:
        return { x: centerX, y: node.position.y + node.height };
      case Position.Left:
        return { x: node.position.x, y: centerY };
      case Position.Right:
        return { x: node.position.x + node.width, y: centerY };
      default:
        return { x: centerX, y: centerY };
    }
  }

  // Calculate which side is closest to target point
  const dx = targetPoint.x - centerX;
  const dy = targetPoint.y - centerY;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Determine which edge is closest
  if (absDx > absDy) {
    // Horizontal edge is closer
    return {
      x: dx > 0 ? node.position.x + node.width : node.position.x,
      y: centerY,
    };
  } else {
    // Vertical edge is closer
    return {
      x: centerX,
      y: dy > 0 ? node.position.y + node.height : node.position.y,
    };
  }
}

/**
 * Check if two nodes are roughly aligned (for orthogonal routing)
 */
function areNodesAligned(
  sourcePos: XYPosition,
  targetPos: XYPosition,
  threshold = 30
): { horizontal: boolean; vertical: boolean } {
  const horizontal = Math.abs(sourcePos.y - targetPos.y) < threshold;
  const vertical = Math.abs(sourcePos.x - targetPos.x) < threshold;
  return { horizontal, vertical };
}

/**
 * Compute orthogonal (L-shaped or Z-shaped) path
 * Uses React Flow's getSmoothStepPath for optimal routing
 */
export function computeOrthogonalPath(config: EdgePathConfig): string {
  const {
    sourcePos,
    targetPos,
    sourcePosition,
    targetPosition,
    borderRadius = 15,
  } = config;

  // Use React Flow's built-in smooth step path for optimal orthogonal routing
  const [path] = getSmoothStepPath({
    sourceX: sourcePos.x,
    sourceY: sourcePos.y,
    targetX: targetPos.x,
    targetY: targetPos.y,
    sourcePosition: sourcePosition || Position.Bottom,
    targetPosition: targetPosition || Position.Top,
    borderRadius,
  });

  return path;
}

/**
 * Compute smooth Bezier curve path
 * Uses quadratic Bezier for smooth curves
 */
export function computeBezierPath(config: EdgePathConfig): BezierPath {
  const { sourcePos, targetPos } = config;

  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;

  // Control points for smooth curve
  const controlPoint1: XYPosition = {
    x: sourcePos.x + dx * 0.5,
    y: sourcePos.y,
  };

  const controlPoint2: XYPosition = {
    x: targetPos.x - dx * 0.5,
    y: targetPos.y,
  };

  // Use quadratic Bezier for simplicity and smoothness
  const midX = (sourcePos.x + targetPos.x) / 2;
  const midY = (sourcePos.y + targetPos.y) / 2;

  // Control point at midpoint, offset for curve
  const controlPoint: XYPosition = {
    x: midX,
    y: Math.min(sourcePos.y, targetPos.y) - Math.abs(dy) * 0.3,
  };

  const path = [
    `M ${sourcePos.x} ${sourcePos.y}`,
    `Q ${controlPoint.x} ${controlPoint.y}, ${targetPos.x} ${targetPos.y}`,
  ].join(" ");

  return {
    path,
    controlPoints: [controlPoint],
  };
}

/**
 * Check if a straight line intersects with any obstacle nodes
 */
function lineIntersectsNode(
  p1: XYPosition,
  p2: XYPosition,
  node: Node,
  padding = 10
): boolean {
  if (!node.width || !node.height) return false;

  const nodeBox = {
    x: node.position.x - padding,
    y: node.position.y - padding,
    width: node.width + padding * 2,
    height: node.height + padding * 2,
  };

  // Line-rectangle intersection test
  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);

  // Quick bounding box check
  if (
    maxX < nodeBox.x ||
    minX > nodeBox.x + nodeBox.width ||
    maxY < nodeBox.y ||
    minY > nodeBox.y + nodeBox.height
  ) {
    return false;
  }

  // More detailed intersection test
  const lineSlope = (p2.y - p1.y) / (p2.x - p1.x);
  const lineIntercept = p1.y - lineSlope * p1.x;

  // Check if line intersects any edge of the rectangle
  const edges = [
    {
      p1: { x: nodeBox.x, y: nodeBox.y },
      p2: { x: nodeBox.x + nodeBox.width, y: nodeBox.y },
    }, // top
    {
      p1: { x: nodeBox.x + nodeBox.width, y: nodeBox.y },
      p2: { x: nodeBox.x + nodeBox.width, y: nodeBox.y + nodeBox.height },
    }, // right
    {
      p1: { x: nodeBox.x + nodeBox.width, y: nodeBox.y + nodeBox.height },
      p2: { x: nodeBox.x, y: nodeBox.y + nodeBox.height },
    }, // bottom
    {
      p1: { x: nodeBox.x, y: nodeBox.y + nodeBox.height },
      p2: { x: nodeBox.x, y: nodeBox.y },
    }, // left
  ];

  for (const edge of edges) {
    if (linesIntersect(p1, p2, edge.p1, edge.p2)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if two line segments intersect
 */
function linesIntersect(
  p1: XYPosition,
  p2: XYPosition,
  p3: XYPosition,
  p4: XYPosition
): boolean {
  const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (denom === 0) return false; // Parallel lines

  const ua =
    ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
  const ub =
    ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

/**
 * Avoid node collisions by rerouting path
 * Creates a clean bypass around obstacles
 */
export function avoidNodeCollision(
  path: string,
  sourcePos: XYPosition,
  targetPos: XYPosition,
  obstacles: Node[],
  padding = 20
): string {
  // Check if straight line has collisions
  const hasCollision = obstacles.some((node) =>
    lineIntersectsNode(sourcePos, targetPos, node, padding)
  );

  if (!hasCollision) {
    return path; // No collision, return original path
  }

  // Find the first obstacle
  const firstObstacle = obstacles.find((node) =>
    lineIntersectsNode(sourcePos, targetPos, node, padding)
  );

  if (!firstObstacle || !firstObstacle.width || !firstObstacle.height) {
    return path;
  }

  // Calculate bypass route
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;

  // Determine bypass direction (prefer shorter route)
  const obstacleCenterX = firstObstacle.position.x + firstObstacle.width / 2;
  const obstacleCenterY = firstObstacle.position.y + firstObstacle.height / 2;

  const sourceToObstacleDx = obstacleCenterX - sourcePos.x;
  const sourceToObstacleDy = obstacleCenterY - sourcePos.y;

  // Choose bypass side based on which is shorter
  const bypassRight =
    Math.abs(sourceToObstacleDx) > Math.abs(sourceToObstacleDy)
      ? sourceToObstacleDx > 0
      : sourceToObstacleDy > 0;

  // Calculate waypoint around obstacle
  let waypoint: XYPosition;

  if (bypassRight) {
    // Bypass to the right
    waypoint = {
      x: firstObstacle.position.x + firstObstacle.width + padding,
      y: (sourcePos.y + targetPos.y) / 2,
    };
  } else {
    // Bypass to the left
    waypoint = {
      x: firstObstacle.position.x - padding,
      y: (sourcePos.y + targetPos.y) / 2,
    };
  }

  // Create path with waypoint
  const borderRadius = 15;
  return [
    `M ${sourcePos.x} ${sourcePos.y}`,
    `L ${waypoint.x - borderRadius} ${sourcePos.y}`,
    `Q ${waypoint.x} ${sourcePos.y}, ${waypoint.x} ${
      sourcePos.y + borderRadius
    }`,
    `L ${waypoint.x} ${waypoint.y - borderRadius}`,
    `Q ${waypoint.x} ${waypoint.y}, ${waypoint.x + borderRadius} ${waypoint.y}`,
    `L ${targetPos.x - borderRadius} ${targetPos.y}`,
    `Q ${targetPos.x} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`,
    `L ${targetPos.x} ${targetPos.y}`,
  ].join(" ");
}

/**
 * Calculate midpoint of a path for label placement
 */
export function getPathMidpoint(
  sourcePos: XYPosition,
  targetPos: XYPosition,
  pathType: "orthogonal" | "bezier" = "orthogonal"
): XYPosition {
  if (pathType === "orthogonal") {
    // For orthogonal paths, use geometric midpoint
    return {
      x: (sourcePos.x + targetPos.x) / 2,
      y: (sourcePos.y + targetPos.y) / 2,
    };
  } else {
    // For bezier, approximate midpoint
    return {
      x: (sourcePos.x + targetPos.x) / 2,
      y: (sourcePos.y + targetPos.y) / 2,
    };
  }
}

/**
 * Calculate rotation angle for label text
 */
export function getLabelRotation(
  sourcePos: XYPosition,
  targetPos: XYPosition
): number {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Ensure text is not upside down
  return angle > 90 || angle < -90 ? angle + 180 : angle;
}
