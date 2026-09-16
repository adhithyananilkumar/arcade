/**
 * Studio Capability Model & Honesty Contract
 *
 * Capability Honesty Rule:
 * Studio Core must never infer that a capability exists merely because its UI exists.
 * A capability is 'available' only when the underlying backend/runtime implementation
 * is actually functional. Otherwise the workspace must explicitly provide 'unavailable'
 * or 'disabled' state. No placeholder adapters, fake revision lists, simulated collaboration,
 * or client-only persistence may be introduced to make a capability appear functional.
 */

export type StudioCapability<T> =
  | {
      status: "available";
      data: T;
    }
  | {
      status: "unavailable";
      reason: string;
    }
  | {
      status: "disabled";
      reason: string;
    };

export function isCapabilityAvailable<T>(
  cap?: StudioCapability<T> | null
): cap is { status: "available"; data: T } {
  return cap?.status === "available";
}
