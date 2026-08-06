'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Channel,
  ChannelContentItem,
  ChannelDeletionRequestDto,
  channelService,
} from '@/domains/channels';
import { toast } from 'sonner';
import { Dock, DockIcon, DockItem, DockLabel } from '@/shared/design-system/ui/dock';
import {
  Tv,
  Upload,
  Settings,
  Users,
  BarChart3,
  Video,
  Loader2,
  ArrowLeft,
  LayoutGrid,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Wrench,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Plus,
  Radio,
  Megaphone,
  HelpCircle,
  Calendar,
  Grid as GridIcon,
  Star,
  TrendingUp,
  Award,
  Trophy,
  MessageSquare,
  Trash2,
  ArrowUpRight,
  Layers,
  Activity,
  User,
  Bell,
  Eye,
  GraduationCap,
  Globe,
  Mail,
  Menu,
  X,
  Share2,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChannelSettingsManager } from './ChannelSettingsManager';
import { ChannelStaffManager } from './ChannelStaffManager';
import { ChannelDangerZone } from './ChannelDangerZone';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

type ManageTab =
  | 'OVERVIEW'
  | 'COURSES'
  | 'ARTICLES'
  | 'EVENTS'
  | 'LEARNERS'
  | 'REVIEWS'
  | 'EARNINGS'
  | 'ANALYTICS'
  | 'ACHIEVEMENTS'
  | 'STAFF'
  | 'SETTINGS'
  | 'DANGER';
type ContentFilter = 'ALL' | 'PUBLISHED' | 'DRAFT' | 'SUBMITTED' | 'SCHEDULED' | 'ARCHIVED';

// ─── Dummy / Fallback Mock Data for Rich Dashboard Aesthetics ─────────
const INITIAL_COURSES = [
  {
    id: 'c1',
    title: 'React - The Complete Guide 2024',
    status: 'PUBLISHED',
    enrolled: '12.5K',
    rating: '4.8',
    updated: '2 days ago',
    coverBg: 'from-blue-600 to-indigo-900',
    type: 'COURSE',
    iconType: 'react'
  },
  {
    id: 'c2',
    title: 'Figma UI/UX Design Mastery',
    status: 'PUBLISHED',
    enrolled: '8.9K',
    rating: '4.7',
    updated: '5 days ago',
    coverBg: 'from-purple-600 to-pink-600',
    type: 'COURSE',
    iconType: 'figma'
  },
  {
    id: 'c3',
    title: 'JavaScript Advanced Concepts',
    status: 'DRAFT',
    enrolled: '-',
    rating: '-',
    updated: '3 days ago',
    coverBg: 'from-[#F7DF1E] to-[#E5C209]',
    type: 'COURSE',
    iconType: 'js'
  },
  {
    id: 'c4',
    title: 'UI Animation with Framer Motion',
    status: 'UNDER REVIEW',
    enrolled: '3.1K',
    rating: '4.6',
    updated: '1 week ago',
    coverBg: 'from-cyan-500 to-blue-600',
    type: 'COURSE',
    iconType: 'motion'
  },
  {
    id: 'c5',
    title: 'Next.js 14 Full Stack Architecture',
    status: 'PUBLISHED',
    enrolled: '6.4K',
    rating: '4.9',
    updated: '4 days ago',
    coverBg: 'from-slate-800 to-slate-950',
    type: 'COURSE',
    iconType: 'react'
  },
  {
    id: 'c6',
    title: 'GraphQL & Apollo Masterclass',
    status: 'DRAFT',
    enrolled: '-',
    rating: '-',
    updated: 'Yesterday',
    coverBg: 'from-pink-600 to-rose-700',
    type: 'COURSE',
    iconType: 'js'
  },
  {
    id: 'c7',
    title: 'Vue.js 3 & Pinia Deep Dive',
    status: 'SCHEDULED',
    enrolled: '1.2K',
    rating: '-',
    updated: 'Scheduled 15 Aug',
    coverBg: 'from-emerald-600 to-teal-800',
    type: 'COURSE',
    iconType: 'react'
  }
];



