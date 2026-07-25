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

  const cardWidth = 280;
  const cardHeight = 120;

  // Check if ALL nodes have valid saved x and y positions
  const hasSavedPositions = nodes.every(
    n => n.x !== undefined && n.y !== undefined && !isNaN(Number(n.x)) && !isNaN(Number(n.y))
  );

  let finalNodes: RoadmapNode[] = [];

  if (hasSavedPositions) {
    // WYSIWYG Mode: Preserve exact saved coordinates from editor without modifying, reflowing or normalizing!
    finalNodes = nodes.map(n => ({
      ...n,
      x: Number(n.x),
      y: Number(n.y),
      width: n.width || cardWidth,
      height: n.height || cardHeight,
    }));
  } else {
    // Fallback: Run auto-layout ONLY if any node is missing coordinates
    finalNodes = runAutoLayout(nodes, viewportWidth, cardWidth, cardHeight);
  }

  // Calculate overall graph bounds
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  finalNodes.forEach(n => {
    minX = Math.min(minX, n.x);
    maxX = Math.max(maxX, n.x + (n.width || cardWidth));
    minY = Math.min(minY, n.y);
    maxY = Math.max(maxY, n.y + (n.height || cardHeight));
  });

  if (minX === Infinity) minX = 0;
  if (maxX === -Infinity) maxX = 1200;
  if (minY === Infinity) minY = 0;
  if (maxY === -Infinity) maxY = 800;

  const padding = 120;
  const graphWidth = Math.max(maxX + padding, 1200);
  const graphHeight = Math.max(maxY + padding, 800);

  return {
    nodes: finalNodes,
    edges: edges.map(edge => ({ ...edge, points: [] })),
    width: graphWidth,
    height: graphHeight,
    minX,
    minY,
    canvasAppearance: canvasAppearance ?? defaultCanvasAppearance,
  };
}

function runAutoLayout(
  nodes: RoadmapNode[],
  viewportWidth: number,
  cardWidth: number,
  cardHeight: number
): RoadmapNode[] {
  let horizontalGap = 80;
  let verticalGap = 160;

  if (viewportWidth < 768) {
    horizontalGap = 40;
    verticalGap = 120;
  }

  const padding = 80;
  const maxAvailableWidth = (viewportWidth || 1200) - 2 * padding;

  const sanitizedNodes = nodes.map(n => ({
    ...n,
    x: Number(n.x) || 0,
    y: Number(n.y) || 0,
    width: cardWidth,
    height: cardHeight,
  }));

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

  levels.forEach(lvl => {
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

      currentY += cardHeight + verticalGap;
    });
  });

  return layoutedNodes;
}
