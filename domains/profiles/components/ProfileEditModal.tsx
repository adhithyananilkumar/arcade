'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * Dedicated interactive Profile Edit Modal.
 * Standardized with uniform font size (text-xs) and clean black text color hierarchy.
 * ------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Cpu,
  Globe,
  Plus,
  Star,
  Check,
  Loader2,
  Search,
  Code2,
  Sparkles,
} from 'lucide-react';
import {
  FaGithub,
  FaLinkedin,
  FaReact,
  FaPython,
  FaDocker,
  FaAws,
  FaNodeJs,
  FaRust,
  FaGitAlt,
  FaJava,
  FaVuejs,
  FaAngular,
  FaLinux,
  FaPhp,
  FaSwift,
} from 'react-icons/fa';
import {
  SiTypescript,
  SiJavascript,
  SiNextdotjs,
  SiTailwindcss,
  SiPostgresql,
  SiKubernetes,
  SiRedis,
  SiFigma,
  SiGo,
  SiGraphql,
  SiMongodb,
  SiMysql,
  SiSvelte,
  SiDjango,
  SiFastapi,
  SiSpringboot,
  SiFlutter,
  SiKotlin,
  SiGooglecloud,
  SiTerraform,
  SiCplusplus,
  SiDotnet,
  SiRuby,
  SiVercel,
  SiSupabase,
  SiFirebase,
  SiApachekafka,
  SiPytorch,
  SiSqlite,
  SiNginx,
  SiDart,
  SiSolidity,
  SiPrisma,
  SiRedux,
  SiElasticsearch,
} from 'react-icons/si';
import { toast } from 'sonner';
import { UserService } from '@/domains/identity';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import type { UserProfile } from '../types/profile.types';
import type { TechSkill } from './ProfilePanels';

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

