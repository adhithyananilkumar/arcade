'use client';

import { useState } from 'react';
import { Channel, channelService } from '@/domains/channels';
import { toast } from 'sonner';
import { Trash2, Loader2, Plus } from 'lucide-react';

interface Props {
  channel: Channel;
  canManageSettings: boolean;
  onUpdate: (updatedChannel: Channel) => void;
}

export function ChannelSocialLinksCard({ channel, canManageSettings, onUpdate }: Props) {
  const [socialLinks, setSocialLinks] = useState<string[]>(channel.socialLinks || []);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const updatedChannel = await channelService.updateChannelSettings(
        channel.id,
        channel.description || '',
        undefined,
        undefined,
        false,
        false,
        socialLinks.filter(link => link.trim() !== '')
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

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_4px_16px_rgba(20,20,43,0.03)] mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold tracking-tight text-[#14142b]">Social Links</h3>
        {canManageSettings && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Edit links
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="flex flex-wrap gap-2.5">
          {socialLinks.length > 0 ? (
            socialLinks.map((link, idx) => {
              try {
                const url = new URL(link);
                const hostname = url.hostname.replace(/^www\./, '');
                return (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:bg-[#14142b] hover:text-white"
                  >
                    {hostname}
                  </a>
                );
              } catch (e) {
                return null;
              }
            })
          ) : (
            <p className="text-[13px] text-slate-500 italic">No social links added yet.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="url"
                value={link}
                onChange={(e) => {
                  const newLinks = [...socialLinks];
                  newLinks[index] = e.target.value;
                  setSocialLinks(newLinks);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-[#14142b] outline-none transition-colors placeholder:text-slate-400 focus:border-[#14142b]/30 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                placeholder="e.g. https://www.linkedin.com/in/username"
              />
              <button
                type="button"
                onClick={() => {
                  const newLinks = socialLinks.filter((_, i) => i !== index);
                  setSocialLinks(newLinks);
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          
          <div className="flex items-center justify-between pt-2">
            {socialLinks.length < 4 ? (
              <button
                type="button"
                onClick={() => setSocialLinks([...socialLinks, ''])}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <Plus size={14} /> Add another link
              </button>
            ) : (
              <span className="text-[12px] text-slate-400">Maximum 4 links allowed</span>
            )}
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSocialLinks(channel.socialLinks || []);
                  setIsEditing(false);
                }}
                disabled={loading}
                className="rounded-full px-4 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-[#14142b] px-4 py-2 text-[12px] font-semibold text-white shadow-md transition-colors hover:bg-[#232735] disabled:opacity-50"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Save links
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
