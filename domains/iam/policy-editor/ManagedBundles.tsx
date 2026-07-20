import { useState } from 'react';
import { ManagedBundle } from '../types/iam.types';
import { usePolicyEditorStore } from '../store/policy-editor.store';
import { Search, Package, Plus, Check } from 'lucide-react';

interface ManagedBundlesProps {
  bundles: ManagedBundle[];
}

export function ManagedBundles({ bundles }: ManagedBundlesProps) {
  const store = usePolicyEditorStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBundles = bundles.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Search predefined policies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Bundles Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredBundles.map(bundle => {
          const isSelected = store.selectedBundles.includes(bundle.id);
          
          return (
            <div 
              key={bundle.id} 
              className={`relative rounded-xl border p-4 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/30' 
                  : 'border-gray-200 hover:border-gray-300 bg-white shadow-sm hover:shadow'
              }`}
              onClick={() => store.toggleBundle(bundle.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Package className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <h4 className="font-bold text-gray-900">{bundle.name}</h4>
                </div>
                
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-transparent bg-gray-50'
                }`}>
                  {isSelected ? <Check size={14} strokeWidth={3} /> : <Plus size={14} className="text-gray-400" />}
                </div>
              </div>
              
              <p className="mt-2 text-sm text-gray-500">
                {bundle.description}
              </p>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {bundle.permissions.length} Permissions
                </span>
                <button 
                  className="text-gray-500 hover:text-gray-900 underline underline-offset-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    // In a real app, this would show a modal with the expanded permissions
                    store.setEffectivePermissions(bundle.permissions);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredBundles.length === 0 && (
        <div className="text-center py-10 bg-white border border-gray-200 border-dashed rounded-xl">
          <p className="text-sm text-gray-500">No managed policies found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
