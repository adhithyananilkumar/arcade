/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Identity
 *
 * Purpose:
 * The account's saved appearance (theme, contrast, glass, wallpaper) and
 * the wallpaper gallery — both the public picker list and Console's
 * curation endpoints.
 *
 * Rules:
 * - Whether a wallpaper may still be chosen is decided by the server; a
 *   rejected save surfaces its message, it is not second-guessed here.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { api } from '@/infrastructure/http/api';

export type ServerThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM';
export type ServerContrast = 'STANDARD' | 'HIGH';
export type ServerMaterial = 'SOLID' | 'GLASS';
export type ServerGlassTone = 'AUTO' | 'LIGHT' | 'DARK';
export type WallpaperToneValue = 'LIGHT' | 'DARK';

export interface WallpaperChoiceDto {
  kind: 'preset' | 'image';
  key: string | null;
  id: string | null;
  url: string | null;
  tone: WallpaperToneValue;
  color: string | null;
}

export interface AppearanceDto {
  mode: ServerThemeMode;
  contrast: ServerContrast;
  material: ServerMaterial;
  glassTone: ServerGlassTone;
  glassOpacity: number;
  /** Absent from servers that predate wallpaper dimming. */
  wallpaperDim?: number;
  wallpaper: WallpaperChoiceDto;
  updatedAt: string;
}

export interface AppearanceSaveRequest {
  mode: ServerThemeMode;
  contrast: ServerContrast;
  material: ServerMaterial;
  glassTone: ServerGlassTone;
  glassOpacity: number;
  wallpaperDim: number;
  wallpaperPreset: string | null;
  wallpaperId: string | null;
}

export interface GalleryWallpaper {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  tone: WallpaperToneValue;
  averageColor: string;
  width: number;
  height: number;
}

export interface AdminWallpaper extends GalleryWallpaper {
  measuredTone: WallpaperToneValue;
  sizeBytes: number;
  sortOrder: number;
  active: boolean;
  /** Accounts that currently have this wallpaper selected. */
  users: number;
  createdAt: string;
  updatedAt: string;
}

export interface WallpaperUpdate {
  name?: string;
  tone?: WallpaperToneValue;
  active?: boolean;
}

const ADMIN_BASE = '/api/v1/console/appearance/wallpapers';

export const AppearanceService = {
  gallery(): Promise<GalleryWallpaper[]> {
    return api.get<GalleryWallpaper[]>('/api/v1/public/appearance/wallpapers');
  },

  /** The account's saved appearance, or null when it never saved one. */
  async mine(): Promise<AppearanceDto | null> {
    const result = await api.get<AppearanceDto | undefined | ''>('/api/v1/users/me/appearance');
    return result ? (result as AppearanceDto) : null;
  },

  save(request: AppearanceSaveRequest): Promise<AppearanceDto> {
    return api.put<AppearanceDto>('/api/v1/users/me/appearance', request);
  },

  admin: {
    list(): Promise<AdminWallpaper[]> {
      return api.get<AdminWallpaper[]>(ADMIN_BASE);
    },
    upload(file: File, name: string, tone: WallpaperToneValue | null): Promise<AdminWallpaper> {
      const form = new FormData();
      form.append('file', file);
      if (name.trim()) form.append('name', name.trim());
      if (tone) form.append('tone', tone);
      return api.post<AdminWallpaper>(ADMIN_BASE, form);
    },
    update(id: string, patch: WallpaperUpdate): Promise<AdminWallpaper> {
      return api.patch<AdminWallpaper>(`${ADMIN_BASE}/${id}`, patch);
    },
    reorder(ids: string[]): Promise<AdminWallpaper[]> {
      return api.put<AdminWallpaper[]>(`${ADMIN_BASE}/order`, { ids });
    },
    remove(id: string): Promise<void> {
      return api.delete<void>(`${ADMIN_BASE}/${id}`);
    },
  },
};
