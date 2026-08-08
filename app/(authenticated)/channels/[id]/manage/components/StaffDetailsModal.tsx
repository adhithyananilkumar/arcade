'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  X,
  Mail,
  BookOpen,
  FileText,
  Video,
  Rocket,
  Star,
  Clock,
  Search,
  ThumbsUp,
  UserCheck,
  UserX,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const LinkedinIcon = ({ size = 14, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ size = 14, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export interface StaffPublishedContent {
  id: string;
  type: 'COURSE' | 'ARTICLE' | 'WEBINAR' | 'BOOTCAMP';
  title: string;
  thumbnail: string;
  publishedDateTime: string;
  rating: number;
  feedbackScore: number;
  enrollmentsOrViews: string;
  status: 'PUBLISHED' | 'COMPLETED' | 'LIVE' | 'ACTIVE';
}

export interface ExtendedStaffMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  joiningDate: string;
  assignedCourses: number;
  articlesPublished: number;
  webinarsConducted: number;
  bootcampsManaged: number;
  experience: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'AWAY' | 'ON_LEAVE' | 'INACTIVE';
  performanceScore: number;
  publishedContentList?: StaffPublishedContent[];
}

interface StaffDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: ExtendedStaffMember | null;
  onStatusToggle?: (staffId: string, newStatus: 'ACTIVE' | 'INACTIVE') => void;
}

