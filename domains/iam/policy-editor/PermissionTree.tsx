import { useState } from 'react';
import { PermissionNode } from '../types/iam.types';
import { usePolicyEditorStore } from '../store/policy-editor.store';
import { ChevronRight, ChevronDown, Check, Folder, Lock } from 'lucide-react';

interface PermissionTreeProps {
  nodes: PermissionNode[];
  level?: number;
}

export function PermissionTree({ nodes, level = 0 }: PermissionTreeProps) {
  return (
    <div className={`space-y-1 ${level > 0 ? 'ml-4 border-l border-gray-100 pl-3' : ''}`}>
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} level={level} />
      ))}
    </div>
  );
}

function TreeNode({ node, level }: { node: PermissionNode, level: number }) {
  const store = usePolicyEditorStore();
  const isExpanded = store.expandedNodes.includes(node.id);
  const isSelected = store.selectedPermissions.includes(node.id);
  const isLeaf = !node.children || node.children.length === 0;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    store.toggleNodeExpanded(node.id);
  };

  const toggleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real implementation, selecting a parent might select all children.
    // For now, we'll just select the specific node clicked.
    store.togglePermission(node.id);
  };

  const handleSelectDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    store.setSelectedPermissionDetail(node.id);
  };

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 cursor-pointer group ${store.selectedPermissionDetail === node.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
        onClick={handleSelectDetails}
      >
        {/* Expand/Collapse Caret */}
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          {!isLeaf ? (
            <button 
              onClick={toggleExpand}
              className="p-0.5 rounded hover:bg-gray-200 text-gray-500"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1"></div>
          )}
        </div>

        {/* Checkbox */}
        <button 
          onClick={toggleSelect}
          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 hover:border-indigo-400 bg-white'}`}
        >
          {isSelected && <Check size={12} strokeWidth={3} />}
        </button>

        {/* Icon based on node type */}
        <div className="shrink-0 text-gray-400">
          {!isLeaf ? <Folder size={14} /> : <Lock size={14} />}
        </div>

        {/* Node Name */}
        <span className="text-sm font-medium truncate">{node.name}</span>
        
        {/* Risk Indicator (Mocked for Leaf nodes) */}
        {isLeaf && node.metadata?.riskLevel === 'CRITICAL' && (
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 ml-auto" title="Critical Risk"></span>
        )}
        {isLeaf && node.metadata?.riskLevel === 'HIGH' && (
          <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0 ml-auto" title="High Risk"></span>
        )}
      </div>

      {/* Render Children */}
      {isExpanded && !isLeaf && (
        <div className="mt-1">
          <PermissionTree nodes={node.children!} level={level + 1} />
        </div>
      )}
    </div>
  );
}
