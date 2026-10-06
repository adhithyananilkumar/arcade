'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  Camera,
  Check,
  Edit3,
  ExternalLink,
  Globe,
  Link2,
  Loader2,
  Mail,
  Plus,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';
import { channelService, type Channel } from '@/domains/channels';
import { Panel } from '@/shared/design-system/ui/panel';
import { toast } from 'sonner';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { ChannelDoodleBanner } from '../ChannelDoodleBanner';
import { ChannelSocialLinksCard } from '../ChannelSocialLinksCard';

type IconProps = { size?: number; className?: string };

const strokeIcon = (paths: React.ReactNode) =>
  function Icon({ size = 15, className = '' }: IconProps) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {paths}
      </svg>
    );
  };

const LinkedinIcon = strokeIcon(
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </>,
);
const InstagramIcon = strokeIcon(
  <>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </>,
);
const GithubIcon = strokeIcon(
  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />,
);
const XIcon = strokeIcon(
  <>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </>,
);
const YoutubeIcon = strokeIcon(
  <>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </>,
);

function socialPlatform(link: string): { icon: React.ComponentType<IconProps>; label: string } | null {
  try {
    const host = new URL(link).hostname.toLowerCase().replace(/^www\./, '');
    if (host.includes('linkedin')) return { icon: LinkedinIcon, label: 'LinkedIn' };
    if (host.includes('instagram')) return { icon: InstagramIcon, label: 'Instagram' };
    if (host.includes('github')) return { icon: GithubIcon, label: 'GitHub' };
    if (host.includes('twitter') || host === 'x.com') return { icon: XIcon, label: 'X' };
    if (host.includes('youtube')) return { icon: YoutubeIcon, label: 'YouTube' };
    return { icon: Globe, label: host };
  } catch {
    return null;
  }
}

interface Props {
  channel: Channel;
  canEdit: boolean;
  onUpdate: (channel: Channel) => void;
  onEditProfile?: () => void;
  /** Opens the organisation logo modal — the one place the logo changes. */
  onEditLogo?: () => void;
}

