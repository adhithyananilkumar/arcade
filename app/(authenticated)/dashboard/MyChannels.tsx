'use client';

import { useState, useEffect } from 'react';
import { Channel, channelService } from '@/services/channel.service';
import { Tv, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function MyChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyChannels();
  }, []);

  const fetchMyChannels = async () => {
    try {
      setLoading(true);
      const data = await channelService.getMyChannels();
      setChannels(data);
    } catch (error) {
      toast.error('Failed to load your channels');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading your channels...</div>;
  if (channels.length === 0) return null;

  return (
    <div className="space-y-4">
      {channels.map((channel) => (
        <div key={channel.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 overflow-hidden shrink-0">
              {channel.iconUrl ? (
                <img src={channel.iconUrl} alt={channel.name} className="h-full w-full object-cover" />
              ) : (
                <Tv size={24} />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{channel.name}</h4>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                {channel.status === 'PENDING' ? (
                  <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                    <Clock size={12} className="mr-1" /> Pending Review
                  </span>
                ) : (
                  <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle size={12} className="mr-1" /> Active
                  </span>
                )}
                <span className="ml-2">{channel.isPersonal ? 'Personal' : 'Organization'}</span>
              </p>
            </div>
          </div>
          {channel.status === 'ACTIVE' && (
            <a
              href={`/channels/${channel.id}/manage`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shrink-0"
            >
              Manage Channel
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
