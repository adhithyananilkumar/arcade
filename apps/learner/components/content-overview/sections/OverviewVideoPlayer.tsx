'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface OverviewVideoPlayerProps {
  posterUrl: string;
  title: string;
}

export function OverviewVideoPlayer({ posterUrl, title }: OverviewVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-slate-900 shadow-sm">
      {!isPlaying ? (
        <div className="group relative aspect-[16/9] w-full overflow-hidden cursor-pointer" onClick={() => setIsPlaying(true)}>
          <img
            src={posterUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent" />

          {/* Badge Tag */}
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-slate-950/60 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Course Video Preview
          </div>

          {/* Centered Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-surface/90 text-blue-600 shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-surface dark:text-blue-400">
              <Play size={28} className="ml-1 fill-current" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative aspect-[16/9] w-full bg-black">
          <iframe
            src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
            title={title}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