/** The channel as the world sees it — banner, mark, name, owner, links — in one compact card. */
export function ChannelProfileCard({ channel, canEdit, onUpdate, onEditProfile, onEditLogo }: Props) {
  const [socialOpen, setSocialOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Banner direct upload state. The logo changes only in OrganisationLogoModal (it is printed on
  // badges and certificates, so it is previewed and confirmed there).
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [cropTarget, setCropTarget] = useState<'banner' | null>(null);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const links = (channel.socialLinks ?? []).filter(Boolean);
  const publicPath = channel.handle ? `/${channel.handle}` : `/channels/${channel.id}`;

  const copyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${publicPath}`);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy the link');
    }
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setCropSourceFile(file);
    setCropTarget('banner');
  };

  const handleCropped = async (croppedFile: File) => {
    const target = cropTarget;
    setCropTarget(null);
    setCropSourceFile(null);
    if (!target) return;

    setIsUploading(true);
    try {
      const updated = await channelService.updateChannelProfile(channel.id, {
        bannerFile: target === 'banner' ? croppedFile : undefined,
      });
      onUpdate(updated);
      toast.success('Cover banner updated!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveBanner = async () => {
    setIsUploading(true);
    try {
      const updated = await channelService.updateChannelProfile(channel.id, {
        removeBanner: true,
      });
      onUpdate(updated);
      toast.success('Cover banner removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove banner');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <ImageCropModal
        open={cropTarget !== null}
        file={cropSourceFile}
        aspectRatio={4}
        title="Crop Organization Banner"
        onCancel={() => {
          setCropTarget(null);
          setCropSourceFile(null);
        }}
        onCropped={handleCropped}
      />

      <input
        type="file"
        ref={bannerInputRef}
        className="hidden"
        accept="image/jpeg, image/png, image/webp"
        onChange={handleBannerSelect}
      />

      <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-surface shadow-sm">
        {/* Full Hero Banner with all floating elements */}
        <div className="relative group/banner w-full overflow-hidden bg-slate-900">
          <ChannelDoodleBanner
            bannerUrl={channel.bannerUrl}
            className="w-full h-56 sm:h-64 md:h-72 object-cover"
          />

          {/* Dark gradient overlay for ultra-crisp text contrast */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Top Right: Change / Remove Banner */}
          {canEdit && (
            <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 px-3.5 py-1.5 text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
                title="Upload or change cover banner"
              >
                {isUploading && cropTarget === 'banner' ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Camera size={13} />
                )}
                <span>{channel.bannerUrl ? 'Change banner' : 'Upload banner'}</span>
              </button>

              {channel.bannerUrl && (
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  disabled={isUploading}
                  className="inline-flex cursor-pointer items-center justify-center rounded-full bg-black/50 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 h-8 w-8 shadow-md transition-all active:scale-95 disabled:opacity-50"
                  title="Remove cover banner"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}

          {/* Floating Profile Info & Actions Bar across the bottom of the banner */}
          <div className="absolute bottom-0 inset-x-0 z-20 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            {/* Left: Avatar + Identity Info */}
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-end min-w-0">
              <div className="relative group/avatar flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-surface/90 bg-slate-900 text-on-ink shadow-2xl backdrop-blur-md">
                {channel.iconUrl ? (
                  <img src={getAvatarUrl(channel.iconUrl)} alt={channel.name} className="h-full w-full object-cover" />
                ) : (
                  <svg
                    width="36"
                    height="36"
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
                )}

                {/* Logo / Profile Avatar hover camera button. A personal channel has no logo of its
                    own — it always shows the owner's profile picture — so there is nothing to change. */}
                {canEdit && !channel.isPersonal && onEditLogo && (
                  <button
                    type="button"
                    onClick={onEditLogo}
                    disabled={isUploading}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 cursor-pointer disabled:opacity-50"
                    title="Change logo (shown on your badges and certificates)"
                  >
                    <Camera size={18} className="mb-0.5" />
                    <span className="text-[10px] font-bold">Change</span>
                  </button>
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <div>
                  <h2 className="truncate text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl">
                    {channel.name}
                  </h2>
                  {channel.tagline && (
                    <p className="truncate text-[13px] font-medium text-white/80 drop-shadow">
                      {channel.tagline}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] font-semibold text-white/90">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 backdrop-blur-md px-2.5 py-0.5 text-white shadow-xs">
                    {channel.isPersonal ? <User size={12} /> : <Building2 size={12} />}
                    {channel.isPersonal ? 'Personal channel' : 'Organization'}
                  </span>
                  {channel.handle && (
                    <span className="text-sky-300 font-bold drop-shadow">@{channel.handle}</span>
                  )}
                  <span className="inline-flex items-center gap-1 drop-shadow">
                    Owner
                    {channel.ownerUsername ? (
                      <Link
                        href={`/${channel.ownerUsername}`}
                        className="text-white font-bold hover:underline"
                      >
                        @{channel.ownerUsername}
                      </Link>
                    ) : (
                      <span className="text-white font-bold">{channel.ownerName}</span>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1 text-white/70 drop-shadow">
                    <Calendar size={12} />
                    Since{' '}
                    {new Date(channel.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Floating Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {canEdit && onEditProfile && (
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-surface text-slate-900 hover:bg-slate-100 px-3.5 py-1.5 text-[12px] font-bold shadow-lg transition-all active:scale-95"
                >
                  <Edit3 size={13} /> Edit profile
                </button>
              )}

              <Link
                href={publicPath}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 px-3.5 py-1.5 text-[12px] font-semibold shadow-lg transition-all active:scale-95"
              >
                <ExternalLink size={13} /> View public page
              </Link>

              <button
                type="button"
                onClick={copyPublicLink}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 px-3.5 py-1.5 text-[12px] font-semibold shadow-lg transition-all active:scale-95"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Link2 size={13} />}
                {copied ? 'Copied' : 'Copy link'}
              </button>

              {links.map((link) => {
                const platform = socialPlatform(link);
                if (!platform) return null;
                const Icon = platform.icon;
                return (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all shadow-lg active:scale-95"
                    title={platform.label}
                  >
                    <Icon size={14} />
                  </a>
                );
              })}

              {channel.ownerEmail && (
                <a
                  href={`mailto:${channel.ownerEmail}`}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all shadow-lg active:scale-95"
                  title={`Email ${channel.ownerEmail}`}
                >
                  <Mail size={14} />
                </a>
              )}

              {canEdit && (
                <button
                  type="button"
                  onClick={() => setSocialOpen(true)}
                  className="flex h-8 cursor-pointer items-center gap-1 rounded-xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-dashed border-white/40 px-2.5 text-[12px] font-semibold transition-all shadow-lg active:scale-95"
                  title="Manage social links"
                >
                  <Plus size={14} />
                  {links.length === 0 && 'Add links'}
                </button>
              )}
            </div>
          </div>
        </div>

        {channel.description && (
          <p className="px-6 py-4 text-[13px] font-medium leading-relaxed text-slate-600 sm:px-7">
            {channel.description}
          </p>
        )}
      </div>

      {socialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div onClick={() => setSocialOpen(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-surface p-2 shadow-2xl">
            <div className="mb-2 flex items-center justify-between border-b border-slate-100 px-5 pb-3 pt-3">
              <div>
                <h3 className="text-[15px] font-bold text-ink">Social links</h3>
                <p className="text-[12px] font-medium text-slate-500">Shown on the channel&apos;s public page.</p>
              </div>
              <button
                type="button"
                onClick={() => setSocialOpen(false)}
                className="cursor-pointer rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3">
              <ChannelSocialLinksCard
                channel={channel}
                canManageSettings
                initialEditing
                onUpdate={(updated: Channel) => {
                  onUpdate(updated);
                  setSocialOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
