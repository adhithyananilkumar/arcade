import { create } from 'zustand';
import { ValidationError, Scope } from '../types/iam.types';

interface PolicyEditorState {
  // Form state (owned by the editor)
  name: string;
  description: string;
  scope: Scope;

  // Selection state
  selectedBundles: string[];
  selectedPermissions: string[];
  expandedNodes: string[];

  // UI state
  showPermissionTree: boolean;
  selectedPermissionDetail: string | null;

  // Engine output
  validationErrors: ValidationError[];
  effectivePermissions: string[];

  // Actions
  setName: (name: string) => void;
  setDescription: (desc: string) => void;
  setScope: (scope: Scope) => void;
  toggleBundle: (bundleId: string) => void;
  togglePermission: (permissionId: string) => void;
  toggleNodeExpanded: (nodeId: string) => void;
  setShowPermissionTree: (show: boolean) => void;
  setSelectedPermissionDetail: (permissionId: string | null) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
  setEffectivePermissions: (permissions: string[]) => void;
  reset: () => void;
}

const initialState = {
  name: '',
  description: '',
  scope: 'PLATFORM' as Scope,
  selectedBundles: [],
  selectedPermissions: [],
  expandedNodes: [],
  showPermissionTree: false,
  selectedPermissionDetail: null,
  validationErrors: [],
  effectivePermissions: [],
};

export const usePolicyEditorStore = create<PolicyEditorState>((set) => ({
  ...initialState,

  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),
  setScope: (scope) => set({ scope }),

  toggleBundle: (bundleId) =>
    set((state) => ({
      selectedBundles: state.selectedBundles.includes(bundleId)
        ? state.selectedBundles.filter((id) => id !== bundleId)
        : [...state.selectedBundles, bundleId],
    })),

  togglePermission: (permissionId) =>
    set((state) => ({
      selectedPermissions: state.selectedPermissions.includes(permissionId)
        ? state.selectedPermissions.filter((id) => id !== permissionId)
        : [...state.selectedPermissions, permissionId],
    })),

  toggleNodeExpanded: (nodeId) =>
    set((state) => ({
      expandedNodes: state.expandedNodes.includes(nodeId)
        ? state.expandedNodes.filter((id) => id !== nodeId)
        : [...state.expandedNodes, nodeId],
    })),

  setShowPermissionTree: (show) => set({ showPermissionTree: show }),
  setSelectedPermissionDetail: (permissionId) => set({ selectedPermissionDetail: permissionId }),
  setValidationErrors: (errors) => set({ validationErrors: errors }),
  setEffectivePermissions: (permissions) => set({ effectivePermissions: permissions }),

  reset: () => set(initialState),
}));
