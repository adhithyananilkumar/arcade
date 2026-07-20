import { PermissionMetadata, ValidationError } from '../types/iam.types';

export class DependencyEngine {
  /**
   * Validates if the selected permissions have all their dependencies met.
   * Returns an array of ValidationErrors for any missing dependencies.
   */
  static validateDependencies(
    effectivePermissions: string[],
    metadataMap: Record<string, PermissionMetadata>
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const effectiveSet = new Set(effectivePermissions);

    for (const permissionId of effectivePermissions) {
      const metadata = metadataMap[permissionId];
      if (metadata?.dependencies) {
        for (const depId of metadata.dependencies) {
          if (!effectiveSet.has(depId)) {
            errors.push({
              type: 'MISSING_DEPENDENCY',
              message: `Permission "${permissionId}" requires "${depId}".`,
              details: { requiredBy: permissionId, missing: depId }
            });
          }
        }
      }
      
      if (metadata?.riskLevel === 'CRITICAL') {
        // Just adding a warning for critical permissions (not necessarily an error, but worth tracking)
        errors.push({
          type: 'DANGEROUS_PERMISSION',
          message: `High risk permission granted: "${permissionId}". Ensure this is intended.`,
          details: { permissionId }
        });
      }
    }

    return errors;
  }
}
