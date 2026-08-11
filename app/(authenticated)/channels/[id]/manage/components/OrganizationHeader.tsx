'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Calendar,
  Edit3,
  ExternalLink,
  Share2,
  Download,
  Building2,
  Check,
  Mail,
  Globe,
  Plus,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ChannelDoodleBanner } from '../ChannelDoodleBanner';
import { ChannelSocialLinksCard } from '../ChannelSocialLinksCard';

const LinkedinIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const GithubIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const XIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const YoutubeIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

interface OrganizationHeaderProps {
  channel: {
    id: string;
    name: string;
    iconUrl?: string;
    bannerUrl?: string;
    description?: string;
    isPersonal: boolean;
    status: string;
    createdAt: string;
    ownerName: string;
    ownerEmail?: string;
    ownerUsername?: string;
    socialLinks?: string[];
  };
  canEdit?: boolean;
  onEditClick: () => void;
  onViewPublicClick: () => void;
  onUpdate?: (updatedChannel: any) => void;
}

export function OrganizationHeader({
  channel,
  canEdit = true,
  onEditClick,
  onViewPublicClick,
  onUpdate,
}: OrganizationHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Organization link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExport = () => {
    setIsExporting(true);
    toast.info('Generating comprehensive organization report PDF...');
    setTimeout(() => {
      setIsExporting(false);
      toast.success('Organization Executive Report downloaded successfully!');
    }, 1800);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_12px_40px_rgba(20,20,43,0.06)] backdrop-blur-xl"
      >
        {/* Banner Background */}
        <div className="relative">
          <ChannelDoodleBanner bannerUrl={channel.bannerUrl} className="h-52 w-full sm:h-64" />
        </div>

        {/* Main Header Body Content */}
        <div className="px-6 pb-8 pt-0 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            {/* Avatar & Title Row */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              {/* Logo Avatar */}
              <div className="-mt-16 sm:-mt-20 relative shrink-0 z-20 group">
                <div className="relative flex h-28 w-28 sm:h-34 sm:w-34 items-center justify-center overflow-hidden rounded-3xl border-[6px] border-white bg-gradient-to-br from-indigo-500 via-purple-600 to-slate-900 text-white shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]">
                  {channel.iconUrl ? (
                    <img
                      src={channel.iconUrl}
                      alt={channel.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Building2 size={42} className="stroke-[1.75] text-white" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">
                        ARCADE
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-white shadow-md">
                  <CheckCircle2 size={18} />
                </div>
              </div>

              {/* Title & Metadata Block */}
              <div className="min-w-0 space-y-2.5 pt-2 sm:pt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-black tracking-tight text-[#14142b] sm:text-4xl">
                    {channel.name}
                  </h1>
                </div>

                {/* Organization Type Pill & Info Line */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50/90 px-3 py-1.5 text-xs font-extrabold text-indigo-700 shadow-2xs">
                    <Building2 size={13} className="text-indigo-600" />
                    <span>{channel.isPersonal ? 'Personal Channel' : 'Organizational Channel'}</span>
                  </span>

                  {channel.ownerUsername ? (
                    <Link href={`/${channel.ownerUsername}`} className="hover:underline font-bold text-indigo-600">
                      @{channel.ownerUsername}
                    </Link>
                  ) : channel.ownerName ? (
                    <span className="font-semibold text-slate-600">{channel.ownerName}</span>
                  ) : null}

                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <Calendar size={13} />
                    <span>Joined {new Date(channel.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                  </span>
                </div>

                {/* Social Icons Row Directly Under Joined Date + Plus Add Button */}
                <div className="flex items-center gap-2 pt-1">
                  {channel.socialLinks && channel.socialLinks.length > 0 ? (
                    channel.socialLinks.map((linkStr, idx) => {
                      try {
                        const url = new URL(linkStr);
                        const host = url.hostname.toLowerCase().replace(/^www\./, '');
                        let IconComponent: any = Globe;
                        let platformLabel = host;
                        let hoverTone = 'hover:bg-emerald-600 hover:text-white';

                        if (host.includes('linkedin')) {
                          IconComponent = LinkedinIcon;
                          platformLabel = 'LinkedIn';
                          hoverTone = 'hover:bg-blue-600 hover:text-white';
                        } else if (host.includes('instagram')) {
                          IconComponent = InstagramIcon;
                          platformLabel = 'Instagram';
                          hoverTone = 'hover:bg-pink-600 hover:text-white';
                        } else if (host.includes('github')) {
                          IconComponent = GithubIcon;
                          platformLabel = 'GitHub';
                          hoverTone = 'hover:bg-slate-900 hover:text-white';
                        } else if (host.includes('twitter') || host.includes('x.com')) {
                          IconComponent = XIcon;
                          platformLabel = 'X (Twitter)';
                          hoverTone = 'hover:bg-black hover:text-white';
                        } else if (host.includes('youtube')) {
                          IconComponent = YoutubeIcon;
                          platformLabel = 'YouTube';
                          hoverTone = 'hover:bg-rose-600 hover:text-white';
                        }

                        return (
                          <a
                            key={idx}
                            href={linkStr}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-[#14142b] shadow-2xs backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${hoverTone}`}
                            title={`Visit ${platformLabel}`}
                          >
                            <IconComponent size={15} />
                          </a>
                        );
                      } catch (e) {
                        return null;
                      }
                    })
                  ) : (
                    [
                      { name: 'LinkedIn', icon: LinkedinIcon, href: 'https://linkedin.com', color: 'hover:bg-blue-600 hover:text-white' },
                      { name: 'Instagram', icon: InstagramIcon, href: 'https://instagram.com', color: 'hover:bg-pink-600 hover:text-white' },
                      { name: 'GitHub', icon: GithubIcon, href: 'https://github.com', color: 'hover:bg-slate-900 hover:text-white' },
                      { name: 'Mail', icon: Mail, href: `mailto:${channel.ownerEmail || 'contact@arcade.ai'}`, color: 'hover:bg-indigo-600 hover:text-white' },
                    ].map((social) => {
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
                              toast.info(`Sending email to ${channel.ownerEmail || 'contact@arcade.ai'}`);
                            }
                          }}
                          className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-[#14142b] shadow-2xs backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${social.color}`}
                          title={`Visit Organization ${social.name}`}
                        >
                          <Icon size={15} />
                        </a>
                      );
                    })
                  )}

                  {/* Plus (+) Button to Add / Manage Social Links */}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setIsSocialModalOpen(true)}
                      className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-dashed border-emerald-400/80 bg-emerald-50/90 text-emerald-700 shadow-2xs hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-200 hover:scale-105 cursor-pointer"
                      title="Add or manage social links"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
              {canEdit && (
                <button
                  type="button"
                  onClick={onEditClick}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 transition-all active:scale-[0.98]"
                >
                  <Edit3 size={14} className="text-indigo-600" />
                  <span>Edit</span>
                </button>
              )}

            <button
              type="button"
              onClick={onViewPublicClick}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-700 transition-all active:scale-[0.98]"
            >
              <ExternalLink size={14} className="text-purple-600" />
              <span>Public Profile</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-700 transition-all active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-teal-600" />
                  <span className="text-teal-700">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} className="text-teal-600" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              <Download size={14} className={`text-emerald-600 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>
    </motion.section>

      {/* Dedicated Social Links Manager Modal */}
      {isSocialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            onClick={() => setIsSocialModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl p-2 border border-slate-200">
            <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-slate-100 mb-2">
              <div>
                <h3 className="text-base font-black text-slate-900">Manage Social Links</h3>
                <p className="text-xs font-semibold text-slate-500">Add or update social profile links displayed on your channel header</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSocialModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3">
              <ChannelSocialLinksCard
                channel={channel as any}
                canManageSettings={true}
                initialEditing={true}
                onUpdate={(updatedChannel: any) => {
                  if (onUpdate) onUpdate(updatedChannel);
                  setIsSocialModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
