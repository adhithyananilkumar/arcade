'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  Check,
  Edit3,
  ExternalLink,
  Globe,
  Link2,
  Mail,
  Plus,
  User,
  X,
} from 'lucide-react';
import type { Channel } from '@/domains/channels';
import { Panel } from '@/shared/design-system/ui/panel';
import { toast } from 'sonner';
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

const chip =
  'flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-[#14142b] dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200';

const actionBtn =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200 dark:hover:bg-neutral-700';

interface Props {
  channel: Channel;
  canEdit: boolean;
  onUpdate: (channel: Channel) => void;
  onEditProfile?: () => void;
}

/** The channel as the world sees it — banner, mark, name, owner, links — in one compact card. */
export function ChannelProfileCard({ channel, canEdit, onUpdate, onEditProfile }: Props) {
  const [socialOpen, setSocialOpen] = useState(false);
  const [copied, setCopied] = useState(false);
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

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div
          className="relative w-full overflow-hidden border-b border-slate-200/70 bg-[#F5F0E6] text-black"
          style={{
            backgroundColor: '#F5F0E6',
            backgroundImage: `radial-gradient(#14142b 0.8px, transparent 0.8px)`,
            backgroundSize: '24px 24px',
          }}
        >
          {/* Top Banner section with doodles or custom banner */}
          <ChannelDoodleBanner bannerUrl={channel.bannerUrl} className="h-32 w-full sm:h-44 border-b-0" />

        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:px-6 sm:pb-6">
          <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white text-slate-700 shadow-md ring-1 ring-slate-900/5">
            {channel.iconUrl ? (
              <img src={channel.iconUrl} alt="" className="h-full w-full object-cover bg-white" />
            ) : channel.isPersonal ? (
              <User size={30} strokeWidth={1.75} className="text-slate-400" />
            ) : (
              <Building2 size={30} strokeWidth={1.75} className="text-slate-400" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h2 className="truncate text-xl font-bold tracking-tight text-[#14142b]">{channel.name}</h2>
              {channel.tagline && (
                <p className="truncate text-[13px] font-medium text-slate-600">{channel.tagline}</p>
              )}
            </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300/80 bg-white/85 backdrop-blur-sm px-2.5 py-0.5 text-slate-800 shadow-xs">
                  {channel.isPersonal ? <User size={12} /> : <Building2 size={12} />}
                  {channel.isPersonal ? 'Personal channel' : 'Organization'}
                </span>
                {channel.handle && <span className="text-indigo-600 font-bold">@{channel.handle}</span>}
                <span className="inline-flex items-center gap-1">
                  Owner
                  {channel.ownerUsername ? (
                    <Link href={`/${channel.ownerUsername}`} className="text-slate-800 font-bold hover:underline">
                      @{channel.ownerUsername}
                    </Link>
                  ) : (
                    <span className="text-slate-800 font-bold">{channel.ownerName}</span>
                  )}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Calendar size={12} />
                  Since {new Date(channel.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canEdit && onEditProfile && (
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#14142b] px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-xs transition-colors hover:bg-[#232735]"
                >
                  <Edit3 size={13} /> Edit profile
                </button>
              )}

              <Link href={publicPath} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-300/80 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 text-[12px] font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-400 hover:bg-white">
                <ExternalLink size={13} /> View public page
              </Link>

              <button type="button" onClick={copyPublicLink} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-300/80 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 text-[12px] font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-400 hover:bg-white">
                {copied ? <Check size={13} className="text-emerald-600" /> : <Link2 size={13} />}
                {copied ? 'Copied' : 'Copy link'}
              </button>

              {links.map((link) => {
                const platform = socialPlatform(link);
                if (!platform) return null;
                const Icon = platform.icon;
                return (
                  <a key={link} href={link} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300/80 bg-white/90 backdrop-blur-sm text-slate-700 transition-colors hover:border-slate-400 hover:bg-white hover:text-[#14142b]" title={platform.label}>
                    <Icon size={14} />
                  </a>
                );
              })}
              {channel.ownerEmail && (
                <a href={`mailto:${channel.ownerEmail}`} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300/80 bg-white/90 backdrop-blur-sm text-slate-700 transition-colors hover:border-slate-400 hover:bg-white hover:text-[#14142b]" title={`Email ${channel.ownerEmail}`}>
                  <Mail size={14} />
                </a>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setSocialOpen(true)}
                  className="flex h-8 cursor-pointer items-center gap-1 rounded-xl border border-dashed border-slate-400/80 bg-white/60 px-2.5 text-[12px] font-semibold text-slate-700 transition-colors hover:border-slate-600 hover:bg-white"
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
          <p className="px-5 py-4 text-[13px] font-medium leading-relaxed text-slate-600 sm:px-6 dark:text-slate-300">
            {channel.description}
          </p>
        )}
      </div>

      {socialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div onClick={() => setSocialOpen(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl">
            <div className="mb-2 flex items-center justify-between border-b border-slate-100 px-5 pb-3 pt-3">
              <div>
                <h3 className="text-[15px] font-bold text-[#14142b]">Social links</h3>
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
