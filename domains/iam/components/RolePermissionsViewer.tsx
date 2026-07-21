'use client';

import { useState, useMemo } from 'react';
import { Role } from "@/domains/identity";
import { ChevronDown, ChevronRight, Search, CheckCircle, ShieldCheck } from 'lucide-react';
import { ScrollArea } from "@/shared/design-system/ui/scroll-area";
import { Button, buttonVariants } from "@/shared/design-system/ui/button";
import { Input } from "@/shared/design-system/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/design-system/ui/dialog";

interface RolePermissionsViewerProps {
  role: Role;
}

const formatPermissionKey = (key: string) => {
  if (!key) return '';
  if (key === 'ALL') return 'All Channel Permissions';
  const parts = key.split('.');
  const capitalized = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
  if (capitalized.length >= 2) {
    const action = capitalized.pop();
    const resource = capitalized.join(' ');
    return `${action} ${resource}`;
  }
  return key;
};

const getCategory = (code: string) => {
  if (code === 'ALL') return 'Ownership';
  if (code.includes('settings')) return 'Settings';
  if (code.includes('roles') || code.includes('policies')) return 'Roles & Policies';
  if (code.includes('members') || code.includes('staff') || code.includes('invitations')) return 'Members';
  if (code.includes('courses') || code.includes('quizzes') || code.includes('roadmaps') || code.includes('lessons')) return 'Content Management';
  if (code.includes('media') || code.includes('videos')) return 'Media';
  if (code.includes('analytics')) return 'Analytics';
  if (code.includes('notifications')) return 'Notifications';
  if (code.includes('certificates')) return 'Certificates';
  if (code.includes('owner')) return 'Ownership';
  return 'Other';
};

export function RolePermissionsViewer({ role }: RolePermissionsViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const permissions = useMemo(() => role.permissions || [], [role.permissions]);
  
  const isOwnerRole = role.code === 'OWNER' || permissions.some(p => p.code === 'ALL');

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, typeof permissions> = {};
    permissions.forEach(p => {
      if (p.code === 'ALL') return; // Handled separately if needed, but we can include it
      const cat = getCategory(p.code);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [permissions]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groupedPermissions;
    const lowerQ = searchQuery.toLowerCase();
    const filtered: Record<string, typeof permissions> = {};
    Object.entries(groupedPermissions).forEach(([cat, perms]) => {
      const matchingPerms = perms.filter(p => 
        formatPermissionKey(p.code).toLowerCase().includes(lowerQ) ||
        p.code.toLowerCase().includes(lowerQ)
      );
      if (matchingPerms.length > 0 || cat.toLowerCase().includes(lowerQ)) {
        filtered[cat] = matchingPerms.length > 0 ? matchingPerms : perms;
      }
    });
    return filtered;
  }, [groupedPermissions, searchQuery]);

  if (isOwnerRole) {
    return (
      <div className="mt-auto pt-4 border-t border-gray-50">
        <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Permissions ({permissions.length})</p>
        <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 mb-3">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">All Channel Permissions</span>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm", className: "w-full text-xs font-semibold" })}>
            Show All Permissions
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" />
                {role.displayName} Permissions
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 bg-indigo-50 text-indigo-800 rounded-lg text-sm mb-2 flex items-center gap-2">
              <CheckCircle size={18} />
              This role has full administrative access and includes all {permissions.length} channel permissions.
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search permissions..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto -mx-6 px-6">
              <div className="space-y-4 pb-4">
                {Object.entries(filteredGroups).sort().map(([cat, perms]) => (
                  <div key={cat} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
                        {expandedCategories[cat] !== false ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        {cat} <span className="text-gray-500 font-normal text-xs">({perms.length})</span>
                      </div>
                    </button>
                    {expandedCategories[cat] !== false && (
                      <div className="p-3 bg-white divide-y divide-gray-100">
                        {perms.map(p => (
                          <div key={p.id} className="py-2 text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                            <span>{formatPermissionKey(p.code)}</span>
                            <span className="text-xs text-gray-400 font-mono ml-auto hidden sm:inline-block">{p.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {Object.keys(filteredGroups).length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No permissions match your search.
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Custom role rendering
  return (
    <div className="mt-auto pt-4 border-t border-gray-50">
      <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Permissions ({permissions.length})</p>
      
      {permissions.length === 0 ? (
        <span className="text-xs text-gray-400 italic">No permissions assigned</span>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm", className: "w-full text-xs font-semibold text-gray-500 hover:text-gray-900 border-dashed" })}>
            View {permissions.length} Permissions
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="text-gray-700" />
                {role.displayName} Permissions
              </DialogTitle>
            </DialogHeader>
            
            <div className="relative mb-4 mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search permissions..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto -mx-6 px-6">
              <div className="space-y-4 pb-4">
                {Object.entries(filteredGroups).sort().map(([cat, perms]) => (
                  <div key={cat} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
                        {expandedCategories[cat] !== false ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        {cat} <span className="text-gray-500 font-normal text-xs">({perms.length})</span>
                      </div>
                    </button>
                    {expandedCategories[cat] !== false && (
                      <div className="p-3 bg-white divide-y divide-gray-100">
                        {perms.map(p => (
                          <div key={p.id} className="py-2 text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                            <span>{formatPermissionKey(p.code)}</span>
                            <span className="text-xs text-gray-400 font-mono ml-auto hidden sm:inline-block">{p.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {Object.keys(filteredGroups).length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No permissions match your search.
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
