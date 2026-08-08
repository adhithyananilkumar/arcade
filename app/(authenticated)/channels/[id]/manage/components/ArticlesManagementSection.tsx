'use client';

import { useState } from 'react';
import {
  FileText,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Clock,
  Calendar,
  Plus,
  Edit3,
  ExternalLink,
  CheckCircle2,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export interface ArticleItem {
  id: string;
  title: string;
  coverImage: string;
  author: string;
  authorAvatar: string;
  category: string;
  publishDate: string;
  readingTime: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  status: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED';
}

const mockArticles: ArticleItem[] = [
  {
    id: 'art-1',
    title: 'Architecting Scalable RAG Systems with Vector Databases and Llama 3',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    author: 'Dr. Sarah Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    category: 'AI Architecture',
    publishDate: 'Aug 2, 2026',
    readingTime: '8 min read',
    views: 14200,
    likes: 1840,
    comments: 240,
    shares: 420,
    status: 'PUBLISHED',
  },
  {
    id: 'art-2',
    title: 'Why Fine-Tuning is Replacing Generic Prompting in Enterprise Workflows',
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
    author: 'Alex Rivera',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    category: 'Enterprise AI',
    publishDate: 'Jul 28, 2026',
    readingTime: '6 min read',
    views: 9800,
    likes: 1120,
    comments: 135,
    shares: 280,
    status: 'PUBLISHED',
  },
  {
    id: 'art-3',
    title: 'Building Autonomous AI Agents with Tool Calling Capabilities',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    author: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    category: 'Autonomous Agents',
    publishDate: 'Scheduled Aug 12',
    readingTime: '10 min read',
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    status: 'SCHEDULED',
  },
];

export function ArticlesManagementSection() {
  const [articles, setArticles] = useState<ArticleItem[]>(mockArticles);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleTogglePublish = (id: string) => {
    setArticles(
      articles.map((a) =>
        a.id === id
          ? { ...a, status: a.id === 'art-3' ? 'PUBLISHED' : a.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' }
          : a,
      ),
    );
    toast.success('Article status updated');
    setActiveMenuId(null);
  };

  const handleDelete = (id: string) => {
    setArticles(articles.filter((a) => a.id !== id));
    toast.success('Article deleted');
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#14142b]">
            Articles & Publications
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            Publish technical posts, research updates, and educational guides
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.info('Opening Article Editor...')}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          <Plus size={15} />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(20,20,43,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            {/* Cover Image & Category */}
            <div className="relative h-44 w-full overflow-hidden bg-slate-100">
              <img
                src={article.coverImage}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs ${
                    article.status === 'PUBLISHED'
                      ? 'bg-emerald-500'
                      : article.status === 'SCHEDULED'
                      ? 'bg-purple-600'
                      : 'bg-amber-500'
                  }`}
                >
                  {article.status}
                </span>
                <span className="rounded-full bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white">
                  {article.category}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveMenuId(activeMenuId === article.id ? null : article.id)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
              >
                <MoreVertical size={14} />
              </button>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {article.publishDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {article.readingTime}
                </span>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#14142b] line-clamp-2 leading-snug">
                  {article.title}
                </h3>

                <div className="mt-3 flex items-center gap-2">
                  <img
                    src={article.authorAvatar}
                    alt={article.author}
                    className="h-6 w-6 rounded-full object-cover border border-slate-200"
                  />
                  <span className="text-xs font-bold text-slate-700">{article.author}</span>
                </div>
              </div>

              {/* Engagement Stats Row */}
              <div className="grid grid-cols-4 gap-1 border-t border-slate-100 pt-3 text-center text-[11px] font-bold text-slate-600">
                <div className="flex flex-col items-center">
                  <Eye size={13} className="text-slate-400 mb-0.5" />
                  <span>{article.views.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Heart size={13} className="text-rose-500 mb-0.5" />
                  <span>{article.likes.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-center">
                  <MessageSquare size={13} className="text-indigo-500 mb-0.5" />
                  <span>{article.comments}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Share2 size={13} className="text-teal-500 mb-0.5" />
                  <span>{article.shares}</span>
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => toast.info(`Previewing ${article.title}`)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => toast.info(`Editing article ${article.title}`)}
                  className="rounded-xl bg-[#14142b] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-900"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Actions Menu */}
            <AnimatePresence>
              {activeMenuId === article.id && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-12 right-4 z-30 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
                >
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(article.id)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Toggle Status</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(article.id)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 size={14} />
                    <span>Delete Article</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
