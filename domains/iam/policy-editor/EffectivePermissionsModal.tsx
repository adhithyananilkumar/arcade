import { usePolicyEditorStore } from '../store/policy-editor.store';
import { X, Check } from 'lucide-react';

interface EffectivePermissionsModalProps {
  onClose: () => void;
}

export function EffectivePermissionsModal({ onClose }: EffectivePermissionsModalProps) {
  const store = usePolicyEditorStore();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Effective Permissions</h3>
            <p className="text-sm text-gray-500">The complete list of permissions this policy will grant.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {/* Summary */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <p className="text-sm font-semibold text-indigo-800">Total Permissions</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{store.effectivePermissions.length}</p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
              <p className="text-sm font-semibold text-gray-700">Included Bundles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{store.selectedBundles.length}</p>
            </div>
          </div>

          <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Expanded List</h4>
          
          <div className="space-y-1">
            {store.effectivePermissions.length === 0 ? (
              <p className="text-gray-500 italic text-sm">No permissions are currently granted by this policy.</p>
            ) : (
              store.effectivePermissions.map(perm => (
                <div key={perm} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100">
                  <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="font-mono text-sm text-gray-800">{perm}</span>
                  
                  {/* Origin Indicator (Mock logic) */}
                  {store.selectedPermissions.includes(perm) && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">Direct</span>
                  )}
                  {!store.selectedPermissions.includes(perm) && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-100">Bundle</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
