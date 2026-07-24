import { RoadmapNode, RoadmapEdge, RenderableGraph, CanvasAppearance, defaultCanvasAppearance } from '../types';

export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL';

export function calculateLayout(
  nodes: RoadmapNode[],
  edges: RoadmapEdge[],
  viewportWidth: number,
  canvasAppearance?: CanvasAppearance
): RenderableGraph {
  if (nodes.length === 0) {
    return {
      nodes,
      edges,
      width: 0,
      height: 0,
      minX: 0,
      minY: 0,
      canvasAppearance: canvasAppearance ?? defaultCanvasAppearance,
    };
  }

  // Preferred widths and padding
  const cardWidth = 260; 
  let horizontalGap = 80;
  let verticalGap = 160;

  if (viewportWidth < 768) {
    horizontalGap = 40;
    verticalGap = 120;
  }

  const padding = 80;
  const maxAvailableWidth = (viewportWidth || 1200) - 2 * padding;

  // Set default dimensions and sanitize
  const sanitizedNodes = nodes.map(n => ({
    ...n,
    x: Number(n.x) || 0,
    y: Number(n.y) || 0,
    width: cardWidth,
    height: 140 // max estimated height for layout spacing
  }));

  // 1. Group nodes into levels/rows by their original y coordinate (within 80px tolerance)
  const sortedByY = [...sanitizedNodes].sort((a, b) => a.y - b.y);
  const levels: { originalY: number; nodes: typeof sanitizedNodes }[] = [];

  sortedByY.forEach(node => {
    const closeLevel = levels.find(l => Math.abs(l.originalY - node.y) < 80);
    if (closeLevel) {
      closeLevel.nodes.push(node);
    } else {
      levels.push({ originalY: node.y, nodes: [node] });
    }
  });

  levels.sort((a, b) => a.originalY - b.originalY);
  
  let currentY = 0;
  const layoutedNodes: RoadmapNode[] = [];

  // 2. Reflow nodes row by row
  levels.forEach(lvl => {
    // Sort horizontally by original X to maintain logical left-right hierarchy
    lvl.nodes.sort((a, b) => a.x - b.x);

    const subRows: (typeof sanitizedNodes)[] = [];
    let currentRow: typeof sanitizedNodes = [];
    let currentRowWidth = 0;

    lvl.nodes.forEach(node => {
      const neededWidth = currentRow.length === 0 ? cardWidth : cardWidth + horizontalGap;
      if (currentRowWidth + neededWidth <= maxAvailableWidth || currentRow.length === 0) {
        currentRow.push(node);
        currentRowWidth += neededWidth;
      } else {
        subRows.push(currentRow);
        currentRow = [node];
        currentRowWidth = cardWidth;
      }
    });
    if (currentRow.length > 0) {
      subRows.push(currentRow);
    }

    subRows.forEach(sr => {
      const srWidth = sr.length * cardWidth + (sr.length - 1) * horizontalGap;
      const startX = (maxAvailableWidth - srWidth) / 2;

      sr.forEach((node, idx) => {
        layoutedNodes.push({
          ...node,
          x: startX + idx * (cardWidth + horizontalGap),
          y: currentY
        });
      });

      // Advance Y for the next sub-row/level
      currentY += 140 /* estimated node height */ + verticalGap;
    });
  });

  // 3. Compute graph bounds and zero-align to eliminate massive top/left gaps
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  
  layoutedNodes.forEach(n => {
    minX = Math.min(minX, n.x);
    maxX = Math.max(maxX, n.x + cardWidth);
    minY = Math.min(minY, n.y);
    maxY = Math.max(maxY, n.y + 140);
  });
  
  if (minX === Infinity) minX = 0;
  if (minY === Infinity) minY = 0;

  layoutedNodes.forEach(n => {
    n.x -= minX;
    n.y -= minY;
  });

  const graphWidth = maxX - minX;
  const graphHeight = maxY - minY;

  return {
    nodes: layoutedNodes,
    edges: edges.map(edge => ({ ...edge, points: [] })), // We'll let EdgeRenderer handle precise routing
    width: graphWidth,
    height: graphHeight,
    minX: 0,
    minY: 0,
    canvasAppearance: canvasAppearance ?? defaultCanvasAppearance,
  };
}
