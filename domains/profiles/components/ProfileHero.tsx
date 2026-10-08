'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * The identity banner at the top of every page in the `domain/<handle>`
 * namespace — a person (learner or instructor) or an organization channel.
 * Designed with LinkedIn-style visual hierarchy: prominent cover banner,
 * customizable banner styles/presets, circular elevated avatar overlapping
 * the banner, bold typography, and clean action pills.
 * ------------------------------------------------------------------
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
import {
  Building2,
  Calendar,
  Camera,
  Check,
  Globe,
  Loader2,
  MapPin,
  Sparkles,
  Star,
  Trash2,
  User as UserIcon,
  X,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeRow, type ProfileBadge } from '@/domains/recognition';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { ChannelDoodleBanner } from '@/domains/channels';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';
import { UserService } from '@/domains/identity';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { toast } from 'sonner';

export type ProfileKind = 'learner' | 'instructor' | 'organization';

const KIND_LABEL: Record<ProfileKind, string> = {
  learner: 'Learner',
  instructor: 'Instructor',
  organization: 'Organization',
};

function RoleHighlighter({ label, kind }: { label: string; kind: 'instructor' | 'learner' }) {
  const configs = {
    instructor: {
      marker: 'bg-amber-300/60 dark:bg-amber-400/30 border-y border-amber-400/60 dark:border-amber-300/40',
      text: 'text-amber-950 dark:text-amber-100 font-extrabold',
      glow: 'shadow-[0_0_12px_rgba(251,191,36,0.25)]',
    },
    learner: {
      marker: 'bg-emerald-300/60 dark:bg-emerald-400/30 border-y border-emerald-400/60 dark:border-emerald-300/40',
      text: 'text-emerald-950 dark:text-emerald-100 font-extrabold',
      glow: 'shadow-[0_0_12px_rgba(52,211,153,0.25)]',
    },
  };

  const config = configs[kind];

  return (
    <span className="relative inline-flex items-center text-sm sm:text-base font-extrabold tracking-tight select-none my-0.5">
      {/* Real Chisel-Tip Highlighter Stroke (Crossing slightly above & below text) */}
      <span
        aria-hidden
        className={`absolute -inset-x-2 -inset-y-0.5 -rotate-0.5 -skew-x-2 rounded-xs ${config.marker} ${config.glow} pointer-events-none`}
      />
      {/* Highlighted text content */}
      <span className={`relative z-10 px-0.5 ${config.text}`}>
        {label}
      </span>
    </span>
  );
}

export interface BannerConfig {
  idOrUrl: string;
  zoom: number; // 1.0 to 3.0
  posX: number; // -50% to 50%
  posY: number; // -50% to 50%
}

export function parseBannerConfig(raw?: string | null, kind?: ProfileKind): BannerConfig {
  const defaultId = kind === 'organization' ? 'channel-doodles' : 'cyber-network';
  if (!raw) {
    return { idOrUrl: defaultId, zoom: 1.0, posX: 0, posY: 0 };
  }
  const trimmed = raw.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        idOrUrl: parsed.idOrUrl || defaultId,
        zoom: typeof parsed.zoom === 'number' ? parsed.zoom : 1.0,
        posX: typeof parsed.posX === 'number' ? parsed.posX : 0,
        posY: typeof parsed.posY === 'number' ? parsed.posY : 0,
      };
    } catch {
      // fallback
    }
  }
  return { idOrUrl: trimmed, zoom: 1.0, posX: 0, posY: 0 };
}

export interface BannerPreset {
  id: string;
  name: string;
  description: string;
  render: () => React.ReactNode;
}

export function isCustomBannerUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed in BANNER_PRESETS) return false;
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:') ||
    trimmed.includes('.')
  );
}

export function sanitizeBannerUrl(url: string): string {
  if (!url) return '';
  let trimmed = url.trim();
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('/') &&
    !trimmed.startsWith('data:') &&
    !trimmed.startsWith('blob:')
  ) {
    trimmed = `https://${trimmed}`;
  }
  // Auto-upgrade low-res Unsplash URLs to crisp 1080p/4K resolution
  if (trimmed.includes('images.unsplash.com')) {
    if (trimmed.includes('w=')) {
      trimmed = trimmed.replace(/w=\d+/, 'w=1920').replace(/q=\d+/, 'q=85');
    } else {
      trimmed += (trimmed.includes('?') ? '&' : '?') + 'auto=format&fit=crop&w=1920&q=85';
    }
  }
  return trimmed;
}

