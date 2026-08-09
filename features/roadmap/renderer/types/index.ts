export interface RoadmapNode {
  id: string;
  label: string;
  description?: string;
  type?: string; // 'lesson', 'project', etc.
  contentId?: string;
  courseIds?: string[];
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

export interface JourneyChapter {
  id: string;
  title: string;
  subtitle: string;
  chapterIndex: number;
  nodeIds: string[];
  y: number;
  isCompleted: boolean;
}

export interface JourneyWaypoint {
  id: string;
  nodeId: string;
  x: number;
  y: number;
  tangentX: number;
  tangentY: number;
  normalX: number;
  normalY: number;
  side: 'left' | 'right';
  cardX: number;
  cardY: number;
  cardWidth: number;
  cardHeight: number;
  connectorPathD: string; // Smooth curved Bezier connector string
  progressRatio: number; // 0 to 1 along path length
}

export interface JourneyNodeAttachment {
  node: RoadmapNode;
  waypoint: JourneyWaypoint;
  state: 'completed' | 'current' | 'locked' | 'optional';
  isMilestone: boolean;
  milestoneType?: 'checkpoint' | 'project' | 'quiz' | 'certificate' | 'assessment';
}

export interface JourneyRoadPath {
  mainRoadD: string;          // Full SVG d attribute for main road
  completedPathsD: string[];  // SVG d attributes for completed road segments (Green)
  currentPathD: string;       // SVG d attribute for current active road segment (Indigo Glow)
  lockedPathsD: string[];     // SVG d attributes for locked road segments (Slate Gray)
  centerLineD: string;        // SVG d attribute for center line
  totalLength: number;        // Arc length in pixels
}

export interface JourneyRenderResult {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  attachments: JourneyNodeAttachment[];
  chapters: JourneyChapter[];
  roadPath: JourneyRoadPath;
  width: number;
  height: number;
  minX: number;
  minY: number;
  canvasAppearance?: CanvasAppearance;
}


