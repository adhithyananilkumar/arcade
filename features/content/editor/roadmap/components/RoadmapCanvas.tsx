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
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow,
  useOnSelectionChange,
  OnSelectionChangeParams,
  BackgroundVariant,
  MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { RoadmapData } from '../types';
import { Plus } from 'lucide-react';
import { LearningNode } from './LearningNode';
import { ProgressEdge } from './ProgressEdge';
import { PropertiesPanel } from './PropertiesPanel';
import { CanvasContextMenu } from './CanvasContextMenu';
import { RoadmapToolbar, ToolbarMode } from './RoadmapToolbar';
import { AppearancePanel, CanvasAppearance, defaultAppearance } from './AppearancePanel';

interface RoadmapCanvasProps {
  roadmap: RoadmapData;
  saveState: 'saved' | 'saving' | 'unsaved' | 'error' | 'conflict';
  onGraphChange: (graphJson: string) => void;
  onManualSave: () => void;
  readOnly?: boolean;
  onNodeSelect?: (node: Node) => void;
}

const nodeTypes = {
  default: LearningNode,
};

const edgeTypes = {
  progress: ProgressEdge,
};

function RoadmapCanvasInner({ roadmap, saveState, onGraphChange, onManualSave, readOnly, onNodeSelect }: RoadmapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition, fitView, setNodes: setNodesFlow, getViewport, setViewport } = useReactFlow();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appearance, setAppearance] = useState<CanvasAppearance>(defaultAppearance);
  const [activeTool, setActiveTool] = useState<ToolbarMode>('pointer');
  const [showMinimap, setShowMinimap] = useState(true);

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
        parsedEdges = (parsed.edges || []).map((e: any) => {
          let sHandle = e.sourceHandle || 'bottom';
          let tHandle = e.targetHandle || 'top';
          sHandle = sHandle.replace('-s', '').replace('-t', '');
          tHandle = tHandle.replace('-s', '').replace('-t', '');
          return {
            ...e,
            sourceHandle: sHandle,
            targetHandle: tHandle,
          };
        });
        if (parsed.viewport) {
          parsedViewport = parsed.viewport;
        }
        if (parsed.appearance) {
          setAppearance({ ...defaultAppearance, ...parsed.appearance });
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

  const nodesRef = useRef<Node[]>([]);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);



  const processCompletedNodes = useCallback((nodeIdsToProcess: Set<string>) => {
    if (nodeIdsToProcess.size === 0) return;

    setEdges(currentEdges => {
      let edgesChanged = false;
      const nextEdges = currentEdges.map(edge => {
        if (nodeIdsToProcess.has(edge.source) && (!edge.data || (edge.data.status !== 'completed' && edge.data.status !== 'animating'))) {
          edgesChanged = true;
          return { ...edge, data: { ...edge.data, status: 'animating' } };
        }
        return edge;
      });
      return edgesChanged ? nextEdges : currentEdges;
    });

    setTimeout(() => {
      const nextBatchIds = new Set<string>();
      
      setEdges(currentEdges => {
        let edgesChanged = false;
        const nextEdges = currentEdges.map(edge => {
          if (nodeIdsToProcess.has(edge.source) && edge.data?.status === 'animating') {
            edgesChanged = true;
            const targetNode = nodesRef.current.find(n => n.id === edge.target);
            if (targetNode?.data.completed) {
              nextBatchIds.add(targetNode.id);
            }
            return { ...edge, data: { ...edge.data, status: 'completed' } };
          }
          return edge;
        });
        return edgesChanged ? nextEdges : currentEdges;
      });
      
      if (nextBatchIds.size > 0) {
        processCompletedNodes(nextBatchIds);
      }
    }, 700);
  }, [setEdges]);

  // Handle edge states (e.g. newly drawn edges, loaded from save, or stuck in gray)
  useEffect(() => {
    const edgesToUpdate = new Set<string>();
    
    edges.forEach(e => {
      if (e.data?.status === 'completed' || e.data?.status === 'animating') return;
      
      const sourceNode = nodesRef.current.find(n => n.id === e.source);
      if (sourceNode?.data.completed) {
        edgesToUpdate.add(e.source);
      }
    });

    if (edgesToUpdate.size > 0) {
      setTimeout(() => {
        processCompletedNodes(edgesToUpdate);
      }, 100);
    }
  }, [edges, processCompletedNodes]);

  const previousNodesRef = useRef<Node[]>([]);
  
  useEffect(() => {
    const prevNodes = previousNodesRef.current;
    if (prevNodes.length === 0) {
      previousNodesRef.current = nodes;
      return;
    }
    
    const newlyCompletedNodes = nodes.filter(n => {
      const prev = prevNodes.find(p => p.id === n.id);
      return n.data.completed && (!prev || !prev.data.completed);
    });

    previousNodesRef.current = nodes;

    if (newlyCompletedNodes.length > 0) {
      const newlyCompletedIds = new Set(newlyCompletedNodes.map(n => n.id));
      processCompletedNodes(newlyCompletedIds);
    }
  }, [nodes, processCompletedNodes]);

  useOnSelectionChange({
    onChange: ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length === 1) {
        setSelectedNodeId(selectedNodes[0].id);
        if (readOnly && onNodeSelect) {
          onNodeSelect(selectedNodes[0]);
        }
      } else {
        setSelectedNodeId(null);
        if (readOnly && onNodeSelect) {
          // Pass null to clear selection, wait onNodeSelect expects Node.
        }
      }
    },
  });

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  const onConnect = useCallback(
    (params: Connection) => {
      console.log('onConnect fired:', params);
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  const addTopic = useCallback(() => {
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
    const selectedNodeIds = new Set(nodes.filter(n => n.selected).map(n => n.id));
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected && !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)));
  }, [nodes, setNodes, setEdges, readOnly]);

  const addChild = useCallback(() => {
    if (!selectedNodeId) return;
    const parentNode = nodes.find(n => n.id === selectedNodeId);
    if (!parentNode) return;

    const id = `node-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'default',
      position: { x: parentNode.position.x, y: parentNode.position.y + 150 },
      data: { label: 'New Topic', color: parentNode.data.color || 'bg-white' },
    };
    
    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => eds.concat({
      id: `e-${parentNode.id}-${id}`,
      source: parentNode.id,
      target: id,
      type: 'progress'
    }));
  }, [nodes, selectedNodeId, setNodes, setEdges, readOnly]);

  const centerSelection = useCallback(() => {
    if (!selectedNodeId) return;
    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    if (selectedNode) {
      fitView({
        nodes: [selectedNode],
        duration: 500,
        padding: 2,
        minZoom: 1,
        maxZoom: 1.5,
      });
    }
  }, [nodes, selectedNodeId, fitView]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (readOnly) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if we are typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      } else if (e.key.toLowerCase() === 'v' && !ctrlOrCmd) {
        setActiveTool('pointer');
      } else if (e.key.toLowerCase() === 'h' && !ctrlOrCmd) {
        setActiveTool('hand');
      } else if (e.key.toLowerCase() === 'c' && !ctrlOrCmd) {
        setActiveTool('connect');
      } else if (e.key.toLowerCase() === 'a' && !ctrlOrCmd) {
        if (e.shiftKey) {
          addChild();
        } else {
          addTopic();
        }
      } else if (e.key.toLowerCase() === 'f' && !ctrlOrCmd) {
        if (e.shiftKey) {
          centerSelection();
        } else {
          fitView({ duration: 500, padding: 0.2 });
        }
      } else if (e.key.toLowerCase() === 'g' && !ctrlOrCmd) {
        setShowGrid(prev => !prev);
      } else if (e.key.toLowerCase() === 'm' && !ctrlOrCmd) {
        setShowMinimap(prev => !prev);
      } else if (e.key.toLowerCase() === 's' && ctrlOrCmd) {
        e.preventDefault();
        onManualSave();
      } else if (e.key.toLowerCase() === 'k' && ctrlOrCmd) {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setActiveTool('pointer');
        setIsSearchOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, addTopic, addChild, centerSelection, fitView, onManualSave, readOnly]);

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
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, ...newData } };
        }
        return n;
      })
    );
  }, [setNodes]);

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



  const lastSavedJsonRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    const cleanNodes = nodes.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data }));
    const cleanEdges = edges.map(e => ({ id: e.id, source: e.source, target: e.target, data: e.data }));
    const newGraphJson = JSON.stringify({ nodes: cleanNodes, edges: cleanEdges, viewport: getViewport(), appearance });
    
    if (lastSavedJsonRef.current !== newGraphJson && lastSavedJsonRef.current !== null) {
      lastSavedJsonRef.current = newGraphJson;
      onGraphChange(newGraphJson);
    } else if (lastSavedJsonRef.current === null) {
      lastSavedJsonRef.current = newGraphJson;
    }
  }, [nodes, edges, appearance, onGraphChange, getViewport]);

  const onMoveEnd = useCallback(() => {
    // When panning/zooming stops, trigger a change check
    const cleanNodes = nodes.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data }));
    const cleanEdges = edges.map(e => ({ id: e.id, source: e.source, target: e.target }));
    const newGraphJson = JSON.stringify({ nodes: cleanNodes, edges: cleanEdges, viewport: getViewport(), appearance });
    
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
      const nodeData: Record<string, unknown> = { 
        ...n.data, 
        validationError,
        onUpdate: updateNodeData
      };
      if (readOnly) {
        nodeData.readOnly = true;
      }
      
      return { ...n, data: nodeData };
    });
  }, [nodes, readOnly]);



  const hasSelection = nodes.some(n => n.selected) || edges.some(e => e.selected);

  return (
    <div className="flex w-full h-[600px] rounded-lg border border-gray-200 bg-white overflow-hidden relative">
      <div className="flex-1 relative" onWheel={(e) => e.stopPropagation()}>
        {nodes.length === 0 && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
            <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 pointer-events-auto">
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
        )}
        <RoadmapToolbar
          activeTool={activeTool}
          onChangeActiveTool={setActiveTool}
          onAddTopic={addTopic}
          onAddChild={addChild}
          onDeleteSelected={deleteSelected}
          onFitView={() => fitView({ duration: 500, padding: 0.2 })}
          onCenterSelection={centerSelection}
          onToggleMinimap={() => setShowMinimap(!showMinimap)}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onOpenSearch={() => setIsSearchOpen(!isSearchOpen)}
          onOpenBackgroundSettings={() => setIsSettingsOpen(!isSettingsOpen)}
          hasSelection={hasSelection}
          saveState={saveState}
          onSave={onManualSave}
          readOnly={readOnly}
        />
        
        <style>{`
          .react-flow__nodesselection-rect {
            display: none !important;
          }
          .react-flow__pane {
            cursor: grab;
          }
          .react-flow__pane:active {
            cursor: grabbing;
          }
          /* Remove default wrapper styles so only our custom node is visible */
          .react-flow__node-default {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            border-radius: 0 !important;
            width: auto !important;
          }
          .react-flow__node.selected {
            /* We handle selection state inside our own LearningNode component */
            box-shadow: none !important;
          }
        `}</style>
        <ReactFlow
          nodes={validatedNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{
            type: 'progress',
            style: { strokeWidth: 2, stroke: '#94a3b8', transition: 'stroke-width 0.2s, stroke 0.2s' },
            pathOptions: { borderRadius: 16 }
          }}
          panOnDrag={activeTool === 'hand' || activeTool === 'pointer'}
          selectionOnDrag={activeTool === 'pointer'}
          panOnScroll={true}
          selectionMode="partial"
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={(e) => e.preventDefault()}
          onPaneClick={() => setContextMenu(null)}
          onMoveEnd={onMoveEnd}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          snapToGrid={true}
          snapGrid={[20, 20]}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          connectionRadius={40}
          connectionMode={ConnectionMode.Loose}
          isValidConnection={() => true}
          style={{
            backgroundColor: appearance.backgroundType === 'color' ? appearance.backgroundColor : 'transparent',
            backgroundImage: appearance.backgroundType === 'gradient' && appearance.gradient ? appearance.gradient : appearance.backgroundType === 'image' && appearance.image?.url ? `url(${appearance.image.url})` : 'none',
            backgroundSize: appearance.backgroundType === 'image' && appearance.image?.display === 'fill' ? 'cover' : appearance.backgroundType === 'image' && appearance.image?.display === 'fit' ? 'contain' : 'auto',
            backgroundRepeat: appearance.backgroundType === 'image' && appearance.image?.display === 'tile' ? 'repeat' : 'no-repeat',
            backgroundPosition: 'center',
            filter: appearance.backgroundType === 'image' && appearance.image?.blur > 0 ? `blur(${appearance.image.blur}px)` : 'none',
          }}
        >
          {appearance.advanced.noise && (
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
          )}
          {appearance.grid.show && (
            <Background 
              variant={appearance.grid.type === 'dots' ? BackgroundVariant.Dots : appearance.grid.type === 'lines' ? BackgroundVariant.Lines : BackgroundVariant.Cross} 
              gap={appearance.grid.size} 
              size={appearance.grid.type === 'dots' ? 2 : 1} 
              color={appearance.grid.color} 
              style={{ opacity: appearance.grid.opacity }}
            />
          )}
          {/* Note: Minimap state is separate since it's a view toggle not saved with appearance */}
          {showMinimap && <MiniMap />}
        </ReactFlow>

        {/* Command Search Popover */}
        {isSearchOpen && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 bg-[#1E1E1E]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 z-50 animate-in zoom-in-95 duration-200">
            <input 
              autoFocus
              type="text" 
              placeholder="Search topics (Ctrl+K)..." 
              className="w-full bg-transparent text-white text-lg outline-none px-4 py-3 placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsSearchOpen(false);
              }}
            />
            {searchQuery && (
              <div className="px-4 pb-2 text-xs text-gray-400">
                Found matching topics. Hit Enter or Esc to close.
              </div>
            )}
          </div>
        )}

        {/* Canvas Settings Popover */}
        {isSettingsOpen && (
          <AppearancePanel
            appearance={appearance}
            onChange={(newAppearance) => {
              setAppearance(newAppearance);
              if (!readOnly) onManualSave();
            }}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}


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

      {selectedNode && (
        <PropertiesPanel
          selectedNode={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={updateNodeData}
          roadmapId={roadmap.id}
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
