import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { 
  ReactFlow, 
  Background, 
  Node, 
  Edge, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  ReactFlowProvider,
  useReactFlow,
  useOnSelectionChange,
  OnSelectionChangeParams
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { RoadmapData } from '../types';
import { Plus } from 'lucide-react';
import { LearningNode } from './LearningNode';
import { PropertiesPanel } from './PropertiesPanel';
import { CanvasContextMenu } from './CanvasContextMenu';
import { RoadmapToolbar } from './RoadmapToolbar';

interface RoadmapCanvasProps {
  roadmap: RoadmapData;
  saveState: 'saved' | 'saving' | 'unsaved' | 'error' | 'conflict';
  onGraphChange: (graphJson: string) => void;
  onManualSave: () => void;
  readOnly?: boolean;
}

const nodeTypes = {
  default: LearningNode,
};

function RoadmapCanvasInner({ roadmap, saveState, onGraphChange, onManualSave, readOnly }: RoadmapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition, fitView, setNodes: setNodesFlow, getViewport, setViewport } = useReactFlow();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load initial state
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    let parsedNodes: Node[] = [];
    let parsedEdges: Edge[] = [];
    let parsedViewport = { x: 0, y: 0, zoom: 1 };

    if (roadmap.graphJson) {
      try {
        const parsed = JSON.parse(roadmap.graphJson);
        parsedNodes = parsed.nodes || [];
        parsedEdges = parsed.edges || [];
        if (parsed.viewport) {
          parsedViewport = parsed.viewport;
        }
      } catch (e) {
        console.error("Failed to parse graphJson", e);
      }
    }

    setNodes(parsedNodes.map(n => ({ ...n, type: 'default' })));
    setEdges(parsedEdges);
    setViewport(parsedViewport);
    isInitializedRef.current = true;
  }, [roadmap.graphJson, setNodes, setEdges, setViewport]);

  // Handle Search Filtering & Highlighting
  useEffect(() => {
    if (!searchQuery) {
      setNodes((nds) => nds.map(n => ({ ...n, style: { ...n.style, opacity: 1 } })));
      return;
    }
    
    const query = searchQuery.toLowerCase();
    let hasMatch = false;
    
    setNodes((nds) => nds.map(n => {
      const label = (n.data.label as string || '').toLowerCase();
      const nodeType = (n.data.nodeType as string || 'lesson').toLowerCase();
      
      const isMatch = label.includes(query) || nodeType.includes(query);
      if (isMatch) hasMatch = true;
      return {
        ...n,
        style: { ...n.style, opacity: isMatch ? 1 : 0.2 },
      };
    }));

    if (hasMatch) {
      setTimeout(() => {
        const matchingNodeIds = nodes.filter(n => {
          const label = (n.data.label as string || '').toLowerCase();
          const nodeType = (n.data.nodeType as string || 'lesson').toLowerCase();
          return label.includes(query) || nodeType.includes(query);
        }).map(n => n.id);
        if (matchingNodeIds.length > 0) {
          fitView({ nodes: nodes.filter(n => matchingNodeIds.includes(n.id)), duration: 500, padding: 0.5 });
        }
      }, 50);
    }
  }, [searchQuery, setNodes, fitView, nodes.length]);

  useOnSelectionChange({
    onChange: ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length === 1) {
        setSelectedNodeId(selectedNodes[0].id);
      } else {
        setSelectedNodeId(null);
      }
    },
  });

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, readOnly],
  );

  const addTopic = useCallback(() => {
    if (readOnly) return;
    const id = `node-${Date.now()}`;
    const domNode = document.querySelector('.react-flow__pane');
    let x = 200;
    let y = 200;
    
    if (domNode) {
      const rect = domNode.getBoundingClientRect();
      const center = screenToFlowPosition({
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      });
      x = center.x;
      y = center.y;
    }

    const newNode: Node = {
      id,
      type: 'default',
      position: { x, y },
      data: { label: 'New Topic', color: 'bg-white' },
    };
    
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, setNodes, readOnly]);

  const deleteSelected = useCallback(() => {
    if (readOnly) return;
    const selectedNodeIds = new Set(nodes.filter(n => n.selected).map(n => n.id));
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected && !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)));
  }, [nodes, setNodes, setEdges, readOnly]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (readOnly) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if we are typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'Delete') {
        deleteSelected();
      } else if (e.key === 'F2') {
        // Trigger rename mode on selected node (TopicNode handles double click, we can pass rename state if we wanted, 
        // but for now properties panel provides rename)
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, readOnly]);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (readOnly) return;
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    [readOnly]
  );

  const updateNodeData = useCallback((id: string, newData: any) => {
    if (readOnly) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, ...newData } };
        }
        return n;
      })
    );
  }, [setNodes, readOnly]);

  const handleDuplicate = useCallback((id: string) => {
    if (readOnly) return;
    const nodeToDuplicate = nodes.find(n => n.id === id);
    if (!nodeToDuplicate) return;
    
    const newNode: Node = {
      ...nodeToDuplicate,
      id: `node-${Date.now()}`,
      position: { x: nodeToDuplicate.position.x + 50, y: nodeToDuplicate.position.y + 50 },
      selected: false,
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes, readOnly]);

  const handleDeleteNode = useCallback((id: string) => {
    if (readOnly) return;
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, [setNodes, setEdges, readOnly]);

  // Trigger graph change when elements or viewport change
  const handleGraphChange = useCallback(() => {
    if (!isInitializedRef.current || readOnly) return;
    
    // Clean up nodes for saving (remove selected state, etc)
    const cleanNodes = nodes.map(n => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
    }));
    
    const cleanEdges = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));
    
    const viewport = getViewport();
    
    const newGraphJson = JSON.stringify({
      nodes: cleanNodes,
      edges: cleanEdges,
      viewport
    });
    
    onGraphChange(newGraphJson);
  }, [nodes, edges, getViewport, onGraphChange, readOnly]);

  // Hook up graph changes to our handler, but we must be careful not to trigger on every render.
  // We'll use a ref to track the last saved JSON to avoid unnecessary saves.
  const lastSavedJsonRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!isInitializedRef.current || readOnly) return;
    
    const cleanNodes = nodes.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data }));
    const cleanEdges = edges.map(e => ({ id: e.id, source: e.source, target: e.target }));
    const newGraphJson = JSON.stringify({ nodes: cleanNodes, edges: cleanEdges, viewport: getViewport() });
    
    if (lastSavedJsonRef.current !== newGraphJson) {
      lastSavedJsonRef.current = newGraphJson;
      onGraphChange(newGraphJson);
    }
  }, [nodes, edges, onGraphChange, getViewport, readOnly]);

  const onMoveEnd = useCallback(() => {
    if (readOnly) return;
    // When panning/zooming stops, trigger a change check
    const cleanNodes = nodes.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data }));
    const cleanEdges = edges.map(e => ({ id: e.id, source: e.source, target: e.target }));
    const newGraphJson = JSON.stringify({ nodes: cleanNodes, edges: cleanEdges, viewport: getViewport() });
    
    if (lastSavedJsonRef.current !== newGraphJson) {
      lastSavedJsonRef.current = newGraphJson;
      onGraphChange(newGraphJson);
    }
  }, [nodes, edges, getViewport, onGraphChange, readOnly]);

  const validatedNodes = useMemo(() => {
    const contentIds = new Set<string>();
    const duplicates = new Set<string>();
    
    nodes.forEach(n => {
      const cid = n.data.contentId as string;
      if (cid) {
        if (contentIds.has(cid)) duplicates.add(cid);
        contentIds.add(cid);
      }
    });

    return nodes.map(n => {
      let validationError = undefined;
      const label = n.data.label as string;
      const cid = n.data.contentId as string;
      
      if (!label || label.trim() === '') {
        validationError = 'Missing required title.';
      } else if (cid && duplicates.has(cid)) {
        validationError = 'Duplicate content linked across multiple nodes.';
      }
      
      // Override properties if read-only
      const nodeData = { ...n.data, validationError };
      if (readOnly) {
        nodeData.readOnly = true;
      }
      
      return { ...n, data: nodeData };
    });
  }, [nodes, readOnly]);

  if (nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 relative">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 mb-4">No topics yet.</p>
          <p className="text-xs text-gray-400 mb-6">Create your first topic to start building the roadmap.</p>
          {!readOnly && (
            <button
              onClick={addTopic}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Create Topic
            </button>
          )}
        </div>
      </div>
    );
  }

  const hasSelection = nodes.some(n => n.selected) || edges.some(e => e.selected);

  return (
    <div className="flex w-full h-[600px] rounded-lg border border-gray-200 bg-white overflow-hidden relative">
      <div className="flex-1 relative" onWheel={(e) => e.stopPropagation()}>
        <RoadmapToolbar
          onAddTopic={addTopic}
          onDeleteSelected={deleteSelected}
          onFitView={() => fitView({ duration: 500, padding: 0.2 })}
          hasSelection={hasSelection}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          saveState={saveState}
          onSave={onManualSave}
          readOnly={readOnly}
        />
        
        <ReactFlow
          nodes={validatedNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={readOnly ? undefined : onNodesChange}
          onEdgesChange={readOnly ? undefined : onEdgesChange}
          onConnect={readOnly ? undefined : onConnect}
          onNodeContextMenu={onNodeContextMenu}
          onMoveEnd={onMoveEnd}
          fitView={!roadmap.graphJson || !roadmap.graphJson.includes('"viewport"')}
          minZoom={0.1}
          maxZoom={2}
          snapToGrid={true}
          snapGrid={[20, 20]}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={true}
        >
          <Background gap={20} color="#e5e7eb" />
        </ReactFlow>

        {contextMenu && !readOnly && (
          <CanvasContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            node={nodes.find(n => n.id === contextMenu.nodeId) || null}
            onClose={() => setContextMenu(null)}
            onRename={() => {
              // Focus properties panel or update node directly.
              setSelectedNodeId(contextMenu.nodeId);
            }}
            onDuplicate={() => handleDuplicate(contextMenu.nodeId)}
            onDelete={() => handleDeleteNode(contextMenu.nodeId)}
            onChangeColor={() => setSelectedNodeId(contextMenu.nodeId)}
          />
        )}
      </div>

      {selectedNode && !readOnly && (
        <PropertiesPanel
          selectedNode={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={updateNodeData}
        />
      )}
    </div>
  );
}

export function RoadmapCanvas(props: RoadmapCanvasProps) {
  return (
    <ReactFlowProvider>
      <RoadmapCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