// Tech icon mapper helper
export function getSkillIcon(name: string, customIcon?: React.ReactNode): React.ReactNode {
  if (customIcon && React.isValidElement(customIcon)) {
    return customIcon;
  }
  const n = (name || '').toLowerCase().trim();
  if (n.includes('typescript') || n === 'ts') return <SiTypescript size={14} className="text-[#3178C6]" />;
  if (n.includes('javascript') || n === 'js') return <SiJavascript size={14} className="text-[#F7DF1E]" />;
  if (n.includes('react native')) return <FaReact size={14} className="text-[#61DAFB]" />;
  if (n.includes('react')) return <FaReact size={14} className="text-[#61DAFB]" />;
  if (n.includes('next')) return <SiNextdotjs size={14} className="text-black dark:text-white" />;
  if (n.includes('vue')) return <FaVuejs size={14} className="text-[#4FC08D]" />;
  if (n.includes('svelte')) return <SiSvelte size={14} className="text-[#FF3E00]" />;
  if (n.includes('angular')) return <FaAngular size={14} className="text-[#DD0031]" />;
  if (n.includes('python') || n === 'py') return <FaPython size={14} className="text-[#3776AB]" />;
  if (n.includes('django')) return <SiDjango size={14} className="text-[#092E20]" />;
  if (n.includes('fastapi')) return <SiFastapi size={14} className="text-[#05998B]" />;
  if (n.includes('spring')) return <SiSpringboot size={14} className="text-[#6DB33F]" />;
  if (n.includes('java') && !n.includes('script')) return <FaJava size={14} className="text-[#007396]" />;
  if (n.includes('kotlin')) return <SiKotlin size={14} className="text-[#7F52FF]" />;
  if (n.includes('swift')) return <FaSwift size={14} className="text-[#F05138]" />;
  if (n.includes('flutter') || n.includes('dart')) return <SiFlutter size={14} className="text-[#02569B]" />;
  if (n.includes('c++') || n.includes('cpp')) return <SiCplusplus size={14} className="text-[#00599C]" />;
  if (n.includes('c#') || n.includes('csharp') || n.includes('.net')) return <SiDotnet size={14} className="text-[#512BD4]" />;
  if (n.includes('php')) return <FaPhp size={14} className="text-[#777BB4]" />;
  if (n.includes('ruby')) return <SiRuby size={14} className="text-[#CC342D]" />;
  if (n.includes('solidity')) return <SiSolidity size={14} className="text-[#363636] dark:text-white" />;
  if (n.includes('docker')) return <FaDocker size={14} className="text-[#2496ED]" />;
  if (n.includes('kubernetes') || n.includes('k8s')) return <SiKubernetes size={14} className="text-[#326CE5]" />;
  if (n.includes('aws') || n.includes('amazon')) return <FaAws size={14} className="text-[#FF9900]" />;
  if (n.includes('gcp') || n.includes('google cloud')) return <SiGooglecloud size={14} className="text-[#4285F4]" />;
  if (n.includes('terraform')) return <SiTerraform size={14} className="text-[#7B42BC]" />;
  if (n.includes('vercel')) return <SiVercel size={14} className="text-black dark:text-white" />;
  if (n.includes('supabase')) return <SiSupabase size={14} className="text-[#3ECF8E]" />;
  if (n.includes('firebase')) return <SiFirebase size={14} className="text-[#FFCA28]" />;
  if (n.includes('nginx')) return <SiNginx size={14} className="text-[#009639]" />;
  if (n.includes('tailwind')) return <SiTailwindcss size={14} className="text-[#06B6D4]" />;
  if (n.includes('postgres') || n.includes('sql')) return <SiPostgresql size={14} className="text-[#4169E1]" />;
  if (n.includes('mysql')) return <SiMysql size={14} className="text-[#4479A1]" />;
  if (n.includes('sqlite')) return <SiSqlite size={14} className="text-[#003B57]" />;
  if (n.includes('mongo')) return <SiMongodb size={14} className="text-[#47A248]" />;
  if (n.includes('node') || n.includes('express')) return <FaNodeJs size={14} className="text-[#5FA04E]" />;
  if (n.includes('prisma')) return <SiPrisma size={14} className="text-[#2D3748] dark:text-white" />;
  if (n.includes('redux')) return <SiRedux size={14} className="text-[#764ABC]" />;
  if (n === 'go' || n.includes('golang')) return <SiGo size={14} className="text-[#00ADD8]" />;
  if (n.includes('rust')) return <FaRust size={14} className="text-[#DEA584]" />;
  if (n.includes('redis')) return <SiRedis size={14} className="text-[#DC382D]" />;
  if (n.includes('graphql')) return <SiGraphql size={14} className="text-[#E10098]" />;
  if (n.includes('kafka')) return <SiApachekafka size={14} className="text-[#231F20] dark:text-white" />;
  if (n.includes('pytorch')) return <SiPytorch size={14} className="text-[#EE4C2C]" />;
  if (n.includes('openai') || n.includes('gpt') || n.includes('ai') || n.includes('llm')) return <Sparkles size={14} className="text-[#10A37F]" />;
  if (n.includes('git') || n.includes('github')) return <FaGitAlt size={14} className="text-[#F05032]" />;
  if (n.includes('figma') || n.includes('design')) return <SiFigma size={14} className="text-[#F24E1E]" />;
  if (n.includes('linux')) return <FaLinux size={14} className="text-[#FCC624]" />;
  return <Code2 size={14} className="text-black dark:text-white opacity-60" />;
}

