"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  Node,
  Edge,
  Connection,
  ConnectionMode,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useViewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { RoadmapData } from '../types';
import {
  MousePointer,
  Hand,
  Plus,
  Link as LinkIcon,
  LayoutGrid,
  Maximize2,
  Map,
  Palette,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Trash2,
  CheckCircle,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { RoadmapNode } from './RoadmapNode';
import { ProgressEdge } from './ProgressEdge';
import { RoadmapEditorProvider } from '../store/RoadmapStore';
import { api } from '@/infrastructure/http/api';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/design-system/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/design-system/ui/command';

// ─── Props ────────────────────────────────────────────────────────────────────
interface RoadmapCanvasProps {
  roadmap?: Partial<RoadmapData> | null;
  mode?: 'edit' | 'view';
  saveState?: 'saved' | 'saving' | 'unsaved' | 'error' | 'conflict';
  onGraphChange?: (graphJson: string) => void;
  onManualSave?: () => void;
  readOnly?: boolean;
  onNodeSelect?: (node: Node) => void;
  contentType?: 'course' | 'workshop' | 'roadmap';
}

// ─── Toolbar props ────────────────────────────────────────────────────────────
interface ToolbarProps {
  readOnly: boolean;
  activeTool: string;
  setActiveTool: (t: string) => void;
  addTopic: () => void;
  deleteSelected: () => void;
  selectedNodeId: string | null;
  showMinimap: boolean;
  setShowMinimap: (v: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  updateSelectedColor: (color: string) => void;
  currentNodeColor: string;
  autoLayout: () => void;
  bgStyle: { bg: string; dotColor: string; dots: boolean; bgImage?: string };
  setBgStyle: (style: { bg: string; dotColor: string; dots: boolean; bgImage?: string }) => void;
}

const BG_PRESETS = [
  { label: 'Dark Canvas', bg: '#0b0f17', dotColor: '#334155', dots: true },
  { label: 'Slate', bg: '#0f172a', dotColor: '#1e293b', dots: true },
  { label: 'White', bg: '#ffffff', dotColor: '#e2e8f0', dots: true },
  { label: 'Gray', bg: '#f8fafc', dotColor: '#cbd5e1', dots: true },
];

const NODE_COLORS = [
  '#f59e0b', '#4f46e5', '#f43f5e', '#10b981', '#0ea5e9', '#8b5cf6', '#1e293b', '#ffffff',
];

// ─── Floating Toolbar ─────────────────────────────────────────────────────────
// Renders inside ReactFlowProvider so useViewport() + useReactFlow() are valid.
function FloatingRoadmapToolbar({
  readOnly,
  activeTool,
  setActiveTool,
  addTopic,
  deleteSelected,
  selectedNodeId,
  showMinimap,
  setShowMinimap,
  undo,
  redo,
  canUndo,
  canRedo,
  updateSelectedColor,
  currentNodeColor,
  autoLayout,
  bgStyle,
  setBgStyle,
}: ToolbarProps) {
  const { zoom } = useViewport();
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const [showColorPop, setShowColorPop] = useState(false);
  const [showBgPop, setShowBgPop] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        const MAX_DIM = 1920;
        if (width > height && width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; }
        else if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
        setBgStyle({ ...bgStyle, bgImage: canvas.toDataURL('image/webp', 0.6) });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const zoomPct = Math.round(zoom * 100);

  const toolBtn = (active: boolean, extra = '') =>
    `p-2 rounded-lg transition-all duration-150 ${active
      ? 'bg-indigo-600 text-white shadow-md'
      : `text-gray-400 hover:text-white hover:bg-white/10 ${extra}`
    }`;

  return (
    <div
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-1.5 bg-[#1a1a2e]/95 text-white border border-white/10 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] select-none"
      onMouseDown={e => e.stopPropagation()}
    >
      {/* ── Mode buttons ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 bg-white/5 p-1 rounded-xl border border-white/5">
        <button type="button" title="Pointer (V)" onClick={() => setActiveTool('pointer')} className={toolBtn(activeTool === 'pointer')}>
          <MousePointer size={14} />
        </button>
        <button type="button" title="Hand / Pan (H)" onClick={() => setActiveTool('hand')} className={toolBtn(activeTool === 'hand')}>
          <Hand size={14} />
        </button>
        {!readOnly && (
          <button type="button" title="Connect Nodes (C)" onClick={() => setActiveTool('connect')} className={toolBtn(activeTool === 'connect')}>
            <LinkIcon size={14} />
          </button>
        )}
      </div>

      <div className="w-px h-5 bg-white/10 mx-0.5 shrink-0" />

      {/* ── Add Topic ────────────────────────────────────────────────────── */}
      {!readOnly && (
        <button
          type="button"
          title="Add Topic (A)"
          onClick={addTopic}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus size={15} />
        </button>
      )}

      {/* ── Quick color (only when node selected) ────────────────────────── */}
      {!readOnly && selectedNodeId && (
        <div className="relative">
          <button
            type="button"
            title="Node Color"
            onClick={() => { setShowColorPop(p => !p); setShowBgPop(false); }}
            className={toolBtn(showColorPop)}
          >
            <span className="w-3.5 h-3.5 rounded-full border border-white/30 block" style={{ backgroundColor: currentNodeColor }} />
          </button>
          {showColorPop && (
            <div className="absolute bottom-11 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-2 bg-[#252526] border border-white/10 rounded-xl shadow-2xl z-50 animate-in zoom-in-95 duration-150">
              {NODE_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { updateSelectedColor(c); setShowColorPop(false); }}
                  className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 shrink-0"
                  style={{ backgroundColor: c, borderColor: c === currentNodeColor ? '#818cf8' : 'rgba(255,255,255,0.2)' }}
                />
              ))}
              <div className="w-px h-4 bg-white/10 mx-0.5" />
              <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/20">
                <input
                  type="color"
                  value={currentNodeColor.startsWith('#') ? currentNodeColor : '#ffffff'}
                  onChange={e => updateSelectedColor(e.target.value)}
                  className="absolute inset-[-8px] w-9 h-9 cursor-pointer border-0"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Auto Layout ──────────────────────────────────────────────────── */}
      <button type="button" title="Auto Layout (L)" onClick={autoLayout} className={toolBtn(false)}>
        <LayoutGrid size={14} />
      </button>

      {/* ── Fit View ─────────────────────────────────────────────────────── */}
      <button type="button" title="Fit View (F)" onClick={() => fitView({ padding: 0.2, duration: 400, maxZoom: 1.0 })} className={toolBtn(false)}>
        <Maximize2 size={14} />
      </button>

      {/* ── MiniMap ──────────────────────────────────────────────────────── */}
      <button type="button" title="Toggle Minimap (M)" onClick={() => setShowMinimap(!showMinimap)} className={toolBtn(showMinimap)}>
        <Map size={14} />
      </button>

      {/* ── Canvas Background ────────────────────────────────────────────── */}
      <div className="relative">
        <button type="button" title="Canvas Theme" onClick={() => { setShowBgPop(p => !p); setShowColorPop(false); }} className={toolBtn(showBgPop)}>
          <Palette size={14} />
        </button>
        {showBgPop && (
          <div className="absolute bottom-11 left-1/2 -translate-x-1/2 w-44 bg-[#252526] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 animate-in zoom-in-95 duration-150">
            <p className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-400">Canvas Theme</p>
            {BG_PRESETS.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => { setBgStyle(p); setShowBgPop(false); }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-indigo-600 hover:text-white transition-colors text-left"
              >
                <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: p.bg }} />
                {p.label}
              </button>
            ))}
            <div className="w-full h-px bg-white/10 my-1"></div>
            <div className="px-2 py-1 text-xs">
              <label className="text-gray-400 font-medium mb-1 block">Custom Color</label>
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6 rounded overflow-hidden border border-white/20 shrink-0">
                  <input
                    type="color"
                    value={bgStyle.bg.startsWith('#') ? bgStyle.bg.substring(0, 7) : '#0b0f17'}
                    onChange={(e) => setBgStyle({ ...bgStyle, bg: e.target.value, bgImage: undefined })}
                    className="absolute inset-[-8px] w-10 h-10 cursor-pointer border-0 p-0"
                  />
                </div>
                <input
                  type="text"
                  placeholder="#000000"
                  value={bgStyle.bg}
                  onChange={(e) => setBgStyle({ ...bgStyle, bg: e.target.value, bgImage: undefined })}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white outline-none font-mono"
                />
              </div>
            </div>
            <div className="px-2 py-1 text-xs">
              <label className="text-gray-400 font-medium mb-1 block">Background Image URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={customImageUrl || bgStyle.bgImage || ""}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value) {
                    setBgStyle({ ...bgStyle, bgImage: e.target.value });
                  } else {
                    setBgStyle({ ...bgStyle, bgImage: undefined });
                  }
                }}
                className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white outline-none"
              />
            </div>
            <div className="px-2 pb-1 pt-2">
              <label className="flex items-center justify-center w-full bg-[#1e1e1e] hover:bg-white/10 border border-white/10 rounded px-2 py-1.5 text-xs text-gray-300 cursor-pointer transition-colors">
                <span className="font-medium text-[11px]">Upload from Gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-white/10 mx-0.5 shrink-0" />

      {/* ── Undo / Redo ──────────────────────────────────────────────────── */}
      {!readOnly && (
        <>
          <button type="button" title="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo} className={`p-2 rounded-lg transition-all ${canUndo ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 cursor-not-allowed'}`}>
            <UndoIcon size={14} />
          </button>
          <button type="button" title="Redo (Ctrl+Y)" onClick={redo} disabled={!canRedo} className={`p-2 rounded-lg transition-all ${canRedo ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 cursor-not-allowed'}`}>
            <RedoIcon size={14} />
          </button>
        </>
      )}

      {/* ── Delete selected ──────────────────────────────────────────────── */}
      {!readOnly && selectedNodeId && (
        <button type="button" title="Delete Selected (Del)" onClick={deleteSelected} className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-all">
          <Trash2 size={14} />
        </button>
      )}

      <div className="w-px h-5 bg-white/10 mx-0.5 shrink-0" />

      {/* ── Zoom display ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-1">
        <button type="button" title="Zoom Out" onClick={() => zoomOut({ duration: 200 })} className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold">−</button>
        <span className="text-[10px] font-bold text-gray-400 font-mono w-8 text-center">{zoomPct}%</span>
        <button type="button" title="Zoom In" onClick={() => zoomIn({ duration: 200 })} className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold">+</button>
        <span title="Saved"><CheckCircle size={12} className="text-emerald-400 ml-1" /></span>
      </div>
    </div>
  );
}

// ─── Node renderer (MUST NOT call any hook that needs provider outside ReactFlow) ─
function TopicNodeRenderer(props: any) {
  const { id, data, selected } = props;
  return (
    <RoadmapNode
      id={id}
      selected={selected}
      label={data?.label || 'New Topic'}
      description={data?.description}
      nodeType={data?.nodeType || 'lesson'}
      status={data?.status || 'draft'}
      difficulty={data?.difficulty}
      duration={data?.duration}
      color={data?.color || '#f59e0b'}
      fontColor={data?.fontColor}
      borderColor={data?.borderColor}
      icon={data?.icon}
      isCompleted={data?.completed}
      editable={!data?.readOnly}
      isEditing={data?.isEditing}
      showHandles={true}
      validationError={data?.validationError}
      shape={data?.shape || 'rectangle'}
      onRename={(nodeId, newLabel) => {
        data?.onUpdate?.(nodeId, { label: newLabel, isEditing: false });
      }}
    />
  );
}

const NODE_TYPES = { topic: TopicNodeRenderer, default: TopicNodeRenderer };
const EDGE_TYPES = { default: ProgressEdge, smoothstep: ProgressEdge };

const DEFAULT_NODES: Node[] = [
  { id: 'node-default-1', type: 'topic', position: { x: 200, y: 200 }, data: { label: 'Topic 1', color: '#f59e0b', status: 'draft', nodeType: 'lesson' } },
];

// ─── Main inner canvas ────────────────────────────────────────────────────────
function RoadmapCanvasInner({ roadmap, onGraphChange, readOnly = false, onNodeSelect }: RoadmapCanvasProps) {
  // ── Parse initial graph ──────────────────────────────────────────────────────
  const parseGraph = useCallback((graphJson?: string | null) => {
    if (!graphJson) return { nodes: DEFAULT_NODES, edges: [] as Edge[], background: undefined };
    try {
      const parsed = JSON.parse(graphJson);
      const nodes: Node[] = (parsed.nodes || []).map((n: any) => ({ ...n, type: 'topic' }));
      const edges: Edge[] = parsed.edges || [];
      return { nodes: nodes.length > 0 ? nodes : DEFAULT_NODES, edges, background: parsed.background };
    } catch {
      return { nodes: DEFAULT_NODES, edges: [] as Edge[], background: undefined };
    }
  }, []);

  const initial = parseGraph(roadmap?.graphJson);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [activeTool, setActiveTool] = useState<string>('pointer');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showMinimap, setShowMinimap] = useState(false);
  const [bgStyle, setBgStyle] = useState<{ bg: string; dotColor: string; dots: boolean; bgImage?: string }>(initial.background || { bg: '#0b0f17', dotColor: '#334155', dots: true });
  const [publishedCourses, setPublishedCourses] = useState<{ id: string, title: string }[]>([]);
  const [openCourseSelect, setOpenCourseSelect] = useState(false);

  useEffect(() => {
    if (!readOnly) {
      api.get<any[]>('/api/v1/public/courses')
        .then(courses => setPublishedCourses(courses.map(c => ({ id: c.id, title: c.title }))))
        .catch(err => console.error("Failed to load published courses", err));
    }
  }, [readOnly]);

  // ── History (undo/redo) ──────────────────────────────────────────────────────
  const historyRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const futureRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const pushHistory = useCallback((ns: Node[], es: Edge[]) => {
    historyRef.current.push({ nodes: ns, edges: es });
    if (historyRef.current.length > 50) historyRef.current.shift();
    futureRef.current = [];
  }, []);

  const undo = useCallback(() => {
    if (!historyRef.current.length) return;
    const prev = historyRef.current.pop()!;
    futureRef.current.push({ nodes, edges });
    setNodes(prev.nodes);
    setEdges(prev.edges);
  }, [nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (!futureRef.current.length) return;
    const next = futureRef.current.pop()!;
    historyRef.current.push({ nodes, edges });
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [nodes, edges, setNodes, setEdges]);

  // ── ReactFlow hooks ──────────────────────────────────────────────────────────
  const { screenToFlowPosition } = useReactFlow();

  // ── Stable updateTopic ───────────────────────────────────────────────────────
  const updateTopicImpl = useCallback((id: string, data: any) => {
    if (readOnly) return;
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n));
  }, [readOnly, setNodes]);
  const updateTopicRef = useRef(updateTopicImpl);
  updateTopicRef.current = updateTopicImpl;
  const stableUpdateTopic = useCallback((id: string, data: any) => updateTopicRef.current(id, data), []);

  // ── Add Topic ────────────────────────────────────────────────────────────────
  const addTopic = useCallback(() => {
    if (readOnly) return;
    const id = `node-${Date.now()}`;
    let x = 300, y = 200;
    const pane = document.querySelector('.react-flow__pane');
    if (pane) {
      const rect = pane.getBoundingClientRect();
      try {
        const c = screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        x = c.x - 90; y = c.y - 50;
      } catch { /* use defaults */ }
    }
    const newNode: Node = {
      id, type: 'topic',
      position: { x, y },
      data: { label: 'New Topic', color: '#f59e0b', status: 'draft', nodeType: 'lesson' },
    };
    pushHistory(nodes, edges);
    setNodes(nds => [...nds, newNode]);
  }, [readOnly, screenToFlowPosition, nodes, edges, pushHistory, setNodes]);

  // ── Delete selected ──────────────────────────────────────────────────────────
  const deleteSelected = useCallback(() => {
    if (readOnly) return;
    pushHistory(nodes, edges);
    setNodes(nds => nds.filter(n => !n.selected));
    setEdges(eds => eds.filter(e => !e.selected));
    setSelectedNodeId(null);
  }, [readOnly, nodes, edges, pushHistory, setNodes, setEdges]);

  // ── Auto layout (simple top→bottom dagre-style) ──────────────────────────────
  const autoLayout = useCallback(() => {
    const COLS = 3, X_GAP = 280, Y_GAP = 160, START_X = 100, START_Y = 100;
    setNodes(nds => nds.map((n, i) => ({
      ...n,
      position: { x: START_X + (i % COLS) * X_GAP, y: START_Y + Math.floor(i / COLS) * Y_GAP },
    })));
  }, [setNodes]);

  // ── Connections ──────────────────────────────────────────────────────────────
  const onConnect = useCallback((connection: Connection) => {
    pushHistory(nodes, edges);
    setEdges(eds => addEdge({ ...connection, type: 'smoothstep' }, eds));
  }, [nodes, edges, pushHistory, setEdges]);

  // ── Selection tracking ───────────────────────────────────────────────────────
  useEffect(() => {
    const sel = nodes.filter(n => n.selected);
    if (sel.length === 1) {
      setSelectedNodeId(sel[0].id);
      if (readOnly && onNodeSelect) onNodeSelect(sel[0]);
    } else {
      setSelectedNodeId(null);
    }
  }, [nodes, readOnly, onNodeSelect]);

  // ── Sync to TipTap ───────────────────────────────────────────────────────────
  const lastSyncRef = useRef('');
  useEffect(() => {
    if (readOnly || !onGraphChange) return;
    const json = JSON.stringify({
      nodes: nodes.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data })),
      edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
      background: bgStyle,
    });
    if (json !== lastSyncRef.current) { lastSyncRef.current = json; onGraphChange(json); }
  }, [nodes, edges, bgStyle, readOnly, onGraphChange]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (readOnly) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const mod = e.ctrlKey || e.metaKey;
      if (e.key.toLowerCase() === 'a' && !mod) addTopic();
      if (e.key.toLowerCase() === 'z' && mod && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.key.toLowerCase() === 'z' && mod && e.shiftKey) || (e.key.toLowerCase() === 'y' && mod)) { e.preventDefault(); redo(); }
      if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
      if (e.key.toLowerCase() === 'v' && !mod) setActiveTool('pointer');
      if (e.key.toLowerCase() === 'h' && !mod) setActiveTool('hand');
      if (e.key.toLowerCase() === 'c' && !mod) setActiveTool('connect');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [readOnly, addTopic, undo, redo, deleteSelected]);

  // ── Build nodes array for ReactFlow ─────────────────────────────────────────
  const nodesWithCallbacks = nodes.map(n => ({
    ...n,
    data: { ...n.data, readOnly, onUpdate: stableUpdateTopic },
  }));

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const currentNodeColor = (selectedNode?.data?.color as string) || '#f59e0b';

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        backgroundColor: bgStyle.bg,
        backgroundImage: bgStyle.bgImage
          ? `url(${bgStyle.bgImage})`
          : bgStyle.dots
            ? `radial-gradient(circle, ${bgStyle.dotColor} 1px, transparent 1px)`
            : 'none',
        backgroundSize: bgStyle.bgImage ? 'auto' : (bgStyle.dots ? '24px 24px' : undefined),
        backgroundPosition: 'top left',
        backgroundRepeat: bgStyle.bgImage ? 'repeat' : 'no-repeat'
      }}>

      {/* ── CSS: strip ReactFlow default node styling ─────────────────────── */}
      <style>{`
        .react-flow__node-topic,
        .react-flow__node-default {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          width: auto !important;
        }
        .react-flow__handle { opacity: 0; transition: opacity 0.15s; }
        .react-flow__node:hover .react-flow__handle,
        .react-flow__node.selected .react-flow__handle { opacity: 1; }
        .react-flow__pane { cursor: ${activeTool === 'hand' ? 'grab' : 'default'}; }
      `}</style>

      {/* ── React Flow Canvas ────────────────────────────────────────────── */}
      <ReactFlow
        className="w-full h-full"
        nodes={nodesWithCallbacks}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={() => setSelectedNodeId(null)}
        onDoubleClick={e => {
          if (readOnly) return;
          const target = e.target as HTMLElement;
          if (target.classList.contains('react-flow__pane')) addTopic();
        }}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly && activeTool === 'connect'}
        elementsSelectable={true}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.0 }}
        minZoom={0.1}
        maxZoom={2.5}
        connectionMode={ConnectionMode.Loose}
        panOnScroll={true}
        panOnDrag={activeTool === 'hand' ? true : [1]}
        zoomOnScroll={false}
        zoomActivationKeyCode="Control"
        deleteKeyCode={readOnly ? null : ['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
        snapToGrid={true}
        snapGrid={[20, 20]}
        defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color={bgStyle.dotColor}
          style={{ backgroundColor: 'transparent' }}
        />
        {showMinimap && (
          <MiniMap
            position="bottom-right"
            nodeColor={() => '#818cf8'}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              marginBottom: 80,
            }}
            maskColor="rgba(0,0,0,0.3)"
          />
        )}
      </ReactFlow>

      {/* ── Floating Toolbox (always visible, never conditional) ─────────── */}
      <FloatingRoadmapToolbar
        readOnly={readOnly}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        addTopic={addTopic}
        deleteSelected={deleteSelected}
        selectedNodeId={selectedNodeId}
        showMinimap={showMinimap}
        setShowMinimap={setShowMinimap}
        undo={undo}
        redo={redo}
        canUndo={historyRef.current.length > 0}
        canRedo={futureRef.current.length > 0}
        updateSelectedColor={color => stableUpdateTopic(selectedNodeId!, { color })}
        currentNodeColor={currentNodeColor}
        autoLayout={autoLayout}
        bgStyle={bgStyle}
        setBgStyle={setBgStyle}
      />

      {/* ── Properties Panel (slides in when node selected) ──────────────── */}
      {selectedNode && !readOnly && (
        <div className="absolute top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-sm border-l border-gray-100 shadow-2xl z-30 overflow-y-auto">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Node Properties</h3>
            <button onClick={() => setSelectedNodeId(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Title</label>
              <input
                type="text"
                value={(selectedNode.data.label as string) || ''}
                onChange={e => stableUpdateTopic(selectedNode.id, { label: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Color</label>
              <div className="flex gap-2 flex-wrap items-center">
                {NODE_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => stableUpdateTopic(selectedNode.id, { color: c })}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c, borderColor: selectedNode.data.color === c ? '#6366f1' : '#e5e7eb' }}
                  />
                ))}
                <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-dashed border-gray-300">
                  <input
                    type="color"
                    value={((selectedNode.data.color as string) || '#f59e0b').startsWith('#') ? (selectedNode.data.color as string).substring(0, 7) : '#f59e0b'}
                    onChange={e => stableUpdateTopic(selectedNode.id, { color: e.target.value })}
                    className="absolute inset-[-8px] w-12 h-12 cursor-pointer border-0 p-0"
                    title="Custom Color"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Linked Courses</label>
              <Popover open={openCourseSelect} onOpenChange={setOpenCourseSelect}>
                <PopoverTrigger>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 mb-4 bg-white hover:bg-gray-50"
                  >
                    <span className="truncate text-left flex-1 text-gray-700">
                      {((selectedNode.data.courseIds as string[]) || (selectedNode.data.courseId ? [selectedNode.data.courseId as string] : [])).length > 0
                        ? `${((selectedNode.data.courseIds as string[]) || (selectedNode.data.courseId ? [selectedNode.data.courseId as string] : [])).length} selected`
                        : "Select courses..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[260px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search courses..." />
                    <CommandList>
                      <CommandEmpty>No course found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            stableUpdateTopic(selectedNode.id, { courseIds: [], courseId: "" });
                            setOpenCourseSelect(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${!((selectedNode.data.courseIds as string[]) || (selectedNode.data.courseId ? [selectedNode.data.courseId as string] : [])).length ? "opacity-100" : "opacity-0"}`}
                          />
                          None
                        </CommandItem>
                        {publishedCourses.map((c) => {
                          const selectedCourseIds = (selectedNode.data.courseIds as string[]) || (selectedNode.data.courseId ? [selectedNode.data.courseId as string] : []);
                          const isSelected = selectedCourseIds.includes(c.id);
                          return (
                            <CommandItem
                              key={c.id}
                              value={c.title}
                              onSelect={() => {
                                const newIds = isSelected 
                                  ? selectedCourseIds.filter(id => id !== c.id)
                                  : [...selectedCourseIds, c.id];
                                stableUpdateTopic(selectedNode.id, { courseIds: newIds, courseId: undefined });
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${isSelected ? "opacity-100" : "opacity-0"}`}
                              />
                              {c.title}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Shape</label>
              <select
                value={(selectedNode.data.shape as string) || 'rectangle'}
                onChange={e => stableUpdateTopic(selectedNode.id, { shape: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="diamond">Diamond</option>
                <option value="hexagon">Hexagon</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Node Type</label>
              <select
                value={(selectedNode.data.nodeType as string) || 'lesson'}
                onChange={e => stableUpdateTopic(selectedNode.id, { nodeType: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="lesson">Lesson / Article</option>
                <option value="section">Section</option>
                <option value="quiz">Quiz</option>
                <option value="exercise">Exercise</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
              <textarea
                value={(selectedNode.data.description as string) || ''}
                onChange={e => stableUpdateTopic(selectedNode.id, { description: e.target.value })}
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Describe this topic..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function RoadmapCanvas(props: RoadmapCanvasProps) {
  return (
    <ReactFlowProvider>
      <RoadmapEditorProvider {...props}>
        <RoadmapCanvasInner {...props} />
      </RoadmapEditorProvider>
    </ReactFlowProvider>
  );
}
