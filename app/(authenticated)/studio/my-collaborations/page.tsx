'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/infrastructure/http/api';
import { Wrench, ArrowRight, Clock, User, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface EventCollaboratorDto {
  id: string;
  title: string;
  category: string;
  status: string;
  eventType: string;
  coverImageUrl: string;
  sessionsCount: number;
  resourcesCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function MyCollaborationsPage() {
  const router = useRouter();
  const [workshops, setEvents] = useState<EventCollaboratorDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<EventCollaboratorDto[]>('/api/v1/events/my-collaborations')
      .then(res => {
        setEvents(res || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load collaborated workshops');
        setLoading(false);
      });
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-48 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          <div className="h-48 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          <div className="h-48 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">My Collaborations</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a workshop or webinar you have been invited to collaborate on.</p>
      </div>

      {workshops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10">
          <Wrench className="h-10 w-10 text-zinc-400 mb-3" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">No collaborations found</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">You will see workshops here once you are invited as a collaborator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <div 
              key={workshop.id}
              className="flex flex-col gap-4 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/50 shadow-xs hover:shadow-md transition-all hover:border-zinc-300 dark:hover:border-zinc-800"
            >
              {workshop.coverImageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 relative">
                  <img 
                    src={workshop.coverImageUrl} 
                    alt={workshop.title} 
                    className="h-full w-full object-cover" 
                  />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50">
                      {workshop.status}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50">
                    <Wrench size={10} /> {workshop.eventType}
                  </span>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">• {workshop.category}</span>
                </div>

                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px] leading-snug line-clamp-2">
                  {workshop.title || 'Untitled Event'}
                </h3>
                
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                  <Clock size={12} />
                  <span>Last edited: {formatDate(workshop.updatedAt)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Link
                  href={`/studio/events/${workshop.id}`}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl transition-all"
                >
                  Manage Event <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