const PRESET_SKILLS: { name: string; category: TechSkill['category'] }[] = [
  // Languages
  { name: 'TypeScript', category: 'languages' },
  { name: 'JavaScript', category: 'languages' },
  { name: 'Python', category: 'languages' },
  { name: 'Java', category: 'languages' },
  { name: 'Go', category: 'languages' },
  { name: 'Rust', category: 'languages' },
  { name: 'C++', category: 'languages' },
  { name: 'C#', category: 'languages' },
  { name: 'Kotlin', category: 'languages' },
  { name: 'Swift', category: 'languages' },
  { name: 'PHP', category: 'languages' },
  { name: 'Ruby', category: 'languages' },
  { name: 'Dart', category: 'languages' },
  { name: 'SQL', category: 'languages' },
  { name: 'HTML5', category: 'languages' },
  { name: 'CSS3', category: 'languages' },
  { name: 'Solidity', category: 'languages' },

  // Frameworks & Libraries
  { name: 'React', category: 'frameworks' },
  { name: 'Next.js', category: 'frameworks' },
  { name: 'Vue.js', category: 'frameworks' },
  { name: 'Nuxt.js', category: 'frameworks' },
  { name: 'Svelte', category: 'frameworks' },
  { name: 'Angular', category: 'frameworks' },
  { name: 'Node.js', category: 'frameworks' },
  { name: 'Express', category: 'frameworks' },
  { name: 'NestJS', category: 'frameworks' },
  { name: 'Spring Boot', category: 'frameworks' },
  { name: 'Django', category: 'frameworks' },
  { name: 'FastAPI', category: 'frameworks' },
  { name: 'Flask', category: 'frameworks' },
  { name: 'Ruby on Rails', category: 'frameworks' },
  { name: 'TailwindCSS', category: 'frameworks' },
  { name: 'GraphQL', category: 'frameworks' },
  { name: 'Prisma', category: 'frameworks' },
  { name: 'Redux', category: 'frameworks' },
  { name: 'Zustand', category: 'frameworks' },
  { name: 'Flutter', category: 'frameworks' },
  { name: 'React Native', category: 'frameworks' },

  // Cloud & DevOps
  { name: 'AWS', category: 'cloud' },
  { name: 'Docker', category: 'cloud' },
  { name: 'Kubernetes', category: 'cloud' },
  { name: 'GCP', category: 'cloud' },
  { name: 'Azure', category: 'cloud' },
  { name: 'Terraform', category: 'cloud' },
  { name: 'GitHub Actions', category: 'cloud' },
  { name: 'Vercel', category: 'cloud' },
  { name: 'Cloudflare', category: 'cloud' },
  { name: 'CI/CD', category: 'cloud' },
  { name: 'Nginx', category: 'cloud' },
  { name: 'Ansible', category: 'cloud' },
  { name: 'Prometheus', category: 'cloud' },
  { name: 'Grafana', category: 'cloud' },

  // Databases
  { name: 'PostgreSQL', category: 'databases' },
  { name: 'Redis', category: 'databases' },
  { name: 'MongoDB', category: 'databases' },
  { name: 'MySQL', category: 'databases' },
  { name: 'SQLite', category: 'databases' },
  { name: 'Supabase', category: 'databases' },
  { name: 'Firebase', category: 'databases' },
  { name: 'Elasticsearch', category: 'databases' },
  { name: 'DynamoDB', category: 'databases' },
  { name: 'Cassandra', category: 'databases' },

  // Tools & AI
  { name: 'Git', category: 'tools' },
  { name: 'Figma', category: 'tools' },
  { name: 'Linux', category: 'tools' },
  { name: 'Kafka', category: 'tools' },
  { name: 'RabbitMQ', category: 'tools' },
  { name: 'REST APIs', category: 'tools' },
  { name: 'WebSockets', category: 'tools' },
  { name: 'OpenAI', category: 'tools' },
  { name: 'PyTorch', category: 'tools' },
  { name: 'TensorFlow', category: 'tools' },
  { name: 'Vite', category: 'tools' },
  { name: 'Postman', category: 'tools' },
  { name: 'Jest', category: 'tools' },
];

export interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdated?: (updated: Partial<UserProfile>) => void;
  currentSkills?: TechSkill[];
  onSkillsUpdated?: (skills: TechSkill[]) => void;
}

type TabKey = 'general' | 'skills' | 'social';

