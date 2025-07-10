import { Node, XYPosition } from "reactflow";

// To'rtburchak (Bounding Box) uchun interfeys
interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Ikki nuqta orasidagi chiziq segmenti to'rtburchak bilan kesishadimi yoki yo'qligini tekshiradi.
 * @param p1 Chiziqning boshlang'ich nuqtasi {x, y}
 * @param p2 Chiziqning tugash nuqtasi {x, y}
 * @param rect To'rtburchakning BBox'i {x, y, width, height}
 * @returns Kesishsa `true`, aks holda `false`
 */
function lineIntersectsRect(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  rect: BBox
): boolean {
  // To'rtburchakning chegaralarini aniqlaymiz
  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;

  // Har bir tomon bilan kesishishni tekshirib chiqamiz
  const intersects = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number
  ): boolean => {
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) return false; // Parallel chiziqlar

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  };

  // Har bir tomon bilan tekshirish
  if (intersects(p1.x, p1.y, p2.x, p2.y, left, top, right, top)) return true; // Yuqori tomon
  if (intersects(p1.x, p1.y, p2.x, p2.y, right, top, right, bottom))
    return true; // O'ng tomon
  if (intersects(p1.x, p1.y, p2.x, p2.y, right, bottom, left, bottom))
    return true; // Pastki tomon
  if (intersects(p1.x, p1.y, p2.x, p2.y, left, bottom, left, top)) return true; // Chap tomon

  return false;
}

/**
 * Chiziq yo'lidagi to'siq bo'lgan nodelarni topadi.
 * @param sourcePos - Boshlang'ich nuqta
 * @param targetPos - Manzil nuqtasi
 * @param nodes - Barcha nodelar ro'yxati
 * @param padding - Nodelar atrofidagi xavfsizlik maydoni (bufer)
 * @returns To'siq bo'lgan nodelar massivi
 */
export const getObstacleNodes = (
  sourcePos: XYPosition,
  targetPos: XYPosition,
  nodes: Node[],
  padding = 20 // Xavfsizlik maydonini kattaroq qilamiz
): Node[] => {
  const obstacles: Node[] = [];

  const minX = Math.min(sourcePos.x, targetPos.x);
  const maxX = Math.max(sourcePos.x, targetPos.x);
  const minY = Math.min(sourcePos.y, targetPos.y);
  const maxY = Math.max(sourcePos.y, targetPos.y);

  for (const node of nodes) {
    if (!node.width || !node.height || !node.position) {
      continue;
    }
    const nodeBBox: BBox = {
      x: node.position.x - padding,
      y: node.position.y - padding,
      width: node.width + padding * 2,
      height: node.height + padding * 2,
    };

    // Agar node to'g'ri chiziqning bounding box'i bilan kesishmasa, o'tkazib yuboramiz
    if (
      nodeBBox.x + nodeBBox.width < minX - padding ||
      nodeBBox.x > maxX + padding ||
      nodeBBox.y + nodeBBox.height < minY - padding ||
      nodeBBox.y > maxY + padding
    ) {
      continue;
    }

    // Agar chiziq nodening o'zi bilan kesishsa, uni to'siq deb hisoblaymiz
    if (lineIntersectsRect(sourcePos, targetPos, nodeBBox)) {
      obstacles.push(node);
    }
  }

  return obstacles;
};
