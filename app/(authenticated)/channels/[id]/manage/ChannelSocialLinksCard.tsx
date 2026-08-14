'use client';

import { useState } from 'react';
import { Channel, channelService } from '@/domains/channels';
import { toast } from 'sonner';
import { Trash2, Loader2, Plus, Share2, Globe, ExternalLink, Edit3, Link2 } from 'lucide-react';

interface Props {
  channel: Channel;
  canManageSettings: boolean;
  onUpdate: (updatedChannel: Channel) => void;
  initialEditing?: boolean;
}

function getPlatformDetails(urlStr: string) {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host.includes('linkedin')) {
      return { label: 'LinkedIn', displayHost: host, badgeClass: 'bg-sky-50/90 text-sky-700 border-sky-200/80 hover:bg-sky-600 hover:text-white hover:border-sky-600 shadow-sky-500/10' };
    }
    if (host.includes('github')) {
      return { label: 'GitHub', displayHost: host, badgeClass: 'bg-slate-100/90 text-slate-800 border-slate-300/80 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-slate-500/10' };
    }
    if (host.includes('twitter') || host.includes('x.com')) {
      return { label: 'X (Twitter)', displayHost: host, badgeClass: 'bg-neutral-100/90 text-neutral-800 border-neutral-300/80 hover:bg-black hover:text-white hover:border-black shadow-black/10' };
    }
    if (host.includes('youtube')) {
      return { label: 'YouTube', displayHost: host, badgeClass: 'bg-rose-50/90 text-rose-700 border-rose-200/80 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-rose-500/10' };
    }
    if (host.includes('instagram')) {
      return { label: 'Instagram', displayHost: host, badgeClass: 'bg-pink-50/90 text-pink-700 border-pink-200/80 hover:bg-pink-600 hover:text-white hover:border-pink-600 shadow-pink-500/10' };
    }
    return { label: host, displayHost: host, badgeClass: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-emerald-500/10' };
  } catch (e) {
    return { label: urlStr, displayHost: urlStr, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-800 hover:text-white' };
  }
}

const PLATFORM_PREVIEWS = [
  { name: 'GitHub', color: 'hover:bg-slate-900 hover:text-white hover:border-slate-900' },
  { name: 'LinkedIn', color: 'hover:bg-sky-600 hover:text-white hover:border-sky-600' },
  { name: 'X / Twitter', color: 'hover:bg-black hover:text-white hover:border-black' },
  { name: 'Website', color: 'hover:bg-emerald-600 hover:text-white hover:border-emerald-600' },
];

export function ChannelSocialLinksCard({ channel, canManageSettings, onUpdate, initialEditing = false }: Props) {
  const [socialLinks, setSocialLinks] = useState<string[]>(
    channel.socialLinks && channel.socialLinks.length > 0 ? channel.socialLinks : ['']
  );
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(
    initialEditing || !channel.socialLinks || channel.socialLinks.length === 0
  );

  const startEditing = () => {
    if (socialLinks.length === 0 || (socialLinks.length === 1 && socialLinks[0].trim() === '')) {
      setSocialLinks(['']);
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const cleanLinks = socialLinks.filter(link => link.trim() !== '');
      const updatedChannel = await channelService.updateChannelSettings(
        channel.id,
        channel.description || '',
        undefined,
        undefined,
        false,
        false,
        cleanLinks
      );
      toast.success('Social links updated successfully');
      onUpdate(updatedChannel);
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update social links');
    } finally {
      setLoading(false);
    }
  };

  if (!canManageSettings && (!channel.socialLinks || channel.socialLinks.length === 0)) {
    return null;
  }

  const activeValidLinks = (channel.socialLinks || []).filter(l => l.trim() !== '');

  return (
    <section className="relative p-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-[0_6px_20px_rgba(16,185,129,0.3)] ring-4 ring-emerald-50/80">
            <Share2 size={19} />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight text-slate-900">Social Links</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Connect your channel across external social profiles</p>
          </div>
        </div>

        {canManageSettings && !isEditing && (
          <button
            type="button"
            onClick={startEditing}
            className="group/btn inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-white/90 px-4 py-1.5 text-xs font-bold text-emerald-700 shadow-2xs transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-600 hover:text-white hover:border-transparent hover:shadow-[0_4px_16px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            <Edit3 size={13} className="transition-transform group-hover/btn:scale-110" />
            <span>Edit links</span>
          </button>
        )}
      </div>

      {!isEditing ? (
        <div>
          {activeValidLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {activeValidLinks.map((link, idx) => {
                const details = getPlatformDetails(link);
                return (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group/link inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold transition-all duration-200 shadow-2xs hover:-translate-y-0.5 hover:shadow-md ${details.badgeClass}`}
                  >
                    <Globe size={14} className="shrink-0 opacity-70" />
                    <span>{details.displayHost}</span>
                    <ExternalLink size={12} className="shrink-0 opacity-50 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-emerald-200/70 bg-gradient-to-r from-emerald-50/50 via-white/80 to-teal-50/40 p-5 backdrop-blur-xs transition-colors hover:border-emerald-300">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-600 border border-emerald-200/60 shadow-2xs">
                    <Link2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">No social links added yet</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Showcase your GitHub, LinkedIn, Website, or X profiles directly on your channel banner.</p>
                  </div>
                </div>
                {canManageSettings && (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-extrabold text-white shadow-[0_6px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.35)] hover:scale-[1.03] transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={15} /> Add Links
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {(socialLinks.length > 0 ? socialLinks : ['']).map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input
                  type="url"
                  value={link}
                  onChange={(e) => {
                    const newLinks = [...(socialLinks.length > 0 ? socialLinks : [''])];
                    newLinks[index] = e.target.value;
                    setSocialLinks(newLinks);
                  }}
                  className="w-full rounded-2xl border border-emerald-200/80 bg-white pl-9.5 pr-4 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100/70 shadow-2xs"
                  placeholder="https://www.linkedin.com/in/username"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const newLinks = socialLinks.filter((_, i) => i !== index);
                  setSocialLinks(newLinks.length > 0 ? newLinks : ['']);
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer"
                title="Remove link"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between pt-3 border-t border-emerald-100/80">
            {socialLinks.length < 4 ? (
              <button
                type="button"
                onClick={() => setSocialLinks([...socialLinks, ''])}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <Plus size={15} /> Add another link
              </button>
            ) : (
              <span className="text-xs font-medium text-slate-400">Maximum 4 links allowed</span>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSocialLinks(
                    channel.socialLinks && channel.socialLinks.length > 0 ? channel.socialLinks : ['']
                  );
                  setIsEditing(false);
                }}
                disabled={loading}
                className="rounded-full px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Save links
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Single Line Supported Platforms Footer Bar */}
      <div className="flex items-center gap-2.5 pt-3 mt-4 border-t border-emerald-100/70 whitespace-nowrap overflow-x-auto">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">
          Supported:
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {PLATFORM_PREVIEWS.map((p, i) => (
            <span
              key={i}
              className={`inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 transition-all whitespace-nowrap shrink-0 ${p.color}`}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
