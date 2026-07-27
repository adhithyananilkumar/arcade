'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useCreatePost } from '../api/forum.queries';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Image as ImageIcon, Send, Sparkles, X, LogIn } from 'lucide-react';

export function PostCreateCard() {
  const { user, status } = useAuthStore();
  const router = useRouter();
  const { mutate: createPost, isPending } = useCreatePost();

  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isAuthenticated = status === 'authenticated' && !!user;

  const handleExpand = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to share a discussion or post!');
      router.push('/sign?returnTo=/forum');
      return;
    }
    setIsExpanded(true);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1400;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const newUrls: string[] = [];
    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`Image ${file.name} exceeds 20MB limit.`);
        continue;
      }
      try {
        const base64 = await compressImage(file);
        newUrls.push(base64);
      } catch (err) {
        toast.error(`Failed to read image ${file.name}`);
      }
    }
    setMediaUrls((prev) => [...prev, ...newUrls]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/sign?returnTo=/forum');
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required.');
      return;
    }
    createPost(
      {
        title: title.trim(),
        content: content.trim(),
        mediaUrl: mediaUrls[0] || undefined,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      },
      {
        onSuccess: () => {
          setTitle('');
          setContent('');
          setMediaUrls([]);
          setIsExpanded(false);
        },
      }
    );
  };

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-all duration-300 mb-6">
      {!isExpanded ? (
        <div
          onClick={handleExpand}
          className="flex items-center gap-4 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/60 dark:border-neutral-700/60 hover:border-blue-500/50 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
            {isAuthenticated ? (user.username?.[0] || user.firstName?.[0] || 'U').toUpperCase() : <Sparkles className="w-5 h-5" />}
          </div>
          <div className="flex-1 text-slate-500 dark:text-neutral-400 text-sm font-medium">
            What&apos;s on your mind? Share a discussion, project, or question...
          </div>
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors shadow-sm shrink-0">
            Post
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
            <h3 className="font-semibold text-slate-800 dark:text-neutral-100 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Create Discussion
            </h3>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <input
              type="text"
              placeholder="Title of your discussion or question..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <textarea
              placeholder="Share details, code snippets, or ideas here..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-y"
              required
            />
          </div>

          {mediaUrls.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-600 dark:text-neutral-300">
                <span>Attached Photos ({mediaUrls.length})</span>
                <button
                  type="button"
                  onClick={() => setMediaUrls([])}
                  className="text-red-500 hover:underline"
                >
                  Remove All
                </button>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {mediaUrls.map((url, index) => (
                  <div key={index} className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-neutral-700 group">
                    <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setMediaUrls((prev) => prev.filter((_, idx) => idx !== index))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors opacity-80 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-800">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 text-xs font-medium transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-blue-500" />
              {mediaUrls.length > 0 ? `Attach More Photos (${mediaUrls.length})` : 'Attach Photos'}
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !title.trim() || !content.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm shadow-blue-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                {isPending ? 'Posting...' : 'Publish Post'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
