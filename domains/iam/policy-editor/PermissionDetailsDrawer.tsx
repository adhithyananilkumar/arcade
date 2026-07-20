'use client';

import { PermissionMetadata } from '../types/iam.types';
import { usePolicyEditorStore } from '../store/policy-editor.store';
import { X, Shield, Link, AlertTriangle } from 'lucide-react';

interface PermissionDetailsDrawerProps {
  metadataMap: Record<string, PermissionMetadata>;
}

const RISK_STYLES: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  LOW: 'bg-green-100 text-green-800 border-green-200',
};

export function PermissionDetailsDrawer({ metadataMap }: PermissionDetailsDrawerProps) {
  const store = usePolicyEditorStore();
  const selectedId = store.selectedPermissionDetail;
  const isOpen = !!selectedId;
  const metadata = selectedId ? metadataMap[selectedId] : undefined;

  return (
    <>
      {/* Overlay (click to close) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => store.setSelectedPermissionDetail(null)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-96 max-w-full bg-white shadow-2xl border-l border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <h3 className="text-sm font-bold text-gray-900">Permission Details</h3>
          <button
            onClick={() => store.setSelectedPermissionDetail(null)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!selectedId ? null : !metadata ? (
            <div className="space-y-3">
              <p className="font-mono text-sm font-bold text-gray-900 break-all">{selectedId}</p>
              <p className="text-sm text-gray-500">No metadata is available for this permission.</p>
            </div>
          ) : (
            <>
              {/* Permission ID */}
              <div>
                <p className="font-mono text-sm font-bold text-gray-900 break-all leading-relaxed">
                  {selectedId}
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${RISK_STYLES[metadata.riskLevel]}`}
                  >
                    <Shield size={10} />
                    {metadata.riskLevel} Risk
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-blue-50 text-blue-800 border-blue-200">
                    {metadata.scope}
                  </span>
                  {metadata.deprecated && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-600 border-gray-200">
                      Deprecated
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {metadata.description ?? 'No description provided.'}
                </p>
              </div>

              {/* Dependencies */}
              {metadata.dependencies && metadata.dependencies.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Link size={11} />
                    Requires
                  </h4>
                  <div className="space-y-1.5">
                    {metadata.dependencies.map((dep) => {
                      const isMissing = !store.selectedPermissions.includes(dep) &&
                        !store.effectivePermissions.includes(dep);
                      return (
                        <div
                          key={dep}
                          className={`flex items-center justify-between p-2.5 rounded-lg text-xs ${
                            isMissing
                              ? 'bg-red-50 border border-red-100 text-red-700'
                              : 'bg-green-50 border border-green-100 text-green-700'
                          }`}
                        >
                          <span className="font-mono">{dep}</span>
                          {isMissing && <AlertTriangle size={13} />}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    These permissions must also be granted.
                  </p>
                </div>
              )}

              {/* Audit */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Details
                </h4>
                <dl className="space-y-2.5 text-sm">
                  {metadata.category && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Category</dt>
                      <dd className="font-medium text-gray-900">{metadata.category}</dd>
                    </div>
                  )}
                  {metadata.introducedVersion && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Since</dt>
                      <dd className="font-medium text-gray-900">{metadata.introducedVersion}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Status</dt>
                    <dd className={`font-medium ${metadata.deprecated ? 'text-orange-600' : 'text-green-600'}`}>
                      {metadata.deprecated ? 'Deprecated' : 'Active'}
                    </dd>
                  </div>
                </dl>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
