import { RoadmapNode, RoadmapEdge } from '../types';

export function parseRoadmapGraph(graphJson: string): { nodes: RoadmapNode[], edges: RoadmapEdge[] } {
  try {
    const raw = JSON.parse(graphJson);
    const rawNodes = Array.isArray(raw.nodes) ? raw.nodes : [];
    const rawEdges = Array.isArray(raw.edges) ? raw.edges : [];

    const nodes: RoadmapNode[] = rawNodes.map((rn: any) => ({
      id: rn.id,
      label: rn.data?.label || 'Untitled Node',
      description: rn.data?.description || '',
      type: rn.data?.nodeType || 'lesson',
      contentId: rn.data?.contentId,
      difficulty: rn.data?.difficulty,
      durationMinutes: rn.data?.durationMinutes,
      completed: rn.data?.completed || false,
      x: rn.position?.x ?? 0,
      y: rn.position?.y ?? 0,
      width: 280, // Default card width
      height: 120, // Default card height estimate
    }));

    const edges: RoadmapEdge[] = rawEdges.map((re: any) => ({
      id: re.id,
      source: re.source,
      target: re.target,
      status: re.data?.status || 'locked',
      points: [],
    }));

    // Post-process to calculate edge statuses if needed (e.g. if target node is completed, edge is completed)
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

    return { nodes, edges };
  } catch (e) {
    console.error("Failed to parse roadmap graphJson", e);
    return { nodes: [], edges: [] };
  }
}
