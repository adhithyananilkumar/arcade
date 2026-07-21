'use client';

import { useState, useEffect } from 'react';
import { Channel, channelService } from "@/domains/channels";
import { Tv, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export function MyChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyChannels();
  }, []);

  const fetchMyChannels = async () => {
    try {
      setLoading(true);
      const [ownedChannels, workspaces] = await Promise.all([
        channelService.getMyChannels(),
        channelService.getMyWorkspaces()
      ]);
      
      // Combine and remove duplicates by ID
      const allChannelsMap = new Map();
      ownedChannels.forEach(c => allChannelsMap.set(c.id, c));
      workspaces.forEach(c => allChannelsMap.set(c.id, c));
      
      setChannels(Array.from(allChannelsMap.values()));
    } catch (error) {
      toast.error('Failed to load your channels');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-sm text-gray-500 dark:text-neutral-400">Loading your channels...</div>;
  if (channels.length === 0) return (
    <div className="text-center py-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20 mb-3">
        <Tv size={24} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white transition-colors">No channels yet</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400 transition-colors">
        You haven't created or joined any channels. 
        Head to Settings to create your first channel!
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {channels.map((channel) => (
        <div key={channel.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 overflow-hidden shrink-0 transition-colors">
              {channel.iconUrl ? (
                <img src={channel.iconUrl} alt={channel.name} className="h-full w-full object-cover" />
              ) : (
                <Tv size={24} />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white transition-colors">{channel.name}</h4>
              <p className="text-xs text-gray-500 dark:text-neutral-400 flex items-center gap-1 mt-1 transition-colors">
                {channel.status === 'PENDING' ? (
                  <span className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full font-medium transition-colors">
                    <Clock size={12} className="mr-1" /> Pending Review
                  </span>
                ) : channel.status === 'SUSPENDED' ? (
                  <span className="flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full font-medium transition-colors">
                    <CheckCircle size={12} className="mr-1" /> Suspended
                  </span>
                ) : (
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full font-medium transition-colors">
                    <CheckCircle size={12} className="mr-1" /> Active
                  </span>
                )}
                <span className="ml-2">{channel.isPersonal ? 'Personal' : 'Organization'}</span>
              </p>
            </div>
          </div>
          {channel.status !== 'SUSPENDED' && (
            <Link
              href={`/channels/${channel.id}/manage`}
              className="flex items-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors shrink-0"
            >
              Manage Channel
              <ExternalLink size={14} />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
