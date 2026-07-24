export interface RoadmapNode {
  id: string;
  label: string;
  description?: string;
  type?: string; // 'lesson', 'project', etc.
  contentId?: string;
  difficulty?: string;
  durationMinutes?: number;
  duration?: string;
  completed?: boolean;
  status?: string; // 'draft', 'review', 'published', 'archived'

  // Editor visual styling - read from graphJson data
  color?: string;       // Tailwind bg class e.g. 'bg-indigo-600'
  fontColor?: string;   // Tailwind text class e.g. 'text-white'
  fontFamily?: string;  // Tailwind font class e.g. 'font-sans'
  
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
  sourceHandle?: string;  // e.g. 'bottom' | 'source-right'
  targetHandle?: string;  // e.g. 'top'    | 'target-left'
  status?: 'completed' | 'current' | 'locked' | 'optional';
  
  // Layout metadata
  points: { x: number, y: number }[];
}

export interface CanvasAppearance {
  backgroundType: 'color' | 'gradient' | 'image' | 'preset';
  backgroundColor: string;
  gradient?: string;
  image?: { url: string, display: 'fill' | 'fit' | 'tile', opacity: number, blur: number };
  grid: { show: boolean, type: 'dots' | 'lines' | 'cross', size: number, opacity: number, color: string, snap: boolean };
  advanced: { noise: boolean, shadows: boolean, theme: 'light' | 'dark' | 'auto' };
}

export const defaultCanvasAppearance: CanvasAppearance = {
  backgroundType: 'color',
  backgroundColor: '#ffffff',
  grid: { show: false, type: 'dots', size: 20, opacity: 1, color: '#94a3b8', snap: true },
  advanced: { noise: false, shadows: false, theme: 'light' },
};

export interface RenderableGraph {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  width: number;
  height: number;
  minX: number;
  minY: number;
  levels?: RoadmapNode[][];
  canvasAppearance?: CanvasAppearance;
}
