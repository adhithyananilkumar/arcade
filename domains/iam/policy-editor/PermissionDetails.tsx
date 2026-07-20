import { PermissionMetadata } from '../types/iam.types';
import { usePolicyEditorStore } from '../store/policy-editor.store';
import { Shield, Info, AlertTriangle, Link, Layers } from 'lucide-react';

interface PermissionDetailsProps {
  metadataMap: Record<string, PermissionMetadata>;
}

export function PermissionDetails({ metadataMap }: PermissionDetailsProps) {
  const store = usePolicyEditorStore();
  const selectedId = store.selectedPermissionDetail;

  if (!selectedId) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <Info className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm text-center px-4">Select a permission from the tree to view its details.</p>
      </div>
    );
  }

  const metadata = metadataMap[selectedId];

  if (!metadata) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600">
        <p className="font-mono mb-2 text-gray-900 font-medium">{selectedId}</p>
        <p>No metadata available for this permission.</p>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h4 className="font-mono text-sm font-bold text-gray-900 break-all">{selectedId}</h4>
        
        <div className="flex gap-2 mt-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRiskColor(metadata.riskLevel)}`}>
            <Shield className="w-3 h-3 mr-1" />
            {metadata.riskLevel} Risk
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-blue-50 text-blue-800 border-blue-200">
            <Layers className="w-3 h-3 mr-1" />
            {metadata.scope}
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h5>
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
          {metadata.description || 'No description provided.'}
        </p>
      </div>

      {/* Dependencies */}
      {metadata.dependencies && metadata.dependencies.length > 0 && (
        <div>
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Link className="w-3.5 h-3.5" />
            Requires
          </h5>
          <div className="space-y-1.5">
            {metadata.dependencies.map(dep => {
              const isDepSelected = store.selectedPermissions.includes(dep);
              return (
                <div key={dep} className={`flex items-center justify-between p-2 rounded text-sm ${isDepSelected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  <span className="font-mono text-xs">{dep}</span>
                  {!isDepSelected && <AlertTriangle className="w-4 h-4" aria-label="Dependency missing in selection" />}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">These permissions must also be granted.</p>
        </div>
      )}

      {/* Audit Info */}
      <div className="pt-4 border-t border-gray-100">
        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Audit Information</h5>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Introduced</dt>
            <dd className="font-medium text-gray-900">{metadata.introducedVersion || 'v1.0.0'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Category</dt>
            <dd className="font-medium text-gray-900">{metadata.category || 'General'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Status</dt>
            <dd className="font-medium text-green-600">Active</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