export function StaffDetailsModal({ isOpen, onClose, staff, onStatusToggle }: StaffDetailsModalProps) {
  const [activeContentType, setActiveContentType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [localStatus, setLocalStatus] = useState<'ACTIVE' | 'AWAY' | 'ON_LEAVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    if (staff) setLocalStatus(staff.status);
  }, [staff]);

  const mockPublishedContent: StaffPublishedContent[] = useMemo(() => {
    return (
      staff?.publishedContentList || [
        {
          id: 'pub-1',
          type: 'COURSE',
          title: 'AI Agent Architecture & Tool Use Masterclass',
          thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
          publishedDateTime: 'Aug 2, 2026 at 4:30 PM',
          rating: 4.98,
          feedbackScore: 98,
          enrollmentsOrViews: '8,420 enrolled',
          status: 'PUBLISHED',
        },
        {
          id: 'pub-2',
          type: 'ARTICLE',
          title: 'Architecting Scalable RAG Systems with Vector Databases',
          thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
          publishedDateTime: 'Jul 28, 2026 at 10:15 AM',
          rating: 4.92,
          feedbackScore: 96,
          enrollmentsOrViews: '14,200 views',
          status: 'PUBLISHED',
        },
        {
          id: 'pub-3',
          type: 'WEBINAR',
          title: 'Future of Autonomous AI Agents & Real-World Deployments',
          thumbnail: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=600&q=80',
          publishedDateTime: 'Jul 15, 2026 at 6:00 PM',
          rating: 4.94,
          feedbackScore: 96,
          enrollmentsOrViews: '1,420 attendees',
          status: 'COMPLETED',
        },
        {
          id: 'pub-4',
          type: 'BOOTCAMP',
          title: 'Full-Stack AI Engineer Intensive Bootcamp (Cohort 8)',
          thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
          publishedDateTime: 'Jun 1, 2026 at 9:00 AM',
          rating: 4.96,
          feedbackScore: 99,
          enrollmentsOrViews: '240 cohort students',
          status: 'ACTIVE',
        },
      ]
    );
  }, [staff]);

  const filteredContent = useMemo(() => {
    return mockPublishedContent.filter((item) => {
      const matchesType = activeContentType === 'ALL' || item.type === activeContentType;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [mockPublishedContent, activeContentType, searchQuery]);

  if (!isOpen || !staff) return null;

  const handleToggleStatus = () => {
    const nextStatus = localStatus === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    setLocalStatus(nextStatus);
    if (onStatusToggle) {
      onStatusToggle(staff.id, nextStatus);
    }
    toast.success(
      nextStatus === 'ACTIVE'
        ? `${staff.name} is now ACTIVE`
        : `${staff.name} marked as INACTIVE`,
    );
  };

  const typeIconMap = {
    COURSE: BookOpen,
    ARTICLE: FileText,
    WEBINAR: Video,
    BOOTCAMP: Rocket,
  };

  const staffSocials = [
    { name: 'LinkedIn', icon: LinkedinIcon, href: 'https://linkedin.com', color: 'hover:bg-blue-600 hover:text-white' },
    { name: 'GitHub', icon: GithubIcon, href: 'https://github.com', color: 'hover:bg-slate-900 hover:text-white' },
    { name: 'Mail', icon: Mail, href: `mailto:${staff.email}`, color: 'hover:bg-indigo-600 hover:text-white' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl"
        >
          {/* Dark Header Hero Card */}
          <div className="relative bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 p-6 text-white rounded-t-3xl">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="h-20 w-20 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
                  />
                  <span
                    className={`absolute -bottom-1 -right-1 h-4.5 w-4.5 rounded-full border-2 border-white ${
                      localStatus === 'ACTIVE'
                        ? 'bg-emerald-500'
                        : localStatus === 'INACTIVE'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black tracking-tight">{staff.name}</h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                        localStatus === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          : localStatus === 'INACTIVE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      }`}
                    >
                      {localStatus === 'INACTIVE' ? 'Inactive Staff' : localStatus}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-indigo-200">{staff.role}</p>
                  
                  {/* Staff Social Icons (LinkedIn, GitHub, Mail - No Instagram) */}
                  <div className="flex items-center gap-2 pt-0.5">
                    {staffSocials.map((social) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            if (social.name === 'Mail') {
                              e.preventDefault();
                              toast.info(`Sending email to ${staff.email}`);
                            }
                          }}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/90 shadow-2xs backdrop-blur-xs transition-all duration-200 ${social.color}`}
                          title={`${staff.name}'s ${social.name}`}
                        >
                          <Icon size={14} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Status Toggle Action Button */}
              <div className="shrink-0 pr-6 sm:pr-0">
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold transition-all border shadow-sm ${
                    localStatus === 'INACTIVE'
                      ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  {localStatus === 'INACTIVE' ? (
                    <>
                      <UserCheck size={14} /> Activate Staff
                    </>
                  ) : (
                    <>
                      <UserX size={14} /> Mark as Inactive
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Body: Published Content Section */}
          <div className="p-6 space-y-4">
            <div className="flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-black tracking-tight text-[#14142b]">
                  Content Published by {staff.name}
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Courses, articles, webinars, and bootcamps created with release dates and learner feedback
                </p>
              </div>

              {/* Search Bar & Filter Tabs Row */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-sm">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search published content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Type Filter Pills */}
                <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 text-xs font-extrabold">
                  <button
                    type="button"
                    onClick={() => setActiveContentType('ALL')}
                    className={`rounded-xl px-3 py-1.5 transition-all ${
                      activeContentType === 'ALL' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    All ({mockPublishedContent.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveContentType('COURSE')}
                    className={`rounded-xl px-3 py-1.5 transition-all ${
                      activeContentType === 'COURSE' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Courses
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveContentType('ARTICLE')}
                    className={`rounded-xl px-3 py-1.5 transition-all ${
                      activeContentType === 'ARTICLE' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Articles
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveContentType('WEBINAR')}
                    className={`rounded-xl px-3 py-1.5 transition-all ${
                      activeContentType === 'WEBINAR' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Webinars
                  </button>
                </div>
              </div>
            </div>

            {/* Published Content List */}
            {filteredContent.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs font-semibold text-slate-400">
                No published content found matching your search.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-none">
                {filteredContent.map((item) => {
                  const Icon = typeIconMap[item.type];
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="h-12 w-20 shrink-0 rounded-xl object-cover border border-slate-200"
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[11px] font-extrabold text-indigo-600">
                            <span className="flex items-center gap-1">
                              <Icon size={12} />
                              {item.type}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-400 font-semibold flex items-center gap-1">
                              <Clock size={11} />
                              Published: {item.publishedDateTime}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-extrabold text-[#14142b] truncate mt-0.5">
                            {item.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs font-bold">
                        <span className="text-slate-600">{item.enrollmentsOrViews}</span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 border border-amber-200">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {item.rating} ★
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 border border-emerald-200">
                          <ThumbsUp size={11} />
                          {item.feedbackScore}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-[#14142b] px-5 py-2 text-xs font-extrabold text-white hover:bg-indigo-900"
            >
              Close Profile
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
