import { create } from 'zustand';
import { roadmapProgressService } from '@/domains/roadmaps/services/progress';

interface NodeProgress {
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
  timeSpentSeconds: number;
}

interface RoadmapViewerState {
  roadmapId: string | null;
  activeNodeId: string | null;
  focusMode: boolean;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  progress: Record<string, NodeProgress>;
  lockedNodeIds: Set<string>;
  hoveredNodeId: string | null;
  nodes: any[];
  edges: any[];
  
  init: (roadmapId: string, initialNodes: any[], initialEdges: any[]) => Promise<void>;
  setActiveNode: (id: string | null) => void;
  setFocusMode: (active: boolean) => void;
  setZoomLevel: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  setHoveredNode: (id: string | null) => void;
  toggleNodeCompletion: (nodeId: string) => Promise<void>;
}

const calculateLocks = (nodes: any[], edges: any[], progress: Record<string, NodeProgress>) => {
  const locked = new Set<string>();
  const incomingMap = new Map<string, string[]>();
  
  edges.forEach(edge => {
    if (!incomingMap.has(edge.target)) {
      incomingMap.set(edge.target, []);
    }
    incomingMap.get(edge.target)!.push(edge.source);
  });
  
  nodes.forEach(node => {
    const parents = incomingMap.get(node.id) || [];
    if (parents.length > 0) {
      const hasUncompletedParent = parents.some(parentId => {
        const parentStatus = progress[parentId]?.status;
        return parentStatus !== 'COMPLETED';
      });
      if (hasUncompletedParent) {
        locked.add(node.id);
      }
    }
  });
  
  return locked;
};

export const useRoadmapViewerStore = create<RoadmapViewerState>((set, get) => ({
  roadmapId: null,
  activeNodeId: null,
  focusMode: false,
  zoomLevel: 1,
  panOffset: { x: 0, y: 0 },
  progress: {},
  lockedNodeIds: new Set(),
  hoveredNodeId: null,
  nodes: [],
  edges: [],

  init: async (roadmapId, initialNodes, initialEdges) => {
    set({ roadmapId, nodes: initialNodes, edges: initialEdges });
    try {
      const serverProgress = await roadmapProgressService.getProgress(roadmapId);
      const progressMap: Record<string, NodeProgress> = {};
      
      // If server returns progress nodes, map them
      if (serverProgress && Array.isArray(serverProgress.nodes)) {
        serverProgress.nodes.forEach(item => {
          progressMap[item.nodeId] = {
            status: item.status,
            timeSpentSeconds: item.timeSpentSeconds || 0
          };
        });
      }
      
      // Fallback for initial nodes if they were marked completed in graphJson
      initialNodes.forEach(node => {
        if (!progressMap[node.id]) {
          progressMap[node.id] = {
            status: node.completed ? 'COMPLETED' : 'NOT_STARTED',
            timeSpentSeconds: 0
          };
        }
      });

      const locks = calculateLocks(initialNodes, initialEdges, progressMap);
      set({ progress: progressMap, lockedNodeIds: locks, activeNodeId: null });

    } catch (e) {
      console.warn("Failed to load roadmap progress, falling back to local storage / memory", e);
      const progressMap: Record<string, NodeProgress> = {};
      initialNodes.forEach(node => {
        progressMap[node.id] = {
          status: node.completed ? 'COMPLETED' : 'NOT_STARTED',
          timeSpentSeconds: 0
        };
      });
      const locks = calculateLocks(initialNodes, initialEdges, progressMap);
      set({ progress: progressMap, lockedNodeIds: locks, activeNodeId: null });
    }
  },

  setActiveNode: (id) => set({ activeNodeId: id }),
  setFocusMode: (active) => set({ focusMode: active }),
  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.2, Math.min(zoom, 3)) }),
  setPanOffset: (offset) => set({ panOffset: offset }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),

  toggleNodeCompletion: async (nodeId) => {
    const { roadmapId, progress, nodes, edges } = get();
    const currentProgress = progress[nodeId];
    const isNowCompleted = currentProgress?.status !== 'COMPLETED';
    const nextStatus = isNowCompleted ? 'COMPLETED' : 'NOT_STARTED';

    const updatedProgress = {
      ...progress,
      [nodeId]: {
        status: nextStatus,
        timeSpentSeconds: currentProgress?.timeSpentSeconds || 0
      }
    };

    const locks = calculateLocks(nodes, edges, updatedProgress);
    
    // Automatically switch active node to next available child node
    let nextActiveId = get().activeNodeId;
    if (isNowCompleted) {
      // Find direct children
      const childrenIds = edges.filter(e => e.source === nodeId).map(e => e.target);
      const nextAvailable = childrenIds.find(cid => !locks.has(cid) && updatedProgress[cid]?.status !== 'COMPLETED');
      if (nextAvailable) {
        nextActiveId = nextAvailable;
      }
    }

    set({ 
      progress: updatedProgress, 
      lockedNodeIds: locks,
      activeNodeId: nextActiveId
    });

    if (roadmapId) {
      try {
        await roadmapProgressService.updateNodeProgress(roadmapId, nodeId, nextStatus, 0);
      } catch (err) {
        console.error("Failed to update progress on backend", err);
      }
    }
  }
}));
