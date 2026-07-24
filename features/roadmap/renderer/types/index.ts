export interface RoadmapNode {
  id: string;
  label: string;
  description?: string;
  type?: string; // 'lesson', 'project', etc.
  contentId?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes?: number;
  completed?: boolean;
  
  // Layout metadata assigned by layout engine
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  status?: 'completed' | 'current' | 'locked' | 'optional';
  
  // Layout metadata
  points: { x: number, y: number }[];
}

export interface RenderableGraph {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  width: number;
  height: number;
  minX: number;
  minY: number;
  levels?: RoadmapNode[][];
}
