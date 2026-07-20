export type Scope = 'PLATFORM' | 'PUBLISHER' | 'CHANNEL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PermissionMetadata {
  description?: string;
  scope: Scope;
  riskLevel: RiskLevel;
  introducedVersion?: string;
  category?: string;
  dependencies?: string[];
  dependents?: string[];
  deprecated?: boolean;
}

export interface PermissionNode {
  id: string; // e.g. "platform.channels.manage"
  name: string; // e.g. "Manage"
  children?: PermissionNode[];
  metadata?: PermissionMetadata;
}

export interface ManagedBundle {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  includedBundles?: string[];
  /** True = shipped by Arcade. False = created by an admin of this scope. */
  isManaged?: boolean;
}

export interface IAMRevision {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  changes: string;
}

export interface ValidationError {
  type: 'MISSING_DEPENDENCY' | 'DANGEROUS_PERMISSION' | 'SCOPE_MISMATCH';
  message: string;
  details?: any;
}

export interface PolicySimulatorRequest {
  userId: string;
  action: string;
  resourceId?: string;
}

export interface PolicySimulatorResult {
  result: 'ALLOW' | 'DENY';
  reason: string;
  inheritedFrom?: string[];
  missingPermissions?: string[];
}