export function ProfileEditModal({
  open,
  onClose,
  profile,
  onProfileUpdated,
  currentSkills = [],
  onSkillsUpdated,
}: ProfileEditModalProps) {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [saving, setSaving] = useState(false);

  // General tab state
  const [firstName, setFirstName] = useState(profile.firstName || user?.firstName || '');
  const [lastName, setLastName] = useState(profile.lastName || user?.lastName || '');
  const [headline, setHeadline] = useState(profile.headline || user?.headline || '');
  const [bio, setBio] = useState(profile.bio || user?.bio || '');
  const [location, setLocation] = useState(profile.location || user?.location || '');

  // Social & Web tab state
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl || user?.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl || user?.githubUrl || '');
  const [websiteUrl, setWebsiteUrl] = useState(
    profile.socialLinks?.find((l) => !l.includes('linkedin') && !l.includes('github')) || ''
  );

  // Skills tab state
  const [skillsList, setSkillsList] = useState<TechSkill[]>(currentSkills);
  const [skillSearch, setSkillSearch] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<TechSkill['category']>('languages');
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<string>('all');

  // Activity visibility state. Only instructors may hide it — the backend refuses a learner.
  const canHideLearnerActivity = user?.canHideLearnerActivity ?? false;
  const [showLearnerActivity, setShowLearnerActivity] = useState<boolean>(
    user?.showLearnerActivity ?? profile.learnerActivityVisible ?? true
  );

  // Sync initial state when modal opens
  useEffect(() => {
    if (open) {
      setFirstName(profile.firstName || user?.firstName || '');
      setLastName(profile.lastName || user?.lastName || '');
      setHeadline(profile.headline || user?.headline || '');
      setBio(profile.bio || user?.bio || '');
      setLocation(profile.location || user?.location || '');
      setLinkedinUrl(profile.linkedinUrl || user?.linkedinUrl || '');
      setGithubUrl(profile.githubUrl || user?.githubUrl || '');
      setWebsiteUrl(
        profile.socialLinks?.find((l) => !l.includes('linkedin') && !l.includes('github')) || ''
      );
      setSkillsList(currentSkills);
      setShowLearnerActivity(user?.showLearnerActivity ?? profile.learnerActivityVisible ?? true);
    }
  }, [open, profile, user, currentSkills]);

  // Handle skill toggling / adding
  const toggleSkill = (preset: { name: string; category: TechSkill['category'] }) => {
    const exists = skillsList.some((s) => s.name.toLowerCase() === preset.name.toLowerCase());
    if (exists) {
      setSkillsList(skillsList.filter((s) => s.name.toLowerCase() !== preset.name.toLowerCase()));
    } else {
      setSkillsList([
        ...skillsList,
        {
          name: preset.name,
          category: preset.category,
          icon: getSkillIcon(preset.name),
          accent: '#6366f1',
          primary: false,
        },
      ]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = skillSearch.trim();
    if (!trimmed) return;
    if (skillsList.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Skill is already added');
      return;
    }
    setSkillsList([
      ...skillsList,
      {
        name: trimmed,
        category: newSkillCategory,
        icon: getSkillIcon(trimmed),
        accent: '#6366f1',
        primary: false,
      },
    ]);
    setSkillSearch('');
  };

  const togglePrimarySkill = (name: string) => {
    setSkillsList(
      skillsList.map((s) => (s.name === name ? { ...s, primary: !s.primary } : s))
    );
  };

  const removeSkill = (name: string) => {
    setSkillsList(skillsList.filter((s) => s.name !== name));
  };

  // Main Save Handler
  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First and last name are required');
      return;
    }

    setSaving(true);
    try {
      // 1. Update basic profile info on server
      const updatedUser = await UserService.updateProfile(
        firstName.trim(),
        lastName.trim(),
        bio.trim(),
        linkedinUrl.trim(),
        user?.username || undefined,
        user?.mobileNumber || undefined,
        user?.gender || undefined,
        user?.address || undefined,
        githubUrl.trim(),
        user?.avatarUrl || undefined,
        user?.onboardingCompleted,
        user?.nickname || undefined
      );

      // 2. Also save presentation fields and skills to database
      const cleanHeadline = headline.trim().slice(0, 20);
      const cleanBio = bio.trim() ? bio.trim().split(/\s+/).slice(0, 40).join(' ') : '';

      const skillsClean = skillsList.map(({ icon, ...rest }) => rest);
      await UserService.updateProfilePresentation(firstName.trim(), lastName.trim(), {
        headline: cleanHeadline,
        location: location.trim(),
        skills: JSON.stringify(skillsClean),
        ...(canHideLearnerActivity ? { showLearnerActivity } : {}),
      });

      // Update auth store
      updateUser({
        ...updatedUser,
        headline: cleanHeadline,
        location: location.trim(),
        showLearnerActivity,
      });

      // Callback to parent
      const updatedLinks = [linkedinUrl.trim(), githubUrl.trim(), websiteUrl.trim()].filter(Boolean);
      onProfileUpdated?.({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        headline: cleanHeadline,
        bio: cleanBio,
        location: location.trim(),
        linkedinUrl: linkedinUrl.trim(),
        githubUrl: githubUrl.trim(),
        socialLinks: updatedLinks,
        learnerActivityVisible: showLearnerActivity,
      });

      // Update skills callbacks
      onSkillsUpdated?.(skillsList);

      // Save skills to localStorage for persistence across reloads
      if (profile.handle) {
        localStorage.setItem(`arcade_skills_${profile.handle}`, JSON.stringify(skillsList));
      }

      toast.success('Profile updated successfully!');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: 'general', label: 'General Info', icon: User },
    { key: 'skills', label: 'Skills & Tech', icon: Cpu, badge: skillsList.length },
    { key: 'social', label: 'Social & Web', icon: Globe },
  ];

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 14 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 my-auto flex h-[88vh] max-h-[760px] w-full max-w-2xl flex-col rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-xl rounded-bl-xl border border-slate-200/90 dark:border-slate-800/90 bg-surface/98 dark:bg-slate-900/98 shadow-2xl overflow-hidden backdrop-blur-xl"
            >
              {/* Top Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div>
                  <h2 className="text-base font-bold text-black dark:text-white">
                    Edit Profile
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex size-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Navigation Segmented Tabs */}
              <div className="px-6 pb-3">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 overflow-x-auto scrollbar-none">
                  {tabs.map((t) => {
                    const Icon = t.icon;
                    const active = activeTab === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setActiveTab(t.key)}
                        className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap text-black dark:text-white ${
                          active
                            ? 'bg-white dark:bg-slate-900 shadow-2xs font-bold'
                            : 'hover:bg-white/60 dark:hover:bg-slate-900/60 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <Icon size={13} />
                        <span>{t.label}</span>
                        {t.badge !== undefined && (
                          <span className="rounded-full px-1.5 py-0.2 text-xs font-semibold bg-slate-200/70 dark:bg-slate-700/60 text-black dark:text-white">
                            {t.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-6 py-3 space-y-4">
                
                {/* ── Tab 1: General Info ── */}
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-black dark:text-white">
                          First Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Alex"
                          className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-3.5 py-2 text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-black dark:text-white">
                          Last Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Mercer"
                          className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-3.5 py-2 text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-black dark:text-white">
                          Headline
                        </label>
                        <span className="text-xs font-medium text-black dark:text-white opacity-70">
                          {headline.length}/20 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={20}
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value.slice(0, 20))}
                        placeholder="e.g. Software Engineer"
                        className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-3.5 py-2 text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-black dark:text-white">
                        Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Bangalore, India • Remote"
                        className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-3.5 py-2 text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-black dark:text-white">
                          Bio
                        </label>
                        <span
                          className={`text-xs font-medium ${
                            bio.trim() && bio.trim().split(/\s+/).length > 40
                              ? 'text-rose-500 font-bold'
                              : 'text-black dark:text-white opacity-70'
                          }`}
                        >
                          {bio.trim() ? bio.trim().split(/\s+/).length : 0}/40 words
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => {
                          const val = e.target.value;
                          const words = val.trim().split(/\s+/);
                          if (!val.trim() || words.length <= 40 || val.length < bio.length) {
                            setBio(val);
                          }
                        }}
                        placeholder="Share your background, current focus areas, and what you are building..."
                        className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3 text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:border-black dark:focus:border-white focus:outline-none transition-colors leading-relaxed"
                      />
                    </div>

                    {/* Learning Activity & Achievements Privacy Toggle — instructors only */}
                    {canHideLearnerActivity && (
                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                      <div className="flex-1 min-w-0">
                        <label className="text-xs font-bold text-black dark:text-white block">
                          Show learning activity on profile
                        </label>
                        <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                          Show your achievements, certificates, and learning heatmap on your public profile.
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={showLearnerActivity}
                        onClick={() => setShowLearnerActivity((v) => !v)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                          showLearnerActivity ? 'bg-black dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow transition-transform ${
                            showLearnerActivity ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    )}
                  </div>
                )}

                {/* ── Tab 2: Skills & Tech ── */}
                {activeTab === 'skills' && (
                  <div className="space-y-4">
                    {/* Add / Search Box */}
                    <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 space-y-2.5">
                      <h4 className="text-xs font-bold text-black dark:text-white">
                        Add Custom Technology
                      </h4>
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <div className="relative flex-1 min-w-[180px]">
                          <Search size={13} className="absolute left-3 top-2.5 text-black dark:text-white opacity-40" />
                          <input
                            type="text"
                            value={skillSearch}
                            onChange={(e) => setSkillSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
                            placeholder="Type a skill name (e.g. Svelte, Prisma, Rust)..."
                            className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                          />
                        </div>
                        <select
                          value={newSkillCategory}
                          onChange={(e) => setNewSkillCategory(e.target.value as TechSkill['category'])}
                          className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-black dark:text-white focus:outline-none"
                        >
                          <option value="languages">Languages</option>
                          <option value="frameworks">Frameworks</option>
                          <option value="cloud">Cloud / DevOps</option>
                          <option value="databases">Databases</option>
                          <option value="tools">Tools</option>
                        </select>
                        <button
                          type="button"
                          onClick={addCustomSkill}
                          className="inline-flex items-center gap-1 rounded-xl bg-black dark:bg-white px-3.5 py-1.5 text-xs font-bold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                    {/* Active Selected Skills */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-black dark:text-white">
                          Active Profile Skills ({skillsList.length})
                        </h4>
                        <span className="text-xs font-normal text-black dark:text-white opacity-70">
                          Star for primary highlight
                        </span>
                      </div>

                      {skillsList.length === 0 ? (
                        <p className="text-xs text-black dark:text-white opacity-60 italic py-2">
                          No skills added yet. Select from the presets below or add custom skills.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {skillsList.map((skill) => (
                            <div
                              key={skill.name}
                              className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-black dark:text-white shadow-2xs"
                            >
                              <span>{getSkillIcon(skill.name, skill.icon)}</span>
                              <span>{skill.name}</span>
                              <button
                                type="button"
                                onClick={() => togglePrimarySkill(skill.name)}
                                title="Toggle primary highlight"
                                className={`p-0.5 rounded transition-colors cursor-pointer ${
                                  skill.primary ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                                }`}
                              >
                                <Star size={12} fill={skill.primary ? 'currentColor' : 'none'} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeSkill(skill.name)}
                                className="p-0.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Popular Presets */}
                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-black dark:text-white">
                          Popular Technologies
                        </h4>
                        
                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                          {[
                            { key: 'all', label: 'All' },
                            { key: 'languages', label: 'Languages' },
                            { key: 'frameworks', label: 'Frameworks' },
                            { key: 'cloud', label: 'Cloud' },
                            { key: 'databases', label: 'Databases' },
                            { key: 'tools', label: 'Tools & AI' },
                          ].map((cat) => (
                            <button
                              key={cat.key}
                              type="button"
                              onClick={() => setPresetCategoryFilter(cat.key)}
                              className={`rounded-lg px-2 py-0.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                presetCategoryFilter === cat.key
                                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs font-bold'
                                  : 'text-black/70 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
                        {(presetCategoryFilter === 'all'
                          ? PRESET_SKILLS
                          : PRESET_SKILLS.filter((s) => s.category === presetCategoryFilter)
                        ).map((preset) => {
                          const isSelected = skillsList.some(
                            (s) => s.name.toLowerCase() === preset.name.toLowerCase()
                          );
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => toggleSkill(preset)}
                              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                                  : 'border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              {getSkillIcon(preset.name)}
                              <span>{preset.name}</span>
                              {isSelected ? <Check size={11} /> : <Plus size={11} className="opacity-50" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Tab 3: Social & Links ── */}
                {activeTab === 'social' && (
                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
                        <FaLinkedin size={13} className="text-[#0A66C2]" />
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-3.5 py-2 text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
                        <FaGithub size={13} className="text-black dark:text-white" />
                        GitHub Profile URL
                      </label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-3.5 py-2 text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
                        <Globe size={13} className="text-black dark:text-white opacity-70" />
                        Personal Portfolio / Website
                      </label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://yourportfolio.dev"
                        className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-3.5 py-2 text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-800/80 px-6 py-4 bg-slate-50/50 dark:bg-slate-950/40">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-black dark:bg-white px-5 py-2 text-xs font-bold text-white dark:text-black shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  {saving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving changes...</span>
                    </>
                  ) : (
                    <>
                      <Check size={13} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