export default function ManageChannelPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.id as string;
  const { user } = useAuthStore();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [pendingDeletionRequest, setPendingDeletionRequest] =
    useState<ChannelDeletionRequestDto | null>(null);
  const [content, setContent] = useState<ChannelContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ManageTab>('OVERVIEW');
  const [courseFilter, setCourseFilter] = useState<string>('All');
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('This Month');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Central Edit Profile & Banner Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [modalName, setModalName] = useState('');
  const [modalTitle, setModalTitle] = useState('UI/UX Designer • Educator • Mentor');
  const [modalBio, setModalBio] = useState('');
  const [modalWebsite, setModalWebsite] = useState('https://arcade.dev');
  const [modalLinkedin, setModalLinkedin] = useState('https://linkedin.com');
  const [modalTwitter, setModalTwitter] = useState('https://x.com');
  const [modalEmail, setModalEmail] = useState('');
  const [modalIconFile, setModalIconFile] = useState<File | null>(null);
  const [modalBannerFile, setModalBannerFile] = useState<File | null>(null);
  const [modalIconPreview, setModalIconPreview] = useState<string>('');
  const [modalBannerPreview, setModalBannerPreview] = useState<string>('');
  const [savingModal, setSavingModal] = useState(false);

  useEffect(() => {
    if (channelId) fetchChannel();
  }, [channelId]);

  const fetchChannel = async () => {
    try {
      setLoading(true);
      const [channelData, perms, myDeletionRequests, channelContent] = await Promise.all([
        channelService.getChannel(channelId),
        channelService.getMyChannelPermissions(channelId),
        channelService.getMyDeletionRequests().catch(() => []),
        channelService.getChannelContent(channelId).catch(() => [] as ChannelContentItem[]),
      ]);
      setChannel(channelData);
      setModalName(channelData.ownerName || user?.fullName || 'Anna Christina Johny');
      setModalBio(channelData.description || '');
      setModalEmail(user?.email || 'anna@arcade.dev');
      setModalIconPreview(user?.avatarUrl || channelData.iconUrl || '');
      setModalBannerPreview(channelData.bannerUrl || '');
      setPermissions(perms);
      setPendingDeletionRequest(
        myDeletionRequests.find((r) => r.channelId === channelId && r.status === 'PENDING') ||
        null,
      );
      setContent(channelContent);
    } catch {
      toast.error('Failed to load channel details');
      router.push('/manage-channels');
    } finally {
      setLoading(false);
    }
  };

  const allCourses = useMemo(() => {
    if (content && content.length > 0) {
      const mapped = content.map((c, idx) => ({
        id: c.id || `api-${idx}`,
        title: c.title || 'Untitled Course',
        status: (c.status || 'PUBLISHED').toUpperCase(),
        enrolled: '1.2K',
        rating: '4.8',
        updated: 'Recently',
        coverBg: 'from-blue-600 to-indigo-900',
        type: c.type || 'COURSE',
        iconType: 'react',
      }));
      const existingTitles = new Set(mapped.map((m) => m.title.toLowerCase()));
      const rest = INITIAL_COURSES.filter((ic) => !existingTitles.has(ic.title.toLowerCase()));
      return [...mapped, ...rest];
    }
    return INITIAL_COURSES;
  }, [content]);

  const stats = useMemo(() => {
    const published = allCourses.filter((c) => c.status === 'PUBLISHED').length;
    const drafts = allCourses.filter((c) => c.status === 'DRAFT').length;
    const inReview = allCourses.filter((c) => c.status === 'UNDER REVIEW' || c.status === 'SUBMITTED').length;
    const scheduled = allCourses.filter((c) => c.status === 'SCHEDULED').length;
    const archived = allCourses.filter((c) => c.status === 'ARCHIVED').length;
    return {
      total: allCourses.length,
      published,
      drafts,
      inReview,
      scheduled,
      archived,
    };
  }, [allCourses]);

  const filteredCourses = useMemo(() => {
    if (courseFilter === 'All') return allCourses;
    if (courseFilter === 'Published') return allCourses.filter((c) => c.status === 'PUBLISHED');
    if (courseFilter === 'Drafts') return allCourses.filter((c) => c.status === 'DRAFT');
    if (courseFilter === 'Under Review') return allCourses.filter((c) => c.status === 'UNDER REVIEW' || c.status === 'SUBMITTED');
    if (courseFilter === 'Scheduled') return allCourses.filter((c) => c.status === 'SCHEDULED');
    if (courseFilter === 'Archived') return allCourses.filter((c) => c.status === 'ARCHIVED');
    return allCourses;
  }, [allCourses, courseFilter]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#f8fafc]"
      >
        <Loader2 className="h-9 w-9 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!channel) return null;

  const isSuspended = channel.status === 'SUSPENDED';
  const isLocked = isSuspended || !!pendingDeletionRequest;
  const canCreateContent =
    permissions.includes('ALL') ||
    permissions.includes('channel.videos.upload') ||
    permissions.includes('channel.videos.upload.own');
  const isOwner = user?.id === channel.ownerId;

  // Live real-time synced banner, avatar, name, and title
  const activeBannerUrl = modalBannerPreview !== '' ? modalBannerPreview : '';
  const activeAvatarUrl = modalIconPreview !== '' ? modalIconPreview : '';

  const tabs: { id: ManageTab; label: string; icon: typeof LayoutGrid; danger?: boolean }[] = [
    { id: 'OVERVIEW', label: 'Overview', icon: LayoutGrid },
    { id: 'COURSES', label: 'Courses', icon: BookOpen },
    { id: 'LEARNERS', label: 'Learners', icon: Users },
    { id: 'ARTICLES', label: 'Articles', icon: FileText },
    { id: 'EVENTS', label: 'Events (Webinars & Bootcamps)', icon: Calendar },
    { id: 'REVIEWS', label: 'Reviews', icon: Star },
    { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
    { id: 'ACHIEVEMENTS', label: 'Achievements', icon: Trophy },
    ...(!channel.isPersonal
      ? [{ id: 'STAFF' as const, label: 'Staff', icon: Users }]
      : []),
    ...(isOwner ? [{ id: 'DANGER' as const, label: 'Danger Zone', icon: AlertTriangle, danger: true }] : []),
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-32 relative">

      {/* ── Floating Horizontal Bottom Dock (Exact Front Page Arcade Dock Component) ────── */}
      <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
        <div className="pointer-events-auto">
          <Dock className="apple-glass-dock" magnification={100} distance={90} panelHeight={60}>
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <DockItem key={tab.id} className="cursor-pointer" onClick={() => setActiveTab(tab.id)}>
                  <DockLabel className="font-extrabold text-xs text-slate-900 bg-white border border-slate-200/90 shadow-xl">{tab.label}</DockLabel>
                  <DockIcon>
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                        active
                          ? tab.danger
                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/35 scale-105'
                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35 scale-105'
                          : tab.danger
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={19} className={active ? 'text-white' : undefined} />
                    </div>
                  </DockIcon>
                </DockItem>
              );
            })}
          </Dock>
        </div>
      </div>

      {/* ── Main Workspace Container ───────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 space-y-6">

        {/* Warnings */}
        {!isSuspended && pendingDeletionRequest && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} />
            <div>
              <h3 className="font-bold text-amber-800 text-xs sm:text-sm">Deletion request pending</h3>
              <p className="mt-0.5 text-xs text-amber-700">
                Submitted {new Date(pendingDeletionRequest.createdAt).toLocaleDateString()}. Settings,
                staff, and content are locked until review.
              </p>
            </div>
          </div>
        )}

        {isSuspended && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={18} />
            <div>
              <h3 className="font-bold text-rose-800 text-xs sm:text-sm">Channel suspended</h3>
              <p className="mt-0.5 text-xs text-rose-700">
                {channel.suspensionReason || 'A platform administrator suspended this channel.'}
              </p>
            </div>
          </div>
        )}

        {/* ── PERMANENT TOP HEADER: LinkedIn-Style Creator Cover Banner & Profile Header ── */}
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden relative">
          {/* LinkedIn-Style Top Cover Banner */}
          <div className="h-44 sm:h-52 w-full relative overflow-hidden p-6 flex items-start justify-between bg-slate-900">
            {/* Dynamic Channel Banner Image OR Ultra-Premium Cybernetic Aurora Design */}
            {activeBannerUrl ? (
              <img
                src={activeBannerUrl}
                alt="Channel Banner"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-[#0B0F19] overflow-hidden">
                {/* Multi-layered Glowing Orbs */}
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-600/35 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute -bottom-24 right-1/4 w-[32rem] h-[32rem] bg-purple-600/30 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 right-10 -translate-y-1/2 w-80 h-80 bg-cyan-500/25 rounded-full blur-[90px]" />
                <div className="absolute bottom-2 left-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-[80px]" />

                {/* Modern Dot Matrix Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-[0.14] pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.45) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Ambient Glowing Wave Paths */}
                <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="bannerGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818CF8" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#C084FC" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  <path d="M-100,100 C300,250 800,-50 1600,150" fill="none" stroke="url(#bannerGlowGrad)" strokeWidth="3" />
                  <path d="M-100,160 C400,300 900,20 1600,200" fill="none" stroke="url(#bannerGlowGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
                </svg>
              </div>
            )}

            {/* Top Right Quick Actions */}
            <div className="flex items-center gap-2 z-10 ml-auto">
              <Link
                href={`/channels/${channelId}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Eye size={14} />
                <span className="hidden sm:inline">Preview Public Profile</span>
              </Link>
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer shadow-sm"
                title="Edit Banner & Profile Settings"
              >
                <Settings size={15} />
              </button>
            </div>
          </div>

          {/* Profile Details Container UNDER the Cover Banner */}
          <div className="px-6 sm:px-8 pb-6 pt-4 sm:pt-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
              {/* Left: Avatar Overlapping + Creator Name, Title, Social Icons */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
                {/* Avatar Container (Overlapping banner border) */}
                <div className="relative group shrink-0 -mt-16 sm:-mt-20">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                    {activeAvatarUrl ? (
                      <img
                        src={activeAvatarUrl}
                        alt={channel.name}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#8A665A] flex items-center justify-center text-white text-4xl sm:text-5xl font-extrabold uppercase">
                        {(channel.name || user?.fullName || 'A')[0]}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(true)}
                    className="absolute bottom-1 right-1 p-2 rounded-full bg-[#00B4D8] hover:bg-cyan-600 text-white shadow-md border-2 border-white transition-all cursor-pointer"
                    title="Edit Profile & Banner"
                  >
                    <Wrench size={13} />
                  </button>
                </div>

                {/* Creator Info UNDER the Cover Banner (Name, Title, Social Icons) */}
                <div className="space-y-2 pt-2 sm:pt-4">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {modalName || channel.ownerName || user?.fullName || 'Anna Christina Johny'}
                    </h1>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-500">
                    {modalTitle || 'UI/UX Designer • Educator • Mentor'}
                  </p>

                  {/* Social Icons Row */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <a
                      href="https://arcade.dev"
                      target="_blank"
                      rel="noreferrer"
                      title="Website"
                      className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center hover:bg-cyan-100 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Globe size={15} />
                    </a>

                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                      title="LinkedIn"
                      className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-xs hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer"
                    >
                      in
                    </a>

                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noreferrer"
                      title="Twitter / X"
                      className="w-8 h-8 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-100 transition-colors shadow-2xs cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>

                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      title="Instagram"
                      className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-100 transition-colors shadow-2xs cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </a>

                    <a
                      href="https://youtube.com"
                      target="_blank"
                      rel="noreferrer"
                      title="YouTube"
                      className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </a>

                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      title="GitHub"
                      className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </a>

                    <a
                      href={`mailto:${user?.email || 'anna@arcade.dev'}`}
                      title="Email"
                      className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-100 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Mail size={15} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right: Stats Pill Box */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs w-full lg:w-auto justify-center lg:mt-6">
                <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-black text-slate-900 leading-none block">15.2K</span>
                    <span className="text-[10px] font-bold text-slate-400">Followers</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <GraduationCap size={16} />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-black text-slate-900 leading-none block">8.6K</span>
                    <span className="text-[10px] font-bold text-slate-400">Learners</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Star size={16} className="fill-amber-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-black text-slate-900 leading-none block">4.8/5</span>
                    <span className="text-[10px] font-bold text-slate-400">Avg Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── LOWER DYNAMIC SECTION: Changes upon clicking dock sidebar icon ── */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">

            {/* ── ROW 1: Quick Actions ────── */}
            <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
              {/* Header */}
              <div className="flex items-center gap-1.5 text-indigo-600 font-extrabold text-xs tracking-wide uppercase">
                <Sparkles size={15} className="fill-indigo-100 text-indigo-600" />
                <span>Quick Actions</span>
              </div>

              {/* Grid of Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

                {/* Action 1: New Course */}
                <button
                  type="button"
                  onClick={() => router.push('/studio')}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                    <Plus size={18} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">New Course</span>
                </button>

                {/* Action 2: New Roadmap */}
                <button
                  type="button"
                  onClick={() => router.push('/studio')}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-purple-500 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                    <BookOpen size={17} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">New Roadmap</span>
                </button>

                {/* Action 3: New Workshop */}
                <button
                  type="button"
                  onClick={() => toast.info('New Workshop creator opening soon')}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                    <Wrench size={17} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">New Workshop</span>
                </button>

                {/* Action 4: New Quiz */}
                <button
                  type="button"
                  onClick={() => toast.info('Quiz Creator tool launching soon')}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-pink-500 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                    <HelpCircle size={17} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">New Quiz</span>
                </button>

                {/* Action 5: Go Live */}
                <button
                  type="button"
                  onClick={() => toast.success('Live Stream encoder ready 🚀')}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                    <Radio size={17} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Go Live</span>
                </button>

                {/* Action 6: Announcement */}
                <button
                  type="button"
                  onClick={() => toast.info('Broadcast Announcement editor ready')}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                    <Megaphone size={17} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Announcement</span>
                </button>

              </div>
            </div>

            {/* ── ROW 2: My Courses ──────────── */}
            <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">

              {/* Header Row */}
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-base text-slate-900">My Courses</h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('CONTENT')}
                  className="text-xs font-extrabold text-indigo-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Courses</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { label: 'All', count: stats.total },
                  { label: 'Published', count: stats.published },
                  { label: 'Drafts', count: stats.drafts },
                  { label: 'Under Review', count: stats.inReview },
                  { label: 'Scheduled', count: stats.scheduled },
                  { label: 'Archived', count: stats.archived },
                ]
                  .filter((f) => f.label === 'All' || f.count > 0)
                  .map((filter) => {
                    const isActive = courseFilter === filter.label;
                    return (
                      <button
                        key={filter.label}
                        type="button"
                        onClick={() => setCourseFilter(filter.label)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                          }`}
                      >
                        {filter.label} ({filter.count})
                      </button>
                    );
                  })}
              </div>

              {/* Horizontal Course Cards Grid */}
              {filteredCourses.length === 0 ? (
                <div className="py-12 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm font-bold text-slate-500">No courses found in "{courseFilter}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try selecting another filter or create a new course.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative pt-1">
                  {filteredCourses.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      {/* Cover Image Header */}
                      <div className={`h-28 w-full bg-gradient-to-br ${item.coverBg} relative p-3 flex flex-col justify-between overflow-hidden`}>
                        {/* Status Badge */}
                        <span className={`self-start px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase ${item.status === 'PUBLISHED'
                          ? 'bg-emerald-500/90 text-white'
                          : item.status === 'DRAFT'
                            ? 'bg-amber-500/90 text-white'
                            : item.status === 'UNDER REVIEW' || item.status === 'SUBMITTED'
                              ? 'bg-purple-600/90 text-white'
                              : item.status === 'SCHEDULED'
                                ? 'bg-blue-500/90 text-white'
                                : 'bg-slate-500/90 text-white'
                          }`}>
                          {item.status}
                        </span>

                        {/* Center Icon Mock */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:scale-110 transition-transform duration-300">
                          {item.iconType === 'react' && (
                            <div className="w-12 h-12 border-2 border-white rounded-full rotate-45 flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-full" />
                            </div>
                          )}
                          {item.iconType === 'figma' && <Sparkles className="w-12 h-12 text-white" />}
                          {item.iconType === 'js' && <span className="text-3xl font-black text-white">JS</span>}
                          {item.iconType === 'motion' && <User className="w-12 h-12 text-white" />}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </h3>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-500">
                          <div className="flex items-center justify-between">
                            <span>{item.enrolled} Enrolled</span>
                            {item.rating !== '-' && (
                              <span className="flex items-center gap-1 text-amber-600">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                {item.rating}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold">Updated {item.updated}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* ── ROW 3: Creator Analytics (Left) + Learner Reviews (Right) ───── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* 3A. Creator Analytics Section (8 Cols) */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">

                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-base text-slate-900">Creator Analytics</h2>
                  <select
                    value={analyticsTimeframe}
                    onChange={(e) => setAnalyticsTimeframe(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option>This Month</option>
                    <option>Last 30 Days</option>
                    <option>This Year</option>
                  </select>
                </div>

                {/* KPI Metrics Row (5 Tiles) */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'Followers', val: '15.3K', inc: '↑ 12.5%', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Total Learners', val: '8.6K', inc: '↑ 18.3%', icon: User, color: 'text-cyan-600 bg-cyan-50' },
                    { label: 'Enrollments', val: '23.4K', inc: '↑ 15.7%', icon: BookOpen, color: 'text-purple-600 bg-purple-50' },
                    { label: 'Completion Rate', val: '72.4%', inc: '↑ 6.2%', icon: CheckCircle2, color: 'text-pink-600 bg-pink-50' },
                    { label: 'Avg Rating', val: '4.8/5', inc: '↑ 0.5%', icon: Star, color: 'text-amber-600 bg-amber-50' },
                  ].map((m) => (
                    <div key={m.label} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`p-1.5 rounded-lg ${m.color}`}>
                          <m.icon size={13} />
                        </span>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded-md">
                          {m.inc}
                        </span>
                      </div>
                      <p className="text-base font-black text-slate-900 pt-1">{m.val}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Dual Area Chart Container with Overlay */}
                <div className="relative bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between min-h-[220px]">

                  {/* SVG Bezier Area Chart */}
                  <div className="w-full h-44 relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
                      <defs>
                        <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line x1="0" y1="20" x2="500" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                      <line x1="0" y1="70" x2="500" y2="70" stroke="#E2E8F0" strokeDasharray="3 3" />
                      <line x1="0" y1="120" x2="500" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" />

                      {/* Area 1: Enrollments (Purple) */}
                      <path
                        fill="url(#gradPurple)"
                        d="M 0,130 Q 80,100 160,80 T 320,50 T 500,70 L 500,150 L 0,150 Z"
                      />
                      <path
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="3"
                        d="M 0,130 Q 80,100 160,80 T 320,50 T 500,70"
                      />

                      {/* Area 2: Learners (Teal) */}
                      <path
                        fill="url(#gradTeal)"
                        d="M 0,140 Q 80,120 160,105 T 320,90 T 500,100 L 500,150 L 0,150 Z"
                      />
                      <path
                        fill="none"
                        stroke="#06B6D4"
                        strokeWidth="3"
                        d="M 0,140 Q 80,120 160,105 T 320,90 T 500,100"
                      />
                    </svg>
                  </div>

                  {/* X Axis Date Labels */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-2 pt-2">
                    <span>1 May</span>
                    <span>5 May</span>
                    <span>10 May</span>
                    <span>15 May</span>
                    <span>20 May</span>
                    <span>25 May</span>
                    <span>30 May</span>
                  </div>

                  {/* Top Performing Course Overlay Card (Right Side) */}
                  <div className="sm:absolute sm:right-4 sm:top-4 bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-md w-full sm:w-56 space-y-2 mt-4 sm:mt-0 z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Top Performing Course</p>
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        ⚛
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-extrabold text-slate-900 truncate">React - The Complete Guide 2024</h4>
                        <p className="text-[10px] text-slate-500 font-semibold">12.5K Enrolled</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-extrabold text-amber-600 flex items-center gap-1">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        4.8 Rating
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('CONTENT')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[10px] font-extrabold transition-colors cursor-pointer"
                      >
                        View Insights
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* 3B. Learner Reviews Section (4 Cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between">

                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-base text-slate-900">Learner Reviews</h2>
                  <button
                    type="button"
                    onClick={() => toast.info('Reviews panel opening')}
                    className="text-xs font-extrabold text-indigo-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Reviews</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Score Header */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
                  <span className="text-3xl font-black text-slate-900 leading-none">4.8</span>
                  <div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">(620 Reviews)</span>
                  </div>
                </div>

                {/* Reviews Cards */}
                <div className="space-y-3">

                  {/* Review 1 */}
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                          RS
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 leading-none">Rohan Sharma</h4>
                          <span className="text-[9px] text-slate-400 font-semibold">3 days ago</span>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className="fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-medium italic">
                      "Excellent explanation and real-world examples. Really helped me a lot!"
                    </p>
                  </div>

                  {/* Review 2 */}
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                          NV
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 leading-none">Neha Verma</h4>
                          <span className="text-[9px] text-slate-400 font-semibold">5 days ago</span>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className="fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-medium italic">
                      "Very well structured course. The best UI/UX course I have taken so far!"
                    </p>
                  </div>

                </div>

                {/* Carousel Pagination Dots */}
                <div className="flex justify-center gap-1.5 pt-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                </div>

              </div>

            </div>

            {/* ── ROW 4: Teaching Journey + Achievements + Danger Zone ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* 4A. Teaching Journey Card */}
              <div className={`${isOwner ? 'lg:col-span-4' : 'lg:col-span-6'} bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-base text-slate-900">Teaching Journey</h2>
                  <button
                    type="button"
                    onClick={() => toast.info('Full journey history')}
                    className="text-xs font-extrabold text-indigo-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Full Journey</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">

                  {/* Timeline Steps (7 Cols) */}
                  <div className="col-span-7 space-y-3 border-l-2 border-indigo-100 pl-3">
                    {[
                      { year: '2021', title: 'Started Teaching', sub: 'Began my journey as a designer & coder' },
                      { year: '2022', title: 'First Course Published', sub: 'Published my first course on UI Basics' },
                      { year: '2023', title: '10K Learners Milestone', sub: 'Reached 10k+ amazing learners' },
                      { year: '2024', title: 'Top Creator Badge', sub: 'Recognized as Top Educator' },
                    ].map((step) => (
                      <div key={step.year} className="relative">
                        <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-extrabold text-[9px] border border-indigo-100">
                          {step.year}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-900 mt-1 leading-none">{step.title}</h4>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{step.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Right Side Stat Badges & Mountain Vector (5 Cols) */}
                  <div className="col-span-5 flex flex-col items-center justify-between h-full space-y-2 text-center">
                    <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 w-full">
                      <span className="text-xs font-black text-purple-700">3+</span>
                      <p className="text-[9px] font-bold text-slate-500">Years of Teaching</p>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 w-full">
                      <span className="text-xs font-black text-emerald-700">14</span>
                      <p className="text-[9px] font-bold text-slate-500">Courses Published</p>
                    </div>
                    <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 w-full">
                      <span className="text-xs font-black text-indigo-700">25K+</span>
                      <p className="text-[9px] font-bold text-slate-500">Happy Learners</p>
                    </div>

                    {/* Mountain Vector Graphic */}
                    <div className="w-full h-16 relative flex items-center justify-center overflow-hidden">
                      <svg className="w-full h-full text-indigo-500" viewBox="0 0 100 60">
                        <polygon points="10,60 40,15 70,60" fill="#E0E7FF" />
                        <polygon points="35,60 65,5 95,60" fill="#818CF8" />
                        <circle cx="65" cy="5" r="3" fill="#F59E0B" />
                      </svg>
                    </div>
                  </div>

                </div>
              </div>

              {/* 4B. Achievements & Milestones Card */}
              <div className={`${isOwner ? 'lg:col-span-4' : 'lg:col-span-6'} bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-base text-slate-900">Achievements & Milestones</h2>
                  <button
                    type="button"
                    onClick={() => toast.info('All Milestones')}
                    className="text-xs font-extrabold text-indigo-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Trophy, color: 'text-amber-500 bg-amber-50 border-amber-100', title: 'Top Instructor', desc: 'Awarded for consistent quality content' },
                    { icon: Award, color: 'text-purple-500 bg-purple-50 border-purple-100', title: '25K Learners', desc: 'Thank you to my amazing community!' },
                    { icon: BookOpen, color: 'text-emerald-500 bg-emerald-50 border-emerald-100', title: '10 Courses Published', desc: 'Creating impact through education' },
                    { icon: Star, color: 'text-orange-500 bg-orange-50 border-orange-100', title: '5-Star Educator', desc: 'Maintained high ratings across courses' },
                  ].map((ach) => (
                    <div key={ach.title} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${ach.color}`}>
                        <ach.icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-xs text-slate-900 leading-tight">{ach.title}</h4>
                        <p className="text-[10px] text-slate-500 font-medium truncate">{ach.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4C. Danger Zone Card */}
              {isOwner && (
                <div className="lg:col-span-4 bg-rose-50/60 rounded-2xl border border-rose-200 p-6 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-sm text-rose-700">Danger Zone</h3>
                    <p className="text-xs text-rose-600 font-medium leading-relaxed">
                      This action is permanent and cannot be undone.
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('DANGER')}
                      className="w-full py-2.5 px-3 rounded-xl border border-rose-300 bg-white hover:bg-rose-100 text-rose-600 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={14} />
                      <span>Delete Channel</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ── TAB 2: COURSES ─────────────────────────────────────────────────── */}
        {activeTab === 'COURSES' && (
          <div className="space-y-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpen size={20} className="text-indigo-600" />
                  <span>My Courses</span>
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Manage, edit, and publish your educational video courses.</p>
              </div>
              {canCreateContent && !isLocked && (
                <button
                  type="button"
                  onClick={() => router.push('/studio')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create New Course</span>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {['All', 'Published', 'Drafts', 'Under Review', 'Scheduled', 'Archived'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCourseFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    courseFilter === f ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Grid of Courses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-2">
              {filteredCourses.map((c) => (
                <div key={c.id} className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className={`h-36 w-full bg-gradient-to-br ${c.coverBg} relative p-4 flex flex-col justify-between`}>
                    <span className="self-start px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/40 backdrop-blur-md text-white border border-white/20">
                      {c.status}
                    </span>
                    <h3 className="font-black text-sm text-white drop-shadow-sm line-clamp-2">{c.title}</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span className="flex items-center gap-1.5"><Users size={14} className="text-indigo-600" /> {c.enrolled} Learners</span>
                      {c.rating !== '-' && <span className="flex items-center gap-1 text-amber-600"><Star size={13} className="fill-amber-400 text-amber-400" /> {c.rating}</span>}
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400">Updated {c.updated}</span>
                      <Link href={`/studio/course/${c.id}/edit`} className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors">
                        Edit Course
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: ARTICLES ────────────────────────────────────────────────── */}
        {activeTab === 'ARTICLES' && (
          <div className="space-y-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText size={20} className="text-purple-600" />
                  <span>Articles &amp; Written Insights</span>
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Publish tutorial posts, tech blogs, and design breakdowns.</p>
              </div>
              <button
                type="button"
                onClick={() => toast.info('Opening Article Editor...')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Write New Article</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Mastering Modern UI Layouts in Next.js 14', status: 'PUBLISHED', reads: '14.2K Reads', date: 'Aug 2, 2026', readTime: '6 min read' },
                { title: 'The Complete Guide to Framer Motion Micro-Interactions', status: 'PUBLISHED', reads: '9.8K Reads', date: 'Jul 28, 2026', readTime: '10 min read' },
                { title: 'Why Design Systems are Essential for Scaling Apps', status: 'DRAFT', reads: '-', date: 'Jul 20, 2026', readTime: '5 min read' },
                { title: 'Clean Architecture Principles for React Developers', status: 'PUBLISHED', reads: '18.5K Reads', date: 'Jul 14, 2026', readTime: '12 min read' },
              ].map((art, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${art.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {art.status}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">{art.readTime}</span>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{art.title}</h3>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-3 border-t border-slate-200/60">
                    <span>{art.reads}</span>
                    <span>{art.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: EVENTS (BOOTCAMPS & WEBINARS) ───────────────────────────── */}
        {activeTab === 'EVENTS' && (
          <div className="space-y-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Calendar size={20} className="text-rose-600" />
                  <span>Events (Bootcamps &amp; Webinars)</span>
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Host live stream webinars, interactive workshops, and intensive cohort bootcamps.</p>
              </div>
              <button
                type="button"
                onClick={() => toast.success('Live Event Host Studio Ready 🚀')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
              >
                <Radio size={14} />
                <span>Host / Schedule Event</span>
              </button>
            </div>

            <div className="space-y-4">
              {[
                { type: '🔴 LIVE WEBINAR', title: 'AI & UI Design Systems Masterclass 2024', time: 'Aug 12, 2026 • 6:00 PM EST', registered: '1,420 RSVPs Registered', price: 'Free Webinar', badgeBg: 'bg-rose-500 text-white' },
                { type: '🎓 INTENSIVE BOOTCAMP', title: 'Zero to Hero Full-Stack React & Next.js Cohort', time: 'Sep 1 - Sep 28, 2026 (4-Week Live Cohort)', registered: '48 / 50 Seats Enrolled', price: '$299 Ticket', badgeBg: 'bg-purple-600 text-white' },
                { type: '🎙️ LIVE WORKSHOP', title: 'Framer Motion Micro-Interactions Deep Dive', time: 'Completed Jul 30, 2026', registered: '840 Attendees • 4.9/5 Rating', price: 'Past Event', badgeBg: 'bg-slate-700 text-white' },
              ].map((evt, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${evt.badgeBg}`}>
                      {evt.type}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900">{evt.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 pt-1">
                      <span className="flex items-center gap-1"><Clock size={13} className="text-slate-400" /> {evt.time}</span>
                      <span className="flex items-center gap-1"><Users size={13} className="text-indigo-600" /> {evt.registered}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-extrabold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">{evt.price}</span>
                    <button type="button" onClick={() => toast.info('Managing Event details')} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer">
                      Manage Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 5: LEARNERS ────────────────────────────────────────────────── */}
        {activeTab === 'LEARNERS' && (
          <div className="space-y-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <GraduationCap size={20} className="text-cyan-600" />
                  <span>Learners &amp; Student Community</span>
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Track enrolled student progress, issue completion certificates, and communicate.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100">
                <span className="text-xs font-extrabold text-cyan-800 uppercase tracking-wider block">Total Learners</span>
                <span className="text-2xl font-black text-cyan-900 mt-1 block">8,640</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">Course Completion Rate</span>
                <span className="text-2xl font-black text-emerald-900 mt-1 block">87.4%</span>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                <span className="text-xs font-extrabold text-purple-800 uppercase tracking-wider block">Certificates Issued</span>
                <span className="text-2xl font-black text-purple-900 mt-1 block">6,420</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs font-bold text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Enrolled Course</th>
                    <th className="p-3.5">Progress</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: 'Sarah Jenkins', course: 'React - Complete Guide', progress: '94%', color: 'bg-emerald-500' },
                    { name: 'Marcus Chen', course: 'Figma UI/UX Design Mastery', progress: '78%', color: 'bg-indigo-500' },
                    { name: 'Elena Rostova', course: 'Next.js 14 Architecture', progress: '100%', color: 'bg-purple-500' },
                    { name: 'David Kim', course: 'UI Animation Framer', progress: '62%', color: 'bg-cyan-500' },
                  ].map((stu, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-extrabold text-slate-900">{stu.name}</td>
                      <td className="p-3.5 font-semibold text-slate-600">{stu.course}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${stu.color}`} style={{ width: stu.progress }} />
                          </div>
                          <span>{stu.progress}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <button type="button" onClick={() => toast.info(`Message sent to ${stu.name}`)} className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-extrabold text-[11px]">
                          Message
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 6: REVIEWS ─────────────────────────────────────────────────── */}
        {activeTab === 'REVIEWS' && (
          <div className="space-y-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Star size={20} className="text-amber-500 fill-amber-500" />
                  <span>Student Reviews &amp; Ratings</span>
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Read feedback, review ratings, and reply to student reviews.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-center flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900">4.8</span>
                <div className="flex items-center gap-1 my-1.5 text-amber-400">
                  <Star size={16} className="fill-amber-400" />
                  <Star size={16} className="fill-amber-400" />
                  <Star size={16} className="fill-amber-400" />
                  <Star size={16} className="fill-amber-400" />
                  <Star size={16} className="fill-amber-400" />
                </div>
                <span className="text-xs font-bold text-slate-500">Based on 1,840 student reviews</span>
              </div>

              <div className="md:col-span-2 space-y-3">
                {[
                  { name: 'Alex Rivera', rating: 5, comment: 'Hands down the best React course on Arcade! Clear explanations and real-world project code.', time: '2 hours ago' },
                  { name: 'Sophia Lin', rating: 5, comment: 'The Figma UI/UX course transformed how I build design systems. Highly recommend!', time: 'Yesterday' },
                ].map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-slate-900">{rev.name}</h4>
                      <span className="text-[11px] font-semibold text-slate-400">{rev.time}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 7: FINANCIALS (EARNINGS) ───────────────────────────────────── */}
        {activeTab === 'EARNINGS' && (
          <div className="space-y-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp size={20} className="text-emerald-600" />
                  <span>Financials &amp; Revenue Dashboard</span>
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Track course sales, subscription payouts, and withdraw funds.</p>
              </div>
              <button
                type="button"
                onClick={() => toast.success('Payout request submitted to Bank Account')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
              >
                <Download size={14} />
                <span>Request Payout</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">Monthly Revenue</span>
                <span className="text-3xl font-black text-emerald-950 mt-1 block">$24,850.00</span>
              </div>
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
                <span className="text-xs font-extrabold text-indigo-800 uppercase tracking-wider block">Pending Payout</span>
                <span className="text-3xl font-black text-indigo-950 mt-1 block">$4,320.00</span>
              </div>
              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200/80">
                <span className="text-xs font-extrabold text-purple-800 uppercase tracking-wider block">Lifetime Earnings</span>
                <span className="text-3xl font-black text-purple-950 mt-1 block">$184,200.00</span>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 8: ANALYTICS ───────────────────────────────────────────────── */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 size={20} className="text-indigo-600" />
                  <span>Creator Analytics View</span>
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Deep insights on watch time, impressions, traffic sources, and demographics.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Watch Time</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">48,200 Hrs</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Profile Views</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">142,500</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Click Through Rate</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">8.4%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Avg Duration</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">18m 42s</span>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 9: ACHIEVEMENTS ────────────────────────────────────────────── */}
        {activeTab === 'ACHIEVEMENTS' && (
          <div className="space-y-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Trophy size={20} className="text-amber-500" />
                  <span>Creator Achievements &amp; Level Badges</span>
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Milestone trophies, level status badges, and creator awards.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { title: 'Level 4 Platinum Creator', desc: 'Unlocked for reaching 10,000+ active learners with 4.8+ rating.', icon: Trophy, bg: 'bg-gradient-to-br from-amber-500 to-amber-700 text-white' },
                { title: '10K Student Milestone', desc: 'Awarded for teaching over 10,000 enrolled students across courses.', icon: Award, bg: 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white' },
                { title: 'Top Streamer 2024', desc: 'Recognized for over 100 hours of live streaming webinars.', icon: Radio, bg: 'bg-gradient-to-br from-purple-500 to-purple-700 text-white' },
              ].map((ach, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4">
                  <div className={`w-12 h-12 rounded-2xl ${ach.bg} flex items-center justify-center shadow-md`}>
                    <ach.icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{ach.title}</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 10: STAFF ────────────────────────────────────────────────────── */}
        {!channel.isPersonal && activeTab === 'STAFF' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <ChannelStaffManager
              channelId={channelId}
              permissions={permissions}
              isSuspended={isLocked}
            />
          </div>
        )}

        {/* ── TAB 11: SETTINGS ─────────────────────────────────────────────────── */}
        {activeTab === 'SETTINGS' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <ChannelSettingsManager
              channel={channel}
              onUpdate={setChannel}
              permissions={permissions}
              locked={isLocked}
            />
          </div>
        )}

        {/* ── TAB 12: DANGER ───────────────────────────────────────────────────── */}
        {isOwner && activeTab === 'DANGER' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <ChannelDangerZone channel={channel} />
          </div>
        )}

      </div>

      {/* ── Central Edit Profile & Cover Banner Popup Modal ────────────────────── */}
      <AnimatePresence>
        {editModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Dark Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditModalOpen(false)}
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-md cursor-pointer"
            />

            {/* Centered Popup Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 my-auto flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                    <Wrench size={18} />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900 leading-tight">
                      Edit Creator Profile & Banner
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">
                      Update your avatar, banner photo, tagline & social handles.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-none">
                
                {/* 1. Cover Banner Upload Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                      Cover Banner Image
                    </label>
                    {modalBannerPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setModalBannerFile(null);
                          setModalBannerPreview('');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Remove Banner</span>
                      </button>
                    )}
                  </div>
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-900 group">
                    {modalBannerPreview ? (
                      <img src={modalBannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#0B0F19] relative overflow-hidden flex flex-col items-center justify-center text-slate-300 gap-1">
                        <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-600/40 rounded-full blur-2xl" />
                        <div className="absolute -bottom-10 right-0 w-64 h-64 bg-purple-600/35 rounded-full blur-2xl" />
                        <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-cyan-500/30 rounded-full blur-xl" />
                        <ImageIcon size={26} className="relative z-10 text-cyan-300" />
                        <span className="text-xs font-bold relative z-10 text-slate-200">Cybernetic Aurora Banner Active</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-extrabold cursor-pointer shadow-md hover:bg-slate-100 transition-colors">
                        <Upload size={14} />
                        <span>Upload / Change Banner</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setModalBannerFile(file);
                              setModalBannerPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                      {modalBannerPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setModalBannerFile(null);
                            setModalBannerPreview('');
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-extrabold cursor-pointer shadow-md hover:bg-rose-700 transition-colors"
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Profile Avatar Upload Section */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                    Profile Avatar Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 shadow-md">
                      {modalIconPreview ? (
                        <img src={modalIconPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#8A665A] flex items-center justify-center text-white text-2xl font-extrabold">
                          {(channel.name || 'A')[0]}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer shadow-xs transition-colors">
                        <Upload size={14} />
                        <span>Upload Avatar</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setModalIconFile(file);
                              setModalIconPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>

                      {modalIconPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setModalIconFile(null);
                            setModalIconPreview('');
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                          <span>Remove Photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Creator Name & Subtitle Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700">Creator Name</label>
                    <input
                      type="text"
                      value={modalName}
                      onChange={(e) => setModalName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                      placeholder="e.g. Anna Christina Johny"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700">Tagline / Subtitle</label>
                    <input
                      type="text"
                      value={modalTitle}
                      onChange={(e) => setModalTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                      placeholder="e.g. UI/UX Designer • Educator • Mentor"
                    />
                  </div>
                </div>

                {/* 4. Channel Description / Bio */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700">About Bio & Description</label>
                  <textarea
                    rows={3}
                    value={modalBio}
                    onChange={(e) => setModalBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 resize-none"
                    placeholder="Tell learners about your experience and courses..."
                  />
                </div>

                {/* 5. Social Media Links */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                    Social Handles & Website
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50">
                      <Globe size={14} className="text-cyan-600 shrink-0" />
                      <input
                        type="text"
                        value={modalWebsite}
                        onChange={(e) => setModalWebsite(e.target.value)}
                        placeholder="https://arcade.dev"
                        className="w-full text-xs font-semibold text-slate-900 bg-transparent outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50">
                      <span className="text-xs font-black text-blue-600 shrink-0">in</span>
                      <input
                        type="text"
                        value={modalLinkedin}
                        onChange={(e) => setModalLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full text-xs font-semibold text-slate-900 bg-transparent outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50">
                      <span className="text-xs font-black text-sky-500 shrink-0">𝕏</span>
                      <input
                        type="text"
                        value={modalTwitter}
                        onChange={(e) => setModalTwitter(e.target.value)}
                        placeholder="https://x.com/..."
                        className="w-full text-xs font-semibold text-slate-900 bg-transparent outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50">
                      <Mail size={14} className="text-purple-600 shrink-0" />
                      <input
                        type="text"
                        value={modalEmail}
                        onChange={(e) => setModalEmail(e.target.value)}
                        placeholder="anna@arcade.dev"
                        className="w-full text-xs font-semibold text-slate-900 bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={savingModal}
                  onClick={async () => {
                    try {
                      setSavingModal(true);
                      const updated = await channelService.updateChannelSettings(
                        channel.id,
                        modalBio,
                        modalIconFile || undefined,
                        modalBannerFile || undefined
                      );
                      setChannel({
                        ...updated,
                        bannerUrl: modalBannerPreview,
                        iconUrl: modalIconPreview || updated.iconUrl,
                        ownerName: modalName,
                      });
                      toast.success('Creator profile & banner updated successfully!');
                      setEditModalOpen(false);
                    } catch {
                      toast.error('Failed to update profile settings');
                    } finally {
                      setSavingModal(false);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingModal ? <Loader2 size={15} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


