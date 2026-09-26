/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Rubiks Cube
 * ------------------------------------------------------------------
 */

/**
 * Opaque save payload for the dashboard home cube. The backend stores this as a JSONB blob and
 * never inspects its shape — only the renderer (`RubiksCube3D.tsx`) knows what these fields mean.
 */
export interface RubiksCubeStatePayload {
  [key: string]: unknown;
}

export interface RubiksCubeStateRecord {
  state: RubiksCubeStatePayload | null;
  updatedAt: string | null;
}
