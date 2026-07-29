import {
  RoadmapNode,
  RoadmapEdge,
  CanvasAppearance,
  defaultCanvasAppearance,
  JourneyWaypoint,
  JourneyNodeAttachment,
  JourneyRoadPath,
  JourneyChapter,
  JourneyRenderResult,
} from '../types';

const CHAPTER_TITLES = [
  { title: 'Chapter 1: Core Fundamentals', subtitle: 'Master essential principles & core concepts' },
  { title: 'Chapter 2: Intermediate Architecture', subtitle: 'Build structured, scalable design patterns' },
  { title: 'Chapter 3: Advanced Engineering', subtitle: 'Optimize performance & tackle complex systems' },
  { title: 'Chapter 4: Production Mastery', subtitle: 'Deploy, monitor, and deliver real-world projects' },
  { title: 'Chapter 5: Expert Specialization', subtitle: 'Advanced topics and professional achievements' },
];

export function calculateJourneyLayout(
  nodes: RoadmapNode[],
  edges: RoadmapEdge[],
  viewportWidth: number,
  progressRecord: Record<string, { status: string }> = {},
  canvasAppearance?: CanvasAppearance
): JourneyRenderResult {
  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth < 768 && !isMobile;

  if (nodes.length === 0) {
    return {
      nodes: [],
      edges: [],
      attachments: [],
      chapters: [],
      roadPath: {
        mainRoadD: '',
        completedPathsD: [],
        currentPathD: '',
        lockedPathsD: [],
        centerLineD: '',
        totalLength: 0,
      },
      width: viewportWidth || 1200,
      height: 800,
      minX: 0,
      minY: 0,
      canvasAppearance: canvasAppearance ?? defaultCanvasAppearance,
    };
  }

  // 1. Order nodes topologically
  const orderedNodes = sortNodesTopologically(nodes, edges);

  // 2. Responsive dimensions - 40% closer card offset and compact card size
  const cardWidth = isMobile ? Math.min(230, viewportWidth - 110) : 240;
  const cardHeight = 115;
  const cardOffset = isMobile ? 80 : isTablet ? 95 : 105;
  const verticalGap = 180;
  const chapterBannerHeight = 120;
  const topPadding = 140;

  const canvasWidth = Math.max(viewportWidth || 1200, isMobile ? 380 : 1050);
  const centerX = canvasWidth / 2;

  // Organic sine curve parameters: varying amplitude & frequency per segment
  const baseAmplitude = isMobile ? Math.min(75, canvasWidth * 0.15) : Math.min(240, canvasWidth * 0.2);

  // 3. Group nodes into Chapters (~5 nodes per chapter)
  const nodesPerChapter = 5;
  const chapters: JourneyChapter[] = [];
  const roadControlPoints: { x: number; y: number; isChapterHeader?: boolean }[] = [];

  let currentY = topPadding;
  let nodeIdx = 0;

  // Initial lead-in point
  roadControlPoints.push({ x: centerX, y: currentY - 60 });

  while (nodeIdx < orderedNodes.length) {
    const chapterIndex = chapters.length;
    const chapterNodeGroup = orderedNodes.slice(nodeIdx, nodeIdx + nodesPerChapter);
    const chapterNodeIds = chapterNodeGroup.map(n => n.id);
    const meta = CHAPTER_TITLES[chapterIndex % CHAPTER_TITLES.length];

    const chapterStartY = currentY;

    // Add Chapter Header location
    roadControlPoints.push({
      x: centerX,
      y: currentY,
      isChapterHeader: true,
    });

    currentY += chapterBannerHeight;

    // Process nodes inside chapter
    chapterNodeGroup.forEach((node, idxInChapter) => {
      const globalIdx = nodeIdx + idxInChapter;
      
      // Organic curve math: blend sine + cosine with varying frequency to prevent repetitive loops
      const phase = globalIdx * 0.75 + (chapterIndex % 2) * 0.4;
      const organicAmplitude = baseAmplitude * (0.85 + 0.3 * Math.cos(globalIdx * 0.5));
      const waveDirection = globalIdx % 2 === 0 ? 1 : -1;

      const x = isMobile
        ? centerX + Math.sin(phase) * (baseAmplitude * 0.6) * waveDirection
        : centerX + Math.sin(phase) * organicAmplitude * waveDirection;

      const y = currentY;
      roadControlPoints.push({ x, y });

      currentY += verticalGap;
    });

    const isChapterCompleted = chapterNodeGroup.every(
      n => (progressRecord[n.id]?.status === 'COMPLETED') || n.completed
    );

    chapters.push({
      id: `chap-${chapterIndex + 1}`,
      title: meta.title,
      subtitle: meta.subtitle,
      chapterIndex: chapterIndex + 1,
      nodeIds: chapterNodeIds,
      y: chapterStartY,
      isCompleted: isChapterCompleted,
    });

    nodeIdx += nodesPerChapter;
  }

  // End lead-out point
  roadControlPoints.push({ x: centerX, y: currentY + 80 });

  // 4. Generate Main Road SVG Path
  const mainRoadD = generateCatmullRomPath(roadControlPoints.map(p => ({ x: p.x, y: p.y })));

  // 5. Generate Node Attachments & Curved Connectors
  const attachments: JourneyNodeAttachment[] = [];
  const updatedNodes: RoadmapNode[] = [];

  let lastCompletedGlobalIndex = -1;
  let controlPointIndexCounter = 1; // skip lead-in point

  chapters.forEach(chap => {
    // Skip chapter header point in control points array
    controlPointIndexCounter++;

    chap.nodeIds.forEach((nodeId, idxInChap) => {
      const node = orderedNodes.find(n => n.id === nodeId)!;
      const globalIdx = attachments.length;

      const pt = roadControlPoints[controlPointIndexCounter];
      const prevPt = roadControlPoints[controlPointIndexCounter - 1];
      const nextPt = roadControlPoints[controlPointIndexCounter + 1] || pt;

      controlPointIndexCounter++;

      // Tangent vector
      const dx = nextPt.x - prevPt.x;
      const dy = nextPt.y - prevPt.y;
      const len = Math.hypot(dx, dy) || 1;
      const tangentX = dx / len;
      const tangentY = dy / len;

      // Normal vector
      const normalX = -tangentY;
      const normalY = tangentX;

      // Alternate left/right side
      const side: 'left' | 'right' = globalIdx % 2 === 0 ? 'right' : 'left';

      // Card coordinates
      const cardX = side === 'right' ? pt.x + cardOffset : pt.x - cardOffset - cardWidth;
      const cardY = pt.y - cardHeight / 2;

      // Smooth curved Bezier connector path following road tangent & normal
      const cardAnchorX = side === 'right' ? cardX : cardX + cardWidth;
      const cardAnchorY = pt.y;
      const cp1X = pt.x + (side === 'right' ? 25 : -25) + tangentX * 15;
      const cp1Y = pt.y + tangentY * 15;
      const cp2X = cardAnchorX + (side === 'right' ? -15 : 15);
      const cp2Y = cardAnchorY;
      const connectorPathD = `M ${pt.x.toFixed(2)} ${pt.y.toFixed(2)} C ${cp1X.toFixed(2)} ${cp1Y.toFixed(2)}, ${cp2X.toFixed(2)} ${cp2Y.toFixed(2)}, ${cardAnchorX.toFixed(2)} ${cardAnchorY.toFixed(2)}`;

      const waypoint: JourneyWaypoint = {
        id: `wp-${node.id}`,
        nodeId: node.id,
        x: pt.x,
        y: pt.y,
        tangentX,
        tangentY,
        normalX,
        normalY,
        side,
        cardX,
        cardY,
        cardWidth,
        cardHeight,
        connectorPathD,
        progressRatio: (globalIdx + 1) / (orderedNodes.length + 1),
      };

      // Completion state
      const pStatus = progressRecord[node.id]?.status;
      const isCompleted = pStatus === 'COMPLETED' || node.completed;

      if (isCompleted) {
        lastCompletedGlobalIndex = globalIdx;
      }

      let state: 'completed' | 'current' | 'locked' | 'optional' = 'locked';
      if (isCompleted) {
        state = 'completed';
      } else if (globalIdx === 0 || (lastCompletedGlobalIndex >= 0 && globalIdx === lastCompletedGlobalIndex + 1)) {
        state = 'current';
      } else {
        state = 'locked';
      }

      // Check if Milestone (e.g. Project, Quiz, Assessment, Certificate, or 5th lesson of chapter)
      const rawType = (node.type || '').toLowerCase();
      const isMilestoneType = ['project', 'quiz', 'assessment', 'certificate', 'milestone'].includes(rawType);
      const isChapterEndMilestone = idxInChap === nodesPerChapter - 1;
      const isMilestone = isMilestoneType || isChapterEndMilestone;

      let milestoneType: 'checkpoint' | 'project' | 'quiz' | 'certificate' | 'assessment' = 'checkpoint';
      if (rawType.includes('project')) milestoneType = 'project';
      else if (rawType.includes('quiz')) milestoneType = 'quiz';
      else if (rawType.includes('cert')) milestoneType = 'certificate';
      else if (rawType.includes('assess')) milestoneType = 'assessment';

      const updatedNode: RoadmapNode = {
        ...node,
        x: cardX,
        y: cardY,
        width: cardWidth,
        height: cardHeight,
        completed: isCompleted,
      };

      updatedNodes.push(updatedNode);
      attachments.push({
        node: updatedNode,
        waypoint,
        state,
        isMilestone,
        milestoneType,
      });
    });
  });

  // 6. Partition Road Paths into 3 Progression States (Completed, Current, Locked)
  const completedPathsD: string[] = [];
  let currentPathD = '';
  const lockedPathsD: string[] = [];

  // Split control points into sub-path segments for each state
  const pts = roadControlPoints.map(p => ({ x: p.x, y: p.y }));

  if (lastCompletedGlobalIndex >= 0) {
    // Completed segment
    const completedPts = pts.slice(0, lastCompletedGlobalIndex + 2);
    if (completedPts.length >= 2) {
      completedPathsD.push(generateCatmullRomPath(completedPts));
    }
  }

  // Current segment
  const currentStartIdx = Math.max(0, lastCompletedGlobalIndex + 1);
  const currentEndIdx = Math.min(pts.length - 1, currentStartIdx + 1);
  if (currentEndIdx > currentStartIdx) {
    currentPathD = generateCatmullRomPath(pts.slice(currentStartIdx, currentEndIdx + 1));
  }

  // Locked segment
  if (currentEndIdx < pts.length - 1) {
    const lockedPts = pts.slice(currentEndIdx);
    if (lockedPts.length >= 2) {
      lockedPathsD.push(generateCatmullRomPath(lockedPts));
    }
  }

  const totalHeight = currentY + 140;

  return {
    nodes: updatedNodes,
    edges,
    attachments,
    chapters,
    roadPath: {
      mainRoadD,
      completedPathsD,
      currentPathD,
      lockedPathsD,
      centerLineD: mainRoadD,
      totalLength: totalHeight,
    },
    width: canvasWidth,
    height: totalHeight,
    minX: 0,
    minY: 0,
    canvasAppearance: canvasAppearance ?? defaultCanvasAppearance,
  };
}

function sortNodesTopologically(nodes: RoadmapNode[], edges: RoadmapEdge[]): RoadmapNode[] {
  const inDegree: Record<string, number> = {};
  const graph: Record<string, string[]> = {};

  nodes.forEach(n => {
    inDegree[n.id] = 0;
    graph[n.id] = [];
  });

  edges.forEach(e => {
    if (graph[e.source] && inDegree[e.target] !== undefined) {
      graph[e.source].push(e.target);
      inDegree[e.target]++;
    }
  });

  const queue: string[] = [];
  nodes.forEach(n => {
    if (inDegree[n.id] === 0) {
      queue.push(n.id);
    }
  });

  const orderedIds: string[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    orderedIds.push(curr);
    if (graph[curr]) {
      graph[curr].forEach(neighbor => {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      });
    }
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const result: RoadmapNode[] = [];

  orderedIds.forEach(id => {
    const node = nodeMap.get(id);
    if (node) {
      result.push(node);
      nodeMap.delete(id);
    }
  });

  nodeMap.forEach(node => result.push(node));
  return result;
}

function generateCatmullRomPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;
  }

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i === 0 ? points[0] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < points.length ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d;
}
