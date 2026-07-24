import { RoadmapNode, RoadmapEdge, RenderableGraph } from '../types';

export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL';

export function calculateLayout(
  nodes: RoadmapNode[],
  edges: RoadmapEdge[],
  viewportWidth: number
): RenderableGraph {
  if (nodes.length === 0) {
    return {
      nodes,
      edges,
      width: 0,
      height: 0,
      minX: 0,
      minY: 0
    };
  }

  // Set default dimensions on nodes if missing
  const sanitizedNodes = nodes.map(n => ({
    ...n,
    x: Number(n.x) || 0,
    y: Number(n.y) || 0,
    width: Number(n.width) || 280,
    height: Number(n.height) || 120
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

  // Sort levels by original Y coordinate
  levels.sort((a, b) => a.originalY - b.originalY);

  // Sort nodes within each level horizontally by original X coordinate
  levels.forEach(lvl => {
    lvl.nodes.sort((a, b) => a.x - b.x);
  });

  // 2. Reflow nodes based on available viewport width with dynamic spacing compression
  const layoutWidth = Math.min(viewportWidth, 960) || 960;
  const padding = 24;
  const maxAvailableWidth = layoutWidth - 2 * padding;
  
  const cardWidth = 280;
  const cardHeight = 120;

  // Compress spacing as viewport becomes smaller
  let horizontalGap = 48; // Desktop gap
  let verticalGap = 160;  // Desktop gap (center-to-center is 280px)

  if (viewportWidth < 640) {
    // Mobile
    horizontalGap = 16;
    verticalGap = 120;
  } else if (viewportWidth < 1024) {
    // Laptop / Tablet
    horizontalGap = 32;
    verticalGap = 140;
  }

  let currentY = 40; // initial top margin

  const layoutedNodes: RoadmapNode[] = [];

  levels.forEach(lvl => {
    const totalLevelWidth = lvl.nodes.length * cardWidth + (lvl.nodes.length - 1) * horizontalGap;
    
    if (totalLevelWidth <= maxAvailableWidth) {
      // 2a. All nodes in this level fit: preserve creator's layout offsets/spacing
      let minOrigX = Infinity;
      let maxOrigX = -Infinity;
      lvl.nodes.forEach(n => {
        minOrigX = Math.min(minOrigX, n.x);
        maxOrigX = Math.max(maxOrigX, n.x + n.width);
      });
      if (minOrigX === Infinity) minOrigX = 0;
      
      const origLevelWidth = maxOrigX - minOrigX;
      
      lvl.nodes.forEach(node => {
        let newX = 0;
        if (lvl.nodes.length === 1) {
          newX = (layoutWidth - cardWidth) / 2;
        } else {
          const origCenter = minOrigX + origLevelWidth / 2;
          const offsetFromCenter = (node.x + node.width / 2) - origCenter;
          newX = (layoutWidth / 2) + offsetFromCenter - cardWidth / 2;
        }

        // Clamp to prevent overflow at edges
        newX = Math.max(padding, Math.min(newX, layoutWidth - cardWidth - padding));

        layoutedNodes.push({
          ...node,
          x: newX,
          y: currentY
        });
      });

      currentY += cardHeight + verticalGap;
    } else {
      // 2b. Sibling nodes do not fit: wrap them like CSS flex-wrap
      let subRow: typeof sanitizedNodes = [];
      let subRowWidth = 0;

      const subRows: (typeof sanitizedNodes)[] = [];

      lvl.nodes.forEach(node => {
        const neededWidth = subRow.length === 0 ? cardWidth : cardWidth + horizontalGap;
        if (subRowWidth + neededWidth <= maxAvailableWidth) {
          subRow.push(node);
          subRowWidth += neededWidth;
        } else {
          subRows.push(subRow);
          subRow = [node];
          subRowWidth = cardWidth;
        }
      });
      if (subRow.length > 0) {
        subRows.push(subRow);
      }

      // Position each sub-row
      subRows.forEach(sr => {
        const srWidth = sr.length * cardWidth + (sr.length - 1) * horizontalGap;
        const startX = (layoutWidth - srWidth) / 2;

        sr.forEach((node, idx) => {
          layoutedNodes.push({
            ...node,
            x: startX + idx * (cardWidth + horizontalGap),
            y: currentY
          });
        });

        currentY += cardHeight + verticalGap;
      });
    }
  });

  return {
    nodes: layoutedNodes,
    edges: edges.map(edge => ({ ...edge, points: [] })),
    width: layoutWidth,
    height: currentY + 40,
    minX: 0,
    minY: 0
  };
}
