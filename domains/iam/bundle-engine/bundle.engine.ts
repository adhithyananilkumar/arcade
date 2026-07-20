import { ManagedBundle } from '../types/iam.types';

export class BundleEngine {
  /**
   * Calculates the final list of permissions a user will receive
   * by combining direct permissions with those included in bundles.
   */
  static calculateEffectivePermissions(
    selectedPermissionIds: string[],
    selectedBundleIds: string[],
    availableBundles: ManagedBundle[]
  ): string[] {
    const effectiveSet = new Set<string>(selectedPermissionIds);

    selectedBundleIds.forEach(bundleId => {
      const bundle = availableBundles.find(b => b.id === bundleId);
      if (bundle) {
        bundle.permissions.forEach(p => effectiveSet.add(p));
        // Note: Nested bundles could be recursively expanded here
      }
    });

    return Array.from(effectiveSet);
  }
}
