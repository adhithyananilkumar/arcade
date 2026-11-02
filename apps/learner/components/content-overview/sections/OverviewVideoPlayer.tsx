'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface OverviewVideoPlayerProps {
  previewUrl: string;
  posterUrl?: string | null;
  title: string;
}

export function parsePreviewMedia(url: string) {
  const clean = url.trim();
  const ytMatch = clean.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch) {
    return {
      kind: 'youtube' as const,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
    };
  }
  const vimeoMatch = clean.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/
  );
  if (vimeoMatch) {
    return {
      kind: 'vimeo' as const,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      thumbnailUrl: null,
    };
  }
  if (
    clean.startsWith('data:image/') ||
    /\.(jpeg|jpg|gif|png|webp|svg|avif)(\?.*)?$/i.test(clean)
  ) {
    return {
      kind: 'image' as const,
      embedUrl: clean,
      thumbnailUrl: clean,
    };
  }
  // Video (mp4, webm, mov, etc. or direct media URL)
  return {
    kind: 'video' as const,
    embedUrl: clean,
    thumbnailUrl: null,
  };
}

export function OverviewVideoPlayer({ previewUrl, posterUrl, title }: OverviewVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const media = parsePreviewMedia(previewUrl);

  const displayPoster =
    posterUrl ||
    media.thumbnailUrl ||
    'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80';

  if (media.kind === 'image') {
    return (
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-slate-900 shadow-sm aspect-[16/9] w-full">
        <img
          src={media.embedUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-slate-950/60 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          Course Preview
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-slate-900 shadow-sm">
      {!isPlaying ? (
        <div
          className="group relative aspect-[16/9] w-full overflow-hidden cursor-pointer"
          onClick={() => setIsPlaying(true)}
        >
          <img
            src={displayPoster}
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
          {media.kind === 'video' ? (
            <video
              src={media.embedUrl}
              controls
              autoPlay
              className="h-full w-full object-contain"
            />
          ) : (
            <iframe
              src={media.embedUrl}
              title={title}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      )}
    </div>
  );
}
