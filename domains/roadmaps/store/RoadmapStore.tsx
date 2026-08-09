"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { 
  Node, 
  Edge, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection, 
  useReactFlow,
  OnNodesChange,
  OnEdgesChange,
  OnConnect
} from "@xyflow/react";
import { LayoutEngine } from "../utils/LayoutEngine";
import { CanvasAppearance, defaultAppearance } from "../components/AppearancePanel";
import { ToolbarMode } from "../components/RoadmapToolbar";
import type { RoadmapData } from "../types";

export interface RoadmapStoreContextType {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedNode: Node | null;
  activeTool: ToolbarMode;
  appearance: CanvasAppearance;
  showMinimap: boolean;
  showGrid: boolean;
  readOnly: boolean;
  roadmapId: string;
  roadmapTitle: string;
  isSearchOpen: boolean;
  isSettingsOpen: boolean;
  searchQuery: string;
  contextMenu: { x: number; y: number; nodeId: string } | null;
  isTemplateOpen: boolean;
  contentType?: "course" | "workshop" | "roadmap";

  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setContextMenu: (menu: { x: number; y: number; nodeId: string } | null) => void;
  setIsTemplateOpen: (open: boolean) => void;

  addTopic: (position?: { x: number; y: number }) => void;
  addChild: (parentId?: string) => void;
  deleteTopic: (id: string) => void;
  updateTopic: (id: string, data: any) => void;
  duplicateTopic: (id: string) => void;
  autoLayout: () => void;
  setCanvasBackground: (bg: CanvasAppearance) => void;
  undo: () => void;
  redo: () => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  
  setActiveTool: (tool: ToolbarMode) => void;
  setSelectedNodeId: (id: string | null) => void;
  setShowMinimap: React.Dispatch<React.SetStateAction<boolean>>;
  setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  
  centerSelection: () => void;
  centerNode: (id: string) => void;
  fitView: (options?: any) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

const RoadmapStoreContext = createContext<RoadmapStoreContextType | null>(null);

export interface RoadmapEditorProviderProps {
  roadmap?: Partial<RoadmapData> | null;
  mode?: "edit" | "view";
  onGraphChange?: (graphJson: string) => void;
  readOnly?: boolean;
  contentType?: "course" | "workshop" | "roadmap";
  children: React.ReactNode;
}

export function RoadmapEditorProvider({
  roadmap,
  mode = "edit",
  onGraphChange,
  readOnly = false,
  contentType = "course",
  children,
}: RoadmapEditorProviderProps) {
  const isEffectiveReadOnly = readOnly || mode === "view";
  const roadmapId = roadmap?.id || "00000000-0000-0000-0000-000000000000";
  const roadmapTitle = roadmap?.title || "My Roadmap";

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolbarMode>("pointer");
  const [appearance, setAppearance] = useState<CanvasAppearance>(defaultAppearance);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Popover / dialog states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  const { screenToFlowPosition, fitView: reactFlowFitView, zoomIn: reactFlowZoomIn, zoomOut: reactFlowZoomOut } = useReactFlow();

  // History system
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const isUpdatingFromHistoryRef = useRef(false);

  const serializeState = useCallback((nds: Node[], eds: Edge[], app: CanvasAppearance) => {
    const cleanNodes = nds.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data }));
    const cleanEdges = eds.map(e => ({ id: e.id, source: e.source, target: e.target, data: e.data }));
    return JSON.stringify({ nodes: cleanNodes, edges: cleanEdges, appearance: app });
  }, []);

  const pushToHistory = useCallback((nds: Node[], eds: Edge[], app: CanvasAppearance) => {
    if (isUpdatingFromHistoryRef.current) return;
    const snapshot = serializeState(nds, eds, app);
    const lastSnapshot = undoStackRef.current[undoStackRef.current.length - 1];
    if (snapshot !== lastSnapshot) {
      undoStackRef.current.push(snapshot);
      if (undoStackRef.current.length > 50) {
        undoStackRef.current.shift();
      }
      redoStackRef.current = []; // Clear redo stack on user action
    }
  }, [serializeState]);

  // Load initial graph state
  const lastLoadedGraphJsonRef = useRef<string | null>(null);
  useEffect(() => {
    if (roadmap?.graphJson === lastLoadedGraphJsonRef.current && lastLoadedGraphJsonRef.current !== null) return;
    let parsedNodes: Node[] = [];
    let parsedEdges: Edge[] = [];
    let parsedAppearance = defaultAppearance;

    if (roadmap?.graphJson) {
      try {
        const parsed = JSON.parse(roadmap.graphJson);
        parsedNodes = parsed.nodes || [];
        parsedEdges = parsed.edges || [];
        if (parsed.appearance) {
          parsedAppearance = { ...defaultAppearance, ...parsed.appearance };
        }
      } catch (e) {
        console.error("Failed to parse initial graphJson in provider", e);
      }
    }

    if (parsedNodes.length === 0 && !lastLoadedGraphJsonRef.current) {
      parsedNodes = [
        {
          id: "node-1",
          type: "topic",
          position: { x: 340, y: 120 },
          data: { label: "Akash", color: "#f59e0b", status: "draft", nodeType: "lesson" },
        },
        {
          id: "node-2",
          type: "topic",
          position: { x: 720, y: 220 },
          data: { label: "Anandhu", color: "#f43f5e", status: "draft", nodeType: "lesson" },
        },
        {
          id: "node-3",
          type: "topic",
          position: { x: 300, y: 380 },
          data: { label: "Aloshy", color: "#f59e0b", status: "draft", nodeType: "lesson" },
        },
      ];
      parsedEdges = [
        {
          id: "edge-1-2",
          source: "node-1",
          target: "node-2",
          type: "smoothstep",
          style: { stroke: "#ffffff", strokeWidth: 3 },
        },
        {
          id: "edge-3-2",
          source: "node-3",
          target: "node-2",
          type: "smoothstep",
          style: { stroke: "#ffffff", strokeWidth: 3 },
        },
      ];
    }

    setNodes(parsedNodes.map(n => ({ ...n, type: "topic" })));
    setEdges(parsedEdges);
    setAppearance(parsedAppearance);
    lastLoadedGraphJsonRef.current = roadmap?.graphJson || 'default-init';
  }, [roadmap?.graphJson, setNodes, setEdges]);

  // Sync to TipTap node view on changes
  const lastSavedJsonRef = useRef<string | null>(null);
  useEffect(() => {
    if (!lastLoadedGraphJsonRef.current || isEffectiveReadOnly) return;
    const cleanNodes = nodes.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data }));
    const cleanEdges = edges.map(e => ({ id: e.id, source: e.source, target: e.target, data: e.data }));
    const graphJson = JSON.stringify({ nodes: cleanNodes, edges: cleanEdges, appearance });
    
    if (lastSavedJsonRef.current !== graphJson) {
      lastSavedJsonRef.current = graphJson;
      lastLoadedGraphJsonRef.current = graphJson; // Prevent circular re-hydration loop
      onGraphChange?.(graphJson);
    }
  }, [nodes, edges, appearance, onGraphChange, isEffectiveReadOnly]);

  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Actions
  const addTopic = useCallback((position?: { x: number; y: number }) => {
    if (isEffectiveReadOnly) return;
    const id = `node-${Date.now()}`;

    // Determine where to place the node in flow-coordinates.
    // If a position was passed (double-click on canvas), use it directly.
    // Otherwise calculate the visible viewport center.
    let x = 400;
    let y = 300;

    if (position) {
      x = position.x - 90;   // offset so node center lands under cursor
      y = position.y - 50;
    } else {
      const domNode = document.querySelector(".react-flow__pane");
      if (domNode) {
        const rect = domNode.getBoundingClientRect();
        try {
          const center = screenToFlowPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          });
          x = center.x - 90;
          y = center.y - 50;
        } catch {
          // fallback to safe coordinates
        }
      }
    }

    const newNode: Node = {
      id,
      type: "topic",
      position: { x, y },
      data: { label: "New Topic", color: "#f59e0b", status: "draft", nodeType: "lesson" },
    };

    pushToHistory(nodes, edges, appearance);
    setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), newNode]);
  }, [screenToFlowPosition, isEffectiveReadOnly, nodes, edges, appearance, pushToHistory, setNodes]);

  const addChild = useCallback((parentId?: string) => {
    if (isEffectiveReadOnly) return;
    const activeParentId = parentId || selectedNodeId;
    if (!activeParentId) return;
    const parentNode = nodes.find(n => n.id === activeParentId);
    if (!parentNode) return;

    const id = `node-${Date.now()}`;
    const newNode: Node = {
      id,
      type: "topic",
      position: { x: parentNode.position.x, y: parentNode.position.y + 160 },
      data: { label: "New Topic", color: parentNode.data.color || "#f59e0b", status: "draft", nodeType: "lesson", isEditing: true },
      selected: true,
    };
    
    pushToHistory(nodes, edges, appearance);
    setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), newNode]);
    setSelectedNodeId(id);
    setEdges((eds) => eds.concat({
      id: `e-${parentNode.id}-${id}`,
      source: parentNode.id,
      target: id,
      type: "progress"
    }));

    setTimeout(() => {
      reactFlowFitView({
        nodes: [newNode],
        duration: 400,
        padding: 2,
        minZoom: 1,
        maxZoom: 1.0,
      });
    }, 50);
  }, [nodes, selectedNodeId, setNodes, setEdges, isEffectiveReadOnly, appearance, pushToHistory, reactFlowFitView]);

  const deleteTopic = useCallback((id: string) => {
    if (isEffectiveReadOnly) return;
    pushToHistory(nodes, edges, appearance);
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  }, [nodes, edges, appearance, selectedNodeId, setNodes, setEdges, isEffectiveReadOnly, pushToHistory]);

  // Use a stable ref for updateTopic body so callbacks injected into node data
  // don't cause nodesWithData to recompute on every nodes change.
  const updateTopicRef = useRef<(id: string, data: any) => void>(() => {});
  const updateTopic = useCallback((id: string, data: any) => {
    if (isEffectiveReadOnly) return;
    if (!("isEditing" in data && Object.keys(data).length === 1)) {
      pushToHistory(nodes, edges, appearance);
    }
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n))
    );
  }, [nodes, edges, appearance, setNodes, isEffectiveReadOnly, pushToHistory]);
  updateTopicRef.current = updateTopic;

  // Stable wrapper — never changes reference, always calls latest updateTopic
  const stableUpdateTopic = useCallback((id: string, data: any) => {
    updateTopicRef.current(id, data);
  }, []);

  const duplicateTopic = useCallback((id: string) => {
    if (isEffectiveReadOnly) return;
    const nodeToDuplicate = nodes.find(n => n.id === id);
    if (!nodeToDuplicate) return;

    const newNode: Node = {
      ...nodeToDuplicate,
      id: `node-${Date.now()}`,
      position: { x: nodeToDuplicate.position.x + 50, y: nodeToDuplicate.position.y + 50 },
      selected: false,
    };
    pushToHistory(nodes, edges, appearance);
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, appearance, edges, setNodes, isEffectiveReadOnly, pushToHistory]);

  const autoLayout = useCallback(() => {
    if (isEffectiveReadOnly) return;
    pushToHistory(nodes, edges, appearance);
    const layouted = LayoutEngine.getLayoutedElements(nodes, edges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
    setTimeout(() => reactFlowFitView({ duration: 500, padding: 0.2, maxZoom: 1.0 }), 50);
  }, [nodes, edges, appearance, setNodes, setEdges, reactFlowFitView, isEffectiveReadOnly, pushToHistory]);

  const bringToFront = useCallback((id: string) => {
    if (isEffectiveReadOnly) return;
    pushToHistory(nodes, edges, appearance);
    setNodes((nds) => {
      const idx = nds.findIndex((n) => n.id === id);
      if (idx === -1) return nds;
      const copy = [...nds];
      const [node] = copy.splice(idx, 1);
      const maxZ = Math.max(...copy.map(n => n.style?.zIndex ? Number(n.style.zIndex) : 0), 0);
      node.style = { ...node.style, zIndex: maxZ + 1 };
      return [...copy, node];
    });
  }, [isEffectiveReadOnly, nodes, edges, appearance, pushToHistory, setNodes]);

  const sendToBack = useCallback((id: string) => {
    if (isEffectiveReadOnly) return;
    pushToHistory(nodes, edges, appearance);
    setNodes((nds) => {
      const idx = nds.findIndex((n) => n.id === id);
      if (idx === -1) return nds;
      const copy = [...nds];
      const [node] = copy.splice(idx, 1);
      const minZ = Math.min(...copy.map(n => n.style?.zIndex ? Number(n.style.zIndex) : 0), 0);
      node.style = { ...node.style, zIndex: minZ - 1 };
      return [node, ...copy];
    });
  }, [isEffectiveReadOnly, nodes, edges, appearance, pushToHistory, setNodes]);

  const centerNode = useCallback((id: string) => {
    const node = nodes.find(n => n.id === id);
    if (node) {
      reactFlowFitView({
        nodes: [node],
        duration: 500,
        padding: 2,
        minZoom: 1,
        maxZoom: 1.0,
      });
    }
  }, [nodes, reactFlowFitView]);

  const setCanvasBackground = useCallback((bg: CanvasAppearance) => {
    if (isEffectiveReadOnly) return;
    pushToHistory(nodes, edges, appearance);
    setAppearance(bg);
  }, [nodes, edges, appearance, isEffectiveReadOnly, pushToHistory]);

  const onConnect = useCallback((params: Connection) => {
    if (isEffectiveReadOnly) return;
    pushToHistory(nodes, edges, appearance);
    setEdges((eds) => addEdge(params, eds));
  }, [edges, nodes, appearance, setEdges, isEffectiveReadOnly, pushToHistory]);

  const undo = useCallback(() => {
    if (isEffectiveReadOnly || undoStackRef.current.length === 0) return;
    const prevState = undoStackRef.current.pop()!;
    const currentState = serializeState(nodes, edges, appearance);
    redoStackRef.current.push(currentState);

    try {
      isUpdatingFromHistoryRef.current = true;
      const parsed = JSON.parse(prevState);
      setNodes(parsed.nodes || []);
      setEdges(parsed.edges || []);
      if (parsed.appearance) setAppearance(parsed.appearance);
    } catch (e) {
      console.error("Undo failed", e);
    } finally {
      isUpdatingFromHistoryRef.current = false;
    }
  }, [nodes, edges, appearance, isEffectiveReadOnly, serializeState, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (isEffectiveReadOnly || redoStackRef.current.length === 0) return;
    const nextState = redoStackRef.current.pop()!;
    const currentState = serializeState(nodes, edges, appearance);
    undoStackRef.current.push(currentState);

    try {
      isUpdatingFromHistoryRef.current = true;
      const parsed = JSON.parse(nextState);
      setNodes(parsed.nodes || []);
      setEdges(parsed.edges || []);
      if (parsed.appearance) setAppearance(parsed.appearance);
    } catch (e) {
      console.error("Redo failed", e);
    } finally {
      isUpdatingFromHistoryRef.current = false;
    }
  }, [nodes, edges, appearance, isEffectiveReadOnly, serializeState, setNodes, setEdges]);

  const centerSelection = useCallback(() => {
    if (!selectedNodeId) return;
    const selNode = nodes.find(n => n.id === selectedNodeId);
    if (selNode) {
      reactFlowFitView({
        nodes: [selNode],
        duration: 500,
        padding: 2,
        minZoom: 1,
        maxZoom: 1.0,
      });
    }
  }, [nodes, selectedNodeId, reactFlowFitView]);

  const fitView = useCallback((options?: any) => {
    reactFlowFitView(options || { duration: 500, padding: 0.2, maxZoom: 1.0 });
  }, [reactFlowFitView]);

  const zoomIn = useCallback(() => reactFlowZoomIn(), [reactFlowZoomIn]);
  const zoomOut = useCallback(() => reactFlowZoomOut(), [reactFlowZoomOut]);

  // Attach global keyboard action listeners for TipTap commands or shortcut triggers
  useEffect(() => {
    const handleAddTopicEvent = () => addTopic();
    const handleAutoLayoutEvent = () => autoLayout();
    const handleAppearanceEvent = () => setIsSettingsOpen(prev => !prev);
    const handleFitViewEvent = () => fitView();

    window.addEventListener("arcade-roadmap-add-topic", handleAddTopicEvent);
    window.addEventListener("arcade-roadmap-auto-layout", handleAutoLayoutEvent);
    window.addEventListener("arcade-roadmap-appearance", handleAppearanceEvent);
    window.addEventListener("arcade-roadmap-fit-view", handleFitViewEvent);

    return () => {
      window.removeEventListener("arcade-roadmap-add-topic", handleAddTopicEvent);
      window.removeEventListener("arcade-roadmap-auto-layout", handleAutoLayoutEvent);
      window.removeEventListener("arcade-roadmap-appearance", handleAppearanceEvent);
      window.removeEventListener("arcade-roadmap-fit-view", handleFitViewEvent);
    };
  }, [addTopic, autoLayout, fitView]);

  const contextValue = useMemo(() => ({
    nodes,
    edges,
    selectedNodeId,
    selectedNode,
    activeTool,
    appearance,
    showMinimap,
    showGrid,
    readOnly: isEffectiveReadOnly,
    roadmapId,
    roadmapTitle,
    isSearchOpen,
    isSettingsOpen,
    searchQuery,
    contextMenu,
    isTemplateOpen,
    contentType,

    setSearchQuery,
    setIsSearchOpen,
    setIsSettingsOpen,
    setContextMenu,
    setIsTemplateOpen,

    addTopic,
    addChild,
    deleteTopic,
    updateTopic: stableUpdateTopic,
    duplicateTopic,
    autoLayout,
    setCanvasBackground,
    undo,
    redo,
    bringToFront,
    sendToBack,
    
    setActiveTool,
    setSelectedNodeId,
    setShowMinimap,
    setShowGrid,
    
    onNodesChange,
    onEdgesChange,
    onConnect,
    
    centerSelection,
    centerNode,
    fitView,
    zoomIn,
    zoomOut,
    setNodes,
    setEdges,
  }), [
    nodes,
    edges,
    selectedNodeId,
    selectedNode,
    activeTool,
    appearance,
    showMinimap,
    showGrid,
    isEffectiveReadOnly,
    roadmapId,
    roadmapTitle,
    isSearchOpen,
    isSettingsOpen,
    searchQuery,
    contextMenu,
    isTemplateOpen,
    contentType,

    addTopic,
    addChild,
    deleteTopic,
    stableUpdateTopic,
    duplicateTopic,
    autoLayout,
    setCanvasBackground,
    undo,
    redo,
    bringToFront,
    sendToBack,
    onNodesChange,
    onEdgesChange,
    onConnect,
    centerSelection,
    centerNode,
    fitView,
    zoomIn,
    zoomOut,
    setNodes,
    setEdges,
  ]);

  return (
    <RoadmapStoreContext.Provider value={contextValue}>
      {children}
    </RoadmapStoreContext.Provider>
  );
}

export function useRoadmap() {
  const context = useContext(RoadmapStoreContext);
  if (!context) {
    throw new Error("useRoadmap must be used within a RoadmapEditorProvider");
  }
  return context;
}
