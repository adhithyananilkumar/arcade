/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Rubiks Cube
 *
 * Purpose:
 * Persists the dashboard home cube's state to the signed-in user's account, so it survives
 * a device change or a cleared cache instead of living only in localStorage.
 * ------------------------------------------------------------------
 */

import { api } from '@/infrastructure/http/api';
import type { RubiksCubeStatePayload, RubiksCubeStateRecord } from '../types/rubiksCube.types';

const BASE = '/api/v1/me/rubiks-cube';

export const RubiksCubeService = {
  getState(): Promise<RubiksCubeStateRecord> {
    return api.get<RubiksCubeStateRecord>(BASE);
  },

  saveState(state: RubiksCubeStatePayload): Promise<RubiksCubeStateRecord> {
    return api.put<RubiksCubeStateRecord>(BASE, { state });
  },
};