export const BANNER_PRESETS: Record<string, BannerPreset> = {
  'channel-doodles': {
    id: 'channel-doodles',
    name: 'Interactive Doodles',
    description: 'Signature hand-drawn doodles on warm aesthetic canvas with interactive physics',
    render: () => <ChannelDoodleBanner className="absolute inset-0 h-full w-full object-cover" />,
  },
  'cyber-network': {
    id: 'cyber-network',
    name: 'Neural Network',
    description: 'High-definition deep sapphire blue with luminous neural mesh & glowing nodes',
    render: () => (
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-r from-slate-950 via-[#091f4d] to-[#030e28] dark:to-slate-900">
        {/* Luminous High-Intensity Radial Light Flares */}
        <div className="absolute left-1/4 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-sky-400/30 blur-2xl" />
        <div className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-blue-500/35 blur-3xl" />
        <div className="absolute left-1/2 -top-10 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-500/30" />

        {/* High-Definition Sharp Vector Neural Mesh */}
        <svg
          className="absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1100 320"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="glow-strong" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="mesh-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Translucent Geometric Facets / Shaded Polygons */}
          <polygon points="120,70 240,110 180,210" fill="rgba(56, 189, 248, 0.08)" />
          <polygon points="240,110 340,50 460,130" fill="rgba(147, 197, 253, 0.10)" />
          <polygon points="240,110 460,130 360,220" fill="rgba(56, 189, 248, 0.09)" />
          <polygon points="460,130 580,80 690,150" fill="rgba(147, 197, 253, 0.12)" />
          <polygon points="460,130 690,150 540,240" fill="rgba(56, 189, 248, 0.08)" />
          <polygon points="580,80 730,40 790,90" fill="rgba(147, 197, 253, 0.14)" />
          <polygon points="690,150 790,90 910,170" fill="rgba(56, 189, 248, 0.11)" />
          <polygon points="690,150 910,170 830,230" fill="rgba(147, 197, 253, 0.07)" />
          <polygon points="790,90 910,170 890,50" fill="rgba(56, 189, 248, 0.10)" />

          {/* Crisp, Sharp Connecting Lines */}
          <g stroke="url(#mesh-line-grad)" strokeWidth="1.3" fill="none">
            <path d="M40,140 L120,70 L240,110 L340,50 L460,130 L580,80 L690,150 L790,90 L910,170 L1020,110" />
            <path d="M120,70 L180,210 L360,220 L460,130 L540,240 L690,150 L830,230 L910,170 L980,240" />
            <path d="M180,210 L240,110 L360,220 L580,80 L730,40 L790,90 L890,50 L910,170" />
            <path d="M300,20 L340,50 L500,30 L580,80 L730,40 L960,70 L1020,110" />
            <path d="M500,30 L460,130 L730,40 L690,150" strokeWidth="1.5" stroke="#bae6fd" />
            <path d="M620,110 L710,70 L760,130 L850,100 L930,160" strokeWidth="1.6" stroke="#ffffff" />
          </g>

          {/* Crystal Sharp Glowing Vertex Nodes */}
          <g filter="url(#glow-strong)">
            <circle cx="120" cy="70" r="5" fill="#ffffff" />
            <circle cx="240" cy="110" r="5" fill="#bae6fd" />
            <circle cx="340" cy="50" r="6" fill="#ffffff" />
            <circle cx="460" cy="130" r="7" fill="#ffffff" />
            <circle cx="580" cy="80" r="7" fill="#ffffff" />
            <circle cx="690" cy="150" r="6.5" fill="#bae6fd" />
            <circle cx="730" cy="40" r="5" fill="#38bdf8" />
            <circle cx="790" cy="90" r="7.5" fill="#ffffff" />
            <circle cx="890" cy="50" r="5" fill="#bae6fd" />
            <circle cx="910" cy="170" r="6" fill="#ffffff" />
            <circle cx="1020" cy="110" r="5" fill="#38bdf8" />
          </g>

          {/* Secondary Network Points */}
          <g fill="#93c5fd">
            <circle cx="40" cy="140" r="3.5" />
            <circle cx="180" cy="210" r="4" />
            <circle cx="300" cy="20" r="3.5" />
            <circle cx="360" cy="220" r="4.5" />
            <circle cx="500" cy="30" r="4" />
            <circle cx="540" cy="240" r="4" />
            <circle cx="620" cy="110" r="4" />
            <circle cx="710" cy="70" r="4.5" />
            <circle cx="760" cy="130" r="4.5" />
            <circle cx="830" cy="230" r="4" />
            <circle cx="850" cy="100" r="5" />
            <circle cx="930" cy="160" r="4.5" />
            <circle cx="960" cy="70" r="4" />
            <circle cx="980" cy="240" r="4" />
          </g>

          {/* Luminous Halos on Hero Nodes */}
          <circle cx="460" cy="130" r="14" stroke="rgba(186, 230, 253, 0.6)" strokeWidth="1.8" fill="none" />
          <circle cx="580" cy="80" r="15" stroke="rgba(56, 189, 248, 0.7)" strokeWidth="2" fill="none" />
          <circle cx="790" cy="90" r="16" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2" fill="none" />
        </svg>
      </div>
    ),
  },
  'aurora-glow': {
    id: 'aurora-glow',
    name: 'Aurora Borealis',
    description: 'Vivid wave of emerald, cyan, and violet aurora streams',
    render: () => (
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-r from-slate-950 via-[#091b3e] to-[#040e24] dark:to-slate-900">
        <div className="absolute -left-10 -top-10 h-96 w-96 rounded-full bg-emerald-400/35 blur-3xl" />
        <div className="absolute left-1/3 top-10 h-80 w-80 rounded-full bg-cyan-400/40 blur-2xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-purple-500/40 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>
    ),
  },
  'sunset-horizon': {
    id: 'sunset-horizon',
    name: 'Sunset Horizon',
    description: 'Warm coral, amber, and deep crimson gradient dusk',
    render: () => (
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-r from-[#18080f] via-slate-900 to-[#1a0808] dark:from-slate-950 dark:to-slate-950">
        <div className="absolute left-1/4 top-5 h-80 w-80 rounded-full bg-rose-500/45 blur-3xl" />
        <div className="absolute right-1/4 top-0 h-80 w-80 rounded-full bg-amber-400/45 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>
    ),
  },
  'quantum-grid': {
    id: 'quantum-grid',
    name: 'Quantum Cyber Grid',
    description: 'Futuristic neon perspective grid with crisp illumination',
    render: () => (
      <div className="absolute inset-0 overflow-hidden bg-ink">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf825_1px,transparent_1px),linear-gradient(to_bottom,#38bdf825_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-1/2 top-0 h-80 w-[500px] -translate-x-1/2 rounded-full bg-sky-400/30 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950" />
      </div>
    ),
  },
  'fuji-minimal': {
    id: 'fuji-minimal',
    name: 'Fuji Modern Clean',
    description: 'High-contrast dark sapphire gradient with luminous spotlight',
    render: () => (
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-tr from-slate-900 via-[#111e40] to-slate-900">
        <div className="absolute right-10 top-0 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute left-10 bottom-0 h-72 w-72 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>
    ),
  },
};

// Curated Ultra-HD Wallpaper Banners (100% Crisp & High Resolution)
export const HD_PHOTO_PRESETS = [
  {
    id: 'hd-cyber-city',
    name: 'Cyberpunk Skyline',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=85',
    description: 'Moody neon futuristic cityscape illuminated at midnight',
  },
  {
    id: 'hd-deep-space',
    name: 'Cosmic Nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=85',
    description: 'Stunning starry galaxy with vibrant cosmic dust and starlight',
  },
  {
    id: 'hd-mountain-mist',
    name: 'Alpine Vista',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=85',
    description: 'Crisp mountain peaks bathed in golden morning sun and mist',
  },
  {
    id: 'hd-modern-arch',
    name: 'Geometric Architecture',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=85',
    description: 'Glass and steel architectural lines with clean modern contrast',
  },
];

export interface ProfileHeroProps {
  kind: ProfileKind;
  name: string;
  handle?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  badges: ProfileBadge[];
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  joinedAt?: string | null;
  actions?: React.ReactNode;
  isSelf?: boolean;
  onBannerUpdate?: (bannerUrl: string) => void;
}

function formatJoined(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

export function ProfileHero({
  kind,
  name,
  handle,
  avatarUrl,
  bannerUrl: initialBannerUrl,
  badges,
  headline,
  bio,
  location,
  websiteUrl,
  joinedAt,
  actions,
  isSelf = false,
  onBannerUpdate,
}: ProfileHeroProps) {
  const storageKey = handle ? `arcade_profile_banner_v2_${handle}` : null;
  const legacyStorageKey = handle ? `arcade_profile_banner_${handle}` : null;

  const defaultPresetId = kind === 'organization' ? 'channel-doodles' : 'cyber-network';

  const updateUser = useAuthStore((s) => s.updateUser);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null | undefined>(avatarUrl);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarCropFile, setAvatarCropFile] = useState<File | null>(null);
  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    setCurrentAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setAvatarCropSrc(null);
    setAvatarCropFile(file);
  };

  const handleEditCurrentAvatar = () => {
    if (currentAvatarUrl) {
      setAvatarCropFile(null);
      setAvatarCropSrc(getAvatarUrl(currentAvatarUrl) ?? null);
    } else {
      avatarInputRef.current?.click();
    }
  };

  const handleAvatarCropped = async (croppedFile: File) => {
    setAvatarCropFile(null);
    setAvatarCropSrc(null);
    setIsUploadingAvatar(true);
    try {
      const updatedUser = await UserService.uploadAvatar(croppedFile);
      updateUser(updatedUser);
      setCurrentAvatarUrl(updatedUser.avatarUrl);
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      const updatedUser = await UserService.removeAvatar();
      updateUser(updatedUser);
      setCurrentAvatarUrl(null);
      toast.success('Profile picture removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Active banner configuration (ID or Image URL + Zoom + Position)
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(() => {
    return parseBannerConfig(initialBannerUrl, kind);
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'crop_editor'>('presets');

  // Staging state inside modal for cropping / repositioning
  const [stagingUrl, setStagingUrl] = useState<string>('');
  const [stagingZoom, setStagingZoom] = useState<number>(1.0);
  const [stagingPosX, setStagingPosX] = useState<number>(0);
  const [stagingPosY, setStagingPosY] = useState<number>(0);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [urlError, setUrlError] = useState(false);

  // Drag interaction state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initPosX: number; initPosY: number }>({
    startX: 0,
    startY: 0,
    initPosX: 0,
    initPosY: 0,
  });
  // Load user's saved banner choice from initialBannerUrl (backend database) or localStorage fallback
  useEffect(() => {
    if (initialBannerUrl) {
      setBannerConfig(parseBannerConfig(initialBannerUrl, kind));
      return;
    }
    if (isSelf && storageKey) {
      const savedV2 = localStorage.getItem(storageKey);
      if (savedV2) {
        setBannerConfig(parseBannerConfig(savedV2, kind));
        return;
      }
      if (legacyStorageKey) {
        const savedLegacy = localStorage.getItem(legacyStorageKey);
        if (savedLegacy) {
          setBannerConfig(parseBannerConfig(savedLegacy, kind));
          return;
        }
      }
    }
    setBannerConfig(parseBannerConfig(initialBannerUrl, kind));
  }, [storageKey, legacyStorageKey, initialBannerUrl, isSelf, kind]);

  // Open modal and prep staging state
  const handleOpenModal = () => {
    const isCustom = isCustomBannerUrl(bannerConfig.idOrUrl);
    setStagingUrl(isCustom ? bannerConfig.idOrUrl : '');
    setStagingZoom(bannerConfig.zoom || 1.0);
    setStagingPosX(bannerConfig.posX || 0);
    setStagingPosY(bannerConfig.posY || 0);
    setUrlError(false);
    setActiveTab(isCustom ? 'crop_editor' : 'presets');
    setModalOpen(true);
  };

  // Save preset banner directly
  const handleSelectPreset = (presetIdOrUrl: string) => {
    const isCustom = isCustomBannerUrl(presetIdOrUrl);
    if (isCustom) {
      // If user clicked a photographic wallpaper preset, load it into crop editor so they can reposition/zoom
      setStagingUrl(sanitizeBannerUrl(presetIdOrUrl));
      setStagingZoom(1.0);
      setStagingPosX(0);
      setStagingPosY(0);
      setActiveTab('crop_editor');
      return;
    }

    const nextConfig: BannerConfig = {
      idOrUrl: presetIdOrUrl,
      zoom: 1.0,
      posX: 0,
      posY: 0,
    };
    const bannerJson = JSON.stringify(nextConfig);
    setBannerConfig(nextConfig);
    if (storageKey) {
      localStorage.setItem(storageKey, bannerJson);
    }
    onBannerUpdate?.(bannerJson);

    // Save to database
    if (isSelf && kind !== 'organization') {
      const viewerUser = useAuthStore.getState().user;
      if (viewerUser?.firstName) {
        UserService.updateProfilePresentation(viewerUser.firstName, viewerUser.lastName ?? '', {
          bannerUrl: bannerJson,
        }).catch((err) => {
          console.error('Failed to sync banner to database', err);
        });
      }
    }

    setModalOpen(false);
  };

  // Apply custom image and crop/zoom settings
  const handleApplyCroppedBanner = () => {
    if (!stagingUrl.trim()) return;
    const sanitized = sanitizeBannerUrl(stagingUrl.trim());
    const nextConfig: BannerConfig = {
      idOrUrl: sanitized,
      zoom: stagingZoom,
      posX: Math.round(stagingPosX),
      posY: Math.round(stagingPosY),
    };
    const bannerJson = JSON.stringify(nextConfig);
    setBannerConfig(nextConfig);
    if (storageKey) {
      localStorage.setItem(storageKey, bannerJson);
    }
    onBannerUpdate?.(bannerJson);

    // Save to database
    if (isSelf && kind !== 'organization') {
      const viewerUser = useAuthStore.getState().user;
      if (viewerUser?.firstName) {
        UserService.updateProfilePresentation(viewerUser.firstName, viewerUser.lastName ?? '', {
          bannerUrl: bannerJson,
        }).catch((err) => {
          console.error('Failed to sync banner to database', err);
        });
      }
    }

    setModalOpen(false);
  };

  // Drag handlers for repositioning
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPosX: stagingPosX,
      initPosY: stagingPosY,
    };
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      
      // Sensitivity scaled by container scale
      const sensitivity = 0.25;
      const newX = Math.max(-50, Math.min(50, dragStartRef.current.initPosX + dx * sensitivity));
      const newY = Math.max(-50, Math.min(50, dragStartRef.current.initPosY + dy * sensitivity));
      
      setStagingPosX(newX);
      setStagingPosY(newY);
    },
    [isDragging],
  );

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  const FallbackIcon = kind === 'organization' ? Building2 : UserIcon;

  const meta: React.ReactNode[] = [];
  if (location) {
    meta.push(
      <span key="location" className="flex items-center gap-1">
        <MapPin size={13} className="text-slate-400" />
        {location}
      </span>,
    );
  }
  if (websiteUrl) {
    meta.push(
      <a
        key="website"
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex max-w-[220px] items-center gap-1 truncate text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:underline"
      >
        <Globe size={13} className="shrink-0 text-slate-400" />
        {websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
      </a>,
    );
  }

  // Active banner rendering
  const isCustomBanner = isCustomBannerUrl(bannerConfig.idOrUrl);
  const activeCustomUrl = isCustomBanner ? sanitizeBannerUrl(bannerConfig.idOrUrl) : '';
  const preset = BANNER_PRESETS[bannerConfig.idOrUrl] || BANNER_PRESETS[defaultPresetId] || BANNER_PRESETS['cyber-network'];

  return (
    <>
      <div className="relative overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-md rounded-bl-md border border-slate-200/80 bg-surface/95 shadow-xs">
        {/* LinkedIn-Style Full Width Cover Banner */}
        <div className="group relative h-40 w-full overflow-hidden sm:h-52 md:h-60 bg-slate-950">
          {isCustomBanner ? (
            <div className="relative h-full w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAvatarUrl(activeCustomUrl)}
                alt="Cover Banner"
                style={{
                  transform: `translate(${bannerConfig.posX}%, ${bannerConfig.posY}%) scale(${bannerConfig.zoom})`,
                  transformOrigin: 'center center',
                }}
                className="h-full w-full object-cover object-center block transform-gpu select-none transition-transform duration-100"
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            preset.render()
          )}

          {/* Edit Cover Photo / Banner Button (LinkedIn Style) */}
          {isSelf && (
            <button
              type="button"
              onClick={handleOpenModal}
              className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-white/30 bg-slate-950/70 px-3.5 py-1.5 text-xs font-semibold text-on-ink shadow-md backdrop-blur-md transition-all hover:bg-slate-950 hover:scale-105 cursor-pointer opacity-90 group-hover:opacity-100"
              title="Customize & crop cover banner"
            >
              <Camera size={14} className="text-white" />
              <span>Edit cover</span>
            </button>
          )}
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 sm:px-8 sm:pb-8">
          {/* Avatar & Action Button Row */}
          <div className="relative -mt-16 mb-4 flex flex-col items-start justify-between gap-4 sm:-mt-20 sm:flex-row sm:items-end md:-mt-24">
            {/* Avatar with Thick White Border (Squircle badge for org, circular for personal) */}
            <div
              className={`group/avatar relative z-10 flex shrink-0 items-center justify-center overflow-hidden border-4 border-surface shadow-md ${
                kind === 'organization'
                  ? 'h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-3xl bg-slate-900 text-on-ink'
                  : 'h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-full bg-slate-100'
              }`}
            >
              {currentAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getAvatarUrl(currentAvatarUrl)}
                  alt={name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : kind === 'organization' ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-900 text-on-ink">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white"
                  >
                    {/* Megaphone Cone Body */}
                    <path
                      d="M3.5 10.5V13.5C3.5 14.1 4 14.5 4.5 14.5H6.5L14 18V6L6.5 9.5H4.5C4 9.5 3.5 9.9 3.5 10.5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    {/* Megaphone Back rim */}
                    <path
                      d="M14 6C15 6 16 8.7 16 12C16 15.3 15 18 14 18"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    {/* Handle */}
                    <path
                      d="M7 14.5L7.8 19C7.9 19.6 8.4 20 9 20C9.6 20 10.1 19.5 10 18.9L9.5 14.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    {/* Accent dot on cone */}
                    <circle cx="5" cy="12" r="0.75" fill="#FBBF24" />
                    {/* Soundwaves / Broadcast arcs */}
                    <path
                      d="M18 9C19.2 10 19.8 11 19.8 12C19.8 13 19.2 14 18 15"
                      stroke="#38BDF8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M20.5 7C22.2 8.5 23 10.2 23 12C23 13.8 22.2 15.5 20.5 17"
                      stroke="#38BDF8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              ) : (
                <FallbackIcon size={56} className="text-slate-400" />
              )}

              {/* In-place Avatar Change Overlay when isSelf */}
              {isSelf && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1.5 bg-black/65 p-2 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                  {isUploadingAvatar ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : currentAvatarUrl ? (
                    <div className="flex flex-col items-center gap-1.5 w-full">
                      <button
                        type="button"
                        onClick={handleEditCurrentAvatar}
                        className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-full bg-white/25 hover:bg-surface text-white hover:text-slate-900 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold shadow-xs transition-all active:scale-95 w-full max-w-[105px]"
                        title="Crop, zoom, and adjust current photo"
                      >
                        <Sliders size={11} />
                        <span>Adjust crop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-full bg-white/20 hover:bg-surface text-white hover:text-slate-900 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold shadow-xs transition-all active:scale-95 w-full max-w-[105px]"
                        title="Choose a new photo"
                      >
                        <Camera size={11} />
                        <span>New photo</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex cursor-pointer flex-col items-center justify-center text-white transition-transform hover:scale-105"
                      title="Upload profile picture"
                    >
                      <Camera size={22} className="mb-0.5" />
                      <span className="text-[11px] font-bold">Upload</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Top Actions / Action Buttons */}
            {actions && (
              <div className="flex w-full flex-wrap items-center justify-start gap-2.5 sm:w-auto sm:justify-end">
                {actions}
              </div>
            )}
          </div>

          {/* Identity & Headline Information */}
          <div className="space-y-1.5 text-left">
            {/* Name & Badges (Largest) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {name}
              </h1>
              <BadgeRow badges={badges} size={22} />
            </div>

            {/* Handle directly below Name */}
            {handle && (
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 sm:text-base">
                @{handle}
              </p>
            )}

            {/* Professional Headline (Same unified font style & color) */}
            {headline && (
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                {headline.slice(0, 20)}
              </p>
            )}

            {/* Meta Bar: Location • Website (Same unified font style & color) */}
            {meta.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                {meta.flatMap((node, index) =>
                  index === 0 ? [node] : [<span key={`dot-${index}`} className="text-slate-400">•</span>, node],
                )}
              </div>
            )}

            {/* Bio / Summary (Limit: 40 words) */}
            {bio && (
              <p className="max-w-3xl whitespace-pre-line text-xs sm:text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                {bio.trim().split(/\s+/).slice(0, 40).join(' ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Banner Customization & Crop / Reposition Modal */}
      <Portal>
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-200/90 bg-surface p-6 shadow-2xl"
              >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Cover Banner Studio
                    </h2>
                    <p className="text-xs text-slate-500">
                      Customize themes, upload custom photos, crop, zoom, and reposition
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="mt-3 flex border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'presets'
                      ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles size={14} />
                  <span>Curated Themes & Wallpapers</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!stagingUrl && isCustomBanner) {
                      setStagingUrl(bannerConfig.idOrUrl);
                    }
                    setActiveTab('crop_editor');
                  }}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'crop_editor'
                      ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sliders size={14} />
                  <span>Crop, Resize & Position Image</span>
                </button>
              </div>

              {/* Tab 1: Presets Grid */}
              {activeTab === 'presets' && (
                <div className="flex-1 overflow-y-auto py-4 space-y-6">
                  {/* High-Definition Photography */}
                  <div>
                    <div className="mb-2.5 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        4K Photography Wallpapers
                      </h3>
                      <span className="text-[11px] text-sky-600 dark:text-sky-400">
                        Click any to crop & reposition
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {HD_PHOTO_PRESETS.map((photo) => {
                        const isSelected = bannerConfig.idOrUrl === photo.url;
                        return (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() => handleSelectPreset(photo.url)}
                            className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-sky-500 ring-2 ring-sky-500/40'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="relative h-20 w-full overflow-hidden bg-slate-900">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo.url}
                                alt={photo.name}
                                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                              {isSelected && (
                                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white shadow-xs">
                                  <Check size={14} />
                                </div>
                              )}
                            </div>
                            <div className="bg-slate-50 p-2.5">
                              <p className="text-xs font-bold text-slate-900">
                                {photo.name}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {photo.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vector & Digital Themes Grid */}
                  <div>
                    <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Vector & Digital Art Themes
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {Object.values(BANNER_PRESETS).map((presetItem) => {
                        const isSelected = bannerConfig.idOrUrl === presetItem.id;
                        return (
                          <button
                            key={presetItem.id}
                            type="button"
                            onClick={() => handleSelectPreset(presetItem.id)}
                            className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-sky-500 ring-2 ring-sky-500/40'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="relative h-20 w-full overflow-hidden">
                              {presetItem.render()}
                              {isSelected && (
                                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white shadow-xs">
                                  <Check size={14} />
                                </div>
                              )}
                            </div>
                            <div className="bg-slate-50 p-2.5">
                              <p className="text-xs font-bold text-slate-900">
                                {presetItem.name}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {presetItem.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Interactive Crop, Zoom, and Reposition Editor */}
              {activeTab === 'crop_editor' && (
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                  {/* Image Source Input: URL */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
                    <label className="text-xs font-bold text-slate-900 block mb-1.5">
                      Image Source URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Paste image link (Unsplash, Imgur, direct image URL)..."
                        value={customUrlInput}
                        onChange={(e) => {
                          setCustomUrlInput(e.target.value);
                          setUrlError(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customUrlInput.trim()) {
                            e.preventDefault();
                            setStagingUrl(sanitizeBannerUrl(customUrlInput.trim()));
                            setStagingZoom(1.0);
                            setStagingPosX(0);
                            setStagingPosY(0);
                            setUrlError(false);
                          }
                        }}
                        className="flex-1 rounded-xl border border-slate-200 bg-surface px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={!customUrlInput.trim()}
                        onClick={() => {
                          if (customUrlInput.trim()) {
                            setStagingUrl(sanitizeBannerUrl(customUrlInput.trim()));
                            setStagingZoom(1.0);
                            setStagingPosX(0);
                            setStagingPosY(0);
                            setUrlError(false);
                          }
                        }}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-on-ink transition-colors hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                      >
                        Load Image
                      </button>
                    </div>
                  </div>

                  {/* Interactive Crop & Reposition Viewport */}
                  {stagingUrl ? (
                    <div className="space-y-3">
                      {/* Viewport Frame */}
                      <div className="relative overflow-hidden rounded-xl border-2 border-sky-500/60 bg-slate-950 shadow-inner">
                        <div
                          onPointerDown={handlePointerDown}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerLeave={handlePointerUp}
                          className={`relative h-44 w-full select-none overflow-hidden sm:h-52 ${
                            isDragging ? 'cursor-grabbing' : 'cursor-grab'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getAvatarUrl(stagingUrl)}
                            alt="Crop Preview"
                            style={{
                              transform: `translate(${stagingPosX}%, ${stagingPosY}%) scale(${stagingZoom})`,
                              transformOrigin: 'center center',
                            }}
                            className="pointer-events-none h-full w-full object-cover object-center block transform-gpu select-none"
                            onError={() => setUrlError(true)}
                            onLoad={() => setUrlError(false)}
                            referrerPolicy="no-referrer"
                          />

                          {/* Overlay Instructions Badge */}
                          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-slate-950/70 px-2.5 py-1 text-[11px] font-semibold text-on-ink backdrop-blur-md">
                            <Move size={12} />
                            <span>Click & Drag to reposition</span>
                          </div>

                          {/* Safe crop grid guidelines overlay */}
                          <div className="pointer-events-none absolute inset-0 border border-white/20">
                            <div className="grid h-full w-full grid-cols-3 grid-rows-3 opacity-25">
                              <div className="border-r border-b border-surface" />
                              <div className="border-r border-b border-surface" />
                              <div className="border-b border-surface" />
                              <div className="border-r border-b border-surface" />
                              <div className="border-r border-b border-surface" />
                              <div className="border-b border-surface" />
                              <div className="border-r border-surface" />
                              <div className="border-r border-surface" />
                              <div />
                            </div>
                          </div>

                          {urlError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-950/85 p-4 text-center text-xs font-semibold text-red-200">
                              Unable to render image from this link. Please check the URL or upload a file.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controls Toolbar: Zoom Slider & Alignments */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-3">
                        {/* Zoom Slider */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-700 shrink-0 flex items-center gap-1">
                            <ZoomIn size={14} className="text-sky-500" />
                            Zoom: {Math.round(stagingZoom * 100)}%
                          </span>
                          <button
                            type="button"
                            onClick={() => setStagingZoom((z) => Math.max(1.0, +(z - 0.1).toFixed(2)))}
                            className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 cursor-pointer"
                            title="Zoom out"
                          >
                            <ZoomOut size={15} />
                          </button>
                          <input
                            type="range"
                            min="1.0"
                            max="3.0"
                            step="0.05"
                            value={stagingZoom}
                            onChange={(e) => setStagingZoom(parseFloat(e.target.value))}
                            className="flex-1 accent-sky-600 h-1.5 rounded-lg bg-slate-200 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => setStagingZoom((z) => Math.min(3.0, +(z + 0.1).toFixed(2)))}
                            className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 cursor-pointer"
                            title="Zoom in"
                          >
                            <ZoomIn size={15} />
                          </button>
                        </div>

                        {/* Alignment & Reset Presets */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase">
                              Quick Align:
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setStagingPosX(0);
                                setStagingPosY(25);
                              }}
                              className="rounded-lg bg-surface px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                            >
                              Top
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setStagingPosX(0);
                                setStagingPosY(0);
                              }}
                              className="rounded-lg bg-surface px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                            >
                              Center
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setStagingPosX(0);
                                setStagingPosY(-25);
                              }}
                              className="rounded-lg bg-surface px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                            >
                              Bottom
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setStagingZoom(1.0);
                              setStagingPosX(0);
                              setStagingPosY(0);
                            }}
                            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            <RotateCcw size={12} />
                            <span>Reset Crop</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 text-center">
                      <ImageIcon size={36} className="text-slate-400 mb-2" />
                      <p className="text-xs font-bold text-slate-700">
                        No custom image loaded
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                        Paste an image URL above or choose a photo from the Themes tab to zoom, resize, and reposition.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-end border-t border-slate-100 pt-3">
                {activeTab === 'crop_editor' ? (
                  <button
                    type="button"
                    disabled={!stagingUrl || urlError}
                    onClick={handleApplyCroppedBanner}
                    className="rounded-full bg-sky-600 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-sky-700 disabled:opacity-40 cursor-pointer"
                  >
                    Save & Apply Cover
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-on-ink transition-colors hover:bg-slate-800 cursor-pointer"
                  >
                    Done
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </Portal>

      {/* Hidden Avatar File Input */}
      <input
        type="file"
        ref={avatarInputRef}
        className="hidden"
        accept="image/jpeg, image/png, image/webp"
        onChange={handleAvatarSelect}
      />

      {/* Avatar Image Crop & Adjustment Studio Modal */}
      <ImageCropModal
        open={avatarCropFile !== null || avatarCropSrc !== null}
        file={avatarCropFile}
        imageSrc={avatarCropSrc}
        aspectRatio={1}
        title={kind === 'organization' ? 'Crop Organization Logo' : 'Crop & Adjust Profile Picture'}
        onCancel={() => {
          setAvatarCropFile(null);
          setAvatarCropSrc(null);
        }}
        onCropped={handleAvatarCropped}
      />
    </>
  );
}
