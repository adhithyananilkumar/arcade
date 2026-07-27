import { RoadmapNode, RoadmapEdge, CanvasAppearance, defaultCanvasAppearance } from '../types';

export function parseRoadmapGraph(graphJson: string): { nodes: RoadmapNode[], edges: RoadmapEdge[], canvasAppearance: CanvasAppearance } {
  try {
    const raw = JSON.parse(graphJson);
    const rawNodes = Array.isArray(raw.nodes) ? raw.nodes : [];
    const rawEdges = Array.isArray(raw.edges) ? raw.edges : [];

    // Extract canvas appearance saved by editor's AppearancePanel, or fallback to simple background
    const canvasAppearance: CanvasAppearance = raw.appearance
      ? { ...defaultCanvasAppearance, ...raw.appearance }
      : raw.background
      ? {
          ...defaultCanvasAppearance,
          backgroundType: raw.background.bgImage ? 'image' : 'color',
          backgroundColor: raw.background.bg || defaultCanvasAppearance.backgroundColor,
          image: raw.background.bgImage ? { url: raw.background.bgImage, display: 'tile', opacity: 100, blur: 0 } : undefined,
          grid: {
            ...defaultCanvasAppearance.grid,
            show: raw.background.dots ?? defaultCanvasAppearance.grid.show,
            type: 'dots',
            color: raw.background.dotColor || defaultCanvasAppearance.grid.color,
          }
        }
      : defaultCanvasAppearance;

    const nodes: RoadmapNode[] = rawNodes.map((rn: any) => ({
      id: rn.id,
      label: rn.data?.label || 'Untitled Node',
      description: rn.data?.description || '',
      type: rn.data?.nodeType || 'lesson',
      contentId: rn.data?.contentId,
      difficulty: rn.data?.difficulty,
      durationMinutes: rn.data?.durationMinutes,
      duration: rn.data?.duration,
      status: rn.data?.status || 'draft',
      completed: rn.data?.completed || false,

      // Visual styling saved by editor
      color: rn.data?.color || null,        // Tailwind bg class e.g. 'bg-indigo-600'
      fontColor: rn.data?.fontColor || null, // Tailwind text class e.g. 'text-white'
      fontFamily: rn.data?.fontFamily || null, // Tailwind font class e.g. 'font-sans'

      x: (rn.position?.x ?? rn.x) !== undefined && !isNaN(Number(rn.position?.x ?? rn.x)) ? Number(rn.position?.x ?? rn.x) : (undefined as any),
      y: (rn.position?.y ?? rn.y) !== undefined && !isNaN(Number(rn.position?.y ?? rn.y)) ? Number(rn.position?.y ?? rn.y) : (undefined as any),
      width: 280,
      height: 120,
    }));

    const edges: RoadmapEdge[] = rawEdges.map((re: any) => ({
      id: re.id,
      source: re.source,
      target: re.target,
      sourceHandle: re.sourceHandle || 'bottom',   // 'bottom' | 'source-right'
      targetHandle: re.targetHandle || 'top',       // 'top'    | 'target-left'
      status: re.data?.status || 'locked',
      points: [],
    }));

    // Post-process to calculate edge statuses based on node completion state
    const nodeMap = new Map<string, RoadmapNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    edges.forEach(e => {
      const source = nodeMap.get(e.source);
      const target = nodeMap.get(e.target);
      
      if (source?.completed && target?.completed) {
        e.status = 'completed';
      } else if (source?.completed && !target?.completed) {
        e.status = 'current';
      }
    });

    return { nodes, edges, canvasAppearance };
  } catch (e) {
    console.error("Failed to parse roadmap graphJson", e);
    return { nodes: [], edges: [], canvasAppearance: defaultCanvasAppearance };
  }
}
