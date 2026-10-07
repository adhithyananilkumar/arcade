'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * Dedicated interactive Profile Edit Modal.
 * Allows users to edit their public persona: Basic info (headline, bio,
 * location), Skills & Technologies stack, Featured Projects/Repos,
 * and Social/Web links without leaving the profile page.
 * ------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Cpu,
  FolderGit2,
  Globe,
  Plus,
  Trash2,
  Star,
  Check,
  Loader2,
  ExternalLink,
  Sparkles,
  Search,
  Code2,
  Layers,
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaReact, FaPython, FaDocker, FaAws, FaNodeJs, FaRust, FaGitAlt } from 'react-icons/fa';
import { SiTypescript, SiNextdotjs, SiTailwindcss, SiPostgresql, SiKubernetes, SiRedis, SiFigma, SiGo, SiGraphql } from 'react-icons/si';
import { toast } from 'sonner';
import { UserService } from '@/domains/identity';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import type { UserProfile } from '../types/profile.types';
import type { TechSkill, ShowcaseProject } from './ProfilePanels';

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
  if (n.includes('react')) return <FaReact size={14} className="text-[#61DAFB]" />;
  if (n.includes('next')) return <SiNextdotjs size={14} className="text-slate-900 dark:text-white" />;
  if (n.includes('python') || n === 'py') return <FaPython size={14} className="text-[#3776AB]" />;
  if (n.includes('docker')) return <FaDocker size={14} className="text-[#2496ED]" />;
  if (n.includes('kubernetes') || n.includes('k8s')) return <SiKubernetes size={14} className="text-[#326CE5]" />;
  if (n.includes('aws') || n.includes('amazon')) return <FaAws size={14} className="text-[#FF9900]" />;
  if (n.includes('tailwind')) return <SiTailwindcss size={14} className="text-[#06B6D4]" />;
  if (n.includes('postgres') || n.includes('sql')) return <SiPostgresql size={14} className="text-[#4169E1]" />;
  if (n.includes('node') || n.includes('express')) return <FaNodeJs size={14} className="text-[#5FA04E]" />;
  if (n === 'go' || n.includes('golang')) return <SiGo size={14} className="text-[#00ADD8]" />;
  if (n.includes('rust')) return <FaRust size={14} className="text-[#DEA584]" />;
  if (n.includes('redis')) return <SiRedis size={14} className="text-[#DC382D]" />;
  if (n.includes('graphql')) return <SiGraphql size={14} className="text-[#E10098]" />;
  if (n.includes('git') || n.includes('github')) return <FaGitAlt size={14} className="text-[#F05032]" />;
  if (n.includes('figma') || n.includes('design')) return <SiFigma size={14} className="text-[#F24E1E]" />;
  return <Code2 size={14} className="text-indigo-500" />;
}

const PRESET_SKILLS: { name: string; category: TechSkill['category'] }[] = [
  { name: 'TypeScript', category: 'languages' },
  { name: 'JavaScript', category: 'languages' },
  { name: 'Python', category: 'languages' },
  { name: 'Go', category: 'languages' },
  { name: 'Rust', category: 'languages' },
  { name: 'Java', category: 'languages' },
  { name: 'C++', category: 'languages' },
  { name: 'React', category: 'frameworks' },
  { name: 'Next.js', category: 'frameworks' },
  { name: 'Node.js', category: 'frameworks' },
  { name: 'TailwindCSS', category: 'frameworks' },
  { name: 'GraphQL', category: 'frameworks' },
  { name: 'Express', category: 'frameworks' },
  { name: 'Vue.js', category: 'frameworks' },
  { name: 'AWS', category: 'cloud' },
  { name: 'Docker', category: 'cloud' },
  { name: 'Kubernetes', category: 'cloud' },
  { name: 'GCP', category: 'cloud' },
  { name: 'Azure', category: 'cloud' },
  { name: 'PostgreSQL', category: 'databases' },
  { name: 'Redis', category: 'databases' },
  { name: 'MongoDB', category: 'databases' },
  { name: 'MySQL', category: 'databases' },
  { name: 'Git', category: 'tools' },
  { name: 'Figma', category: 'tools' },
  { name: 'Linux', category: 'tools' },
];

export interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdated?: (updated: Partial<UserProfile>) => void;
  currentSkills?: TechSkill[];
  onSkillsUpdated?: (skills: TechSkill[]) => void;
  currentProjects?: ShowcaseProject[];
  onProjectsUpdated?: (projects: ShowcaseProject[]) => void;
}

type TabKey = 'general' | 'skills' | 'projects' | 'social';

export function ProfileEditModal({
  open,
  onClose,
  profile,
  onProfileUpdated,
  currentSkills = [],
  onSkillsUpdated,
  currentProjects = [],
  onProjectsUpdated,
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

  // Projects tab state
  const [projectsList, setProjectsList] = useState<ShowcaseProject[]>(currentProjects);
  const [editingProject, setEditingProject] = useState<ShowcaseProject | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);

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
      setProjectsList(currentProjects);
    }
  }, [open, profile, user, currentSkills, currentProjects]);

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

  // Handle projects
  const handleSaveProject = (project: ShowcaseProject) => {
    if (projectsList.some((p) => p.id === project.id)) {
      setProjectsList(projectsList.map((p) => (p.id === project.id ? project : p)));
    } else {
      setProjectsList([...projectsList, project]);
    }
    setIsAddingProject(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    setProjectsList(projectsList.filter((p) => p.id !== id));
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

      // 2. Also save presentation fields, featured projects, and skills to database
      const skillsClean = skillsList.map(({ icon, ...rest }) => rest);
      await UserService.updateProfilePresentation(firstName.trim(), lastName.trim(), {
        headline: headline.trim(),
        location: location.trim(),
        featuredProjects: JSON.stringify(projectsList),
        skills: JSON.stringify(skillsClean),
      });

      // Update auth store
      updateUser({
        ...updatedUser,
        headline: headline.trim(),
        location: location.trim(),
      });

      // Callback to parent
      const updatedLinks = [linkedinUrl.trim(), githubUrl.trim(), websiteUrl.trim()].filter(Boolean);
      onProfileUpdated?.({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        headline: headline.trim(),
        bio: bio.trim(),
        location: location.trim(),
        linkedinUrl: linkedinUrl.trim(),
        githubUrl: githubUrl.trim(),
        socialLinks: updatedLinks,
      });

      // Update skills & projects callbacks
      onSkillsUpdated?.(skillsList);
      onProjectsUpdated?.(projectsList);

      // Save skills & projects to localStorage for persistence across reloads
      if (profile.handle) {
        localStorage.setItem(`arcade_skills_${profile.handle}`, JSON.stringify(skillsList));
        localStorage.setItem(`arcade_projects_${profile.handle}`, JSON.stringify(projectsList));
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
    { key: 'projects', label: 'Projects & Repos', icon: FolderGit2, badge: projectsList.length },
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
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex h-[88vh] max-h-[780px] w-full max-w-3xl flex-col rounded-3xl border border-slate-200/90 bg-surface shadow-2xl overflow-hidden dark:border-slate-800"
            >
              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Edit Public Profile
                  </h2>
                  <p className="text-xs text-slate-500">
                    Customize your portfolio, skills cloud, and featured projects
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 px-6 pt-2 bg-slate-50/30 dark:bg-slate-900/30 overflow-x-auto scrollbar-none">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const active = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        active
                          ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                          : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{t.label}</span>
                      {t.badge !== undefined && (
                        <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                          active
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {t.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* ── Tab 1: General Info ── */}
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          First Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Alex"
                          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Last Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Mercer"
                          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Professional Headline
                      </label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g. Distributed Systems Engineer • Open Source Contributor"
                        className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Bangalore, India • Remote"
                        className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Bio & About
                      </label>
                      <textarea
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Share your background, current focus areas, and what you are building..."
                        className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* ── Tab 2: Skills & Tech ── */}
                {activeTab === 'skills' && (
                  <div className="space-y-6">
                    {/* Add / Search Box */}
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Add Custom Skill
                      </h4>
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <div className="relative flex-1 min-w-[180px]">
                          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            value={skillSearch}
                            onChange={(e) => setSkillSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
                            placeholder="Type a skill name (e.g. Svelte, Prisma, Terraform)..."
                            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                        </div>
                        <select
                          value={newSkillCategory}
                          onChange={(e) => setNewSkillCategory(e.target.value as TechSkill['category'])}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
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
                          className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Active Selected Skills */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Active Profile Skills ({skillsList.length})
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Click <Star size={11} className="inline text-amber-500" /> to toggle Primary skill
                        </span>
                      </div>

                      {skillsList.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">
                          No skills added yet. Pick from the presets below or add custom skills.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {skillsList.map((skill) => (
                            <div
                              key={skill.name}
                              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                              <span>{getSkillIcon(skill.name, skill.icon)}</span>
                              <span>{skill.name}</span>
                              <button
                                type="button"
                                onClick={() => togglePrimarySkill(skill.name)}
                                title="Toggle primary skill star"
                                className={`p-0.5 rounded transition-colors cursor-pointer ${
                                  skill.primary ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'
                                }`}
                              >
                                <Star size={13} fill={skill.primary ? 'currentColor' : 'none'} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeSkill(skill.name)}
                                className="p-0.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Popular Presets */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Popular Technologies (Click to toggle)
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_SKILLS.map((preset) => {
                          const isSelected = skillsList.some(
                            (s) => s.name.toLowerCase() === preset.name.toLowerCase()
                          );
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => toggleSkill(preset)}
                              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'border border-slate-200/80 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300'
                              }`}
                            >
                              {getSkillIcon(preset.name)}
                              <span>{preset.name}</span>
                              {isSelected ? <Check size={12} /> : <Plus size={12} className="opacity-60" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Tab 3: Featured Projects & Repos ── */}
                {activeTab === 'projects' && (
                  <div className="space-y-4">
                    {/* Add / Edit Project Form */}
                    {(isAddingProject || editingProject) ? (
                      <ProjectForm
                        initialData={editingProject || undefined}
                        onSave={handleSaveProject}
                        onCancel={() => {
                          setIsAddingProject(false);
                          setEditingProject(null);
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Featured Projects ({projectsList.length})
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Showcase your open source repos, capstones, and web apps
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddingProject(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                          Add Project
                        </button>
                      </div>
                    )}

                    {/* Projects Cards List */}
                    {!isAddingProject && !editingProject && (
                      <div className="space-y-3">
                        {projectsList.length === 0 ? (
                          <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <FolderGit2 size={28} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                              No featured projects yet
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Add your GitHub repositories or live apps to display them on your profile.
                            </p>
                          </div>
                        ) : (
                          projectsList.map((proj) => (
                            <div
                              key={proj.id}
                              className="flex items-start justify-between gap-3 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40"
                            >
                              <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                    {proj.title}
                                  </h4>
                                  {proj.repoUrl && (
                                    <a
                                      href={proj.repoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-slate-400 hover:text-indigo-600"
                                    >
                                      <ExternalLink size={13} />
                                    </a>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                  {proj.description}
                                </p>
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {proj.tags.map((t) => (
                                    <span
                                      key={t}
                                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setEditingProject(proj)}
                                  className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg cursor-pointer transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProject(proj.id)}
                                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Tab 4: Social & Links ── */}
                {activeTab === 'social' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <FaLinkedin size={14} className="text-[#0A66C2]" />
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <FaGithub size={14} className="text-slate-900 dark:text-white" />
                        GitHub Profile URL
                      </label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <Globe size={14} className="text-indigo-500" />
                        Personal Portfolio / Website
                      </label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://yourportfolio.dev"
                        className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/60 dark:bg-slate-900/60">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white px-5 py-2 text-xs font-bold text-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving changes...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
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

/** Embedded Subform for Adding / Editing a Single Project */
function ProjectForm({
  initialData,
  onSave,
  onCancel,
}: {
  initialData?: ShowcaseProject;
  onSave: (p: ShowcaseProject) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [repoUrl, setRepoUrl] = useState(initialData?.repoUrl || '');
  const [demoUrl, setDemoUrl] = useState(initialData?.demoUrl || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || ['TypeScript', 'React']);
  const [stars, setStars] = useState<number | undefined>(initialData?.stars);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Project title and description are required');
      return;
    }
    onSave({
      id: initialData?.id || `proj-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      repoUrl: repoUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      tags: tags.length > 0 ? tags : ['Web'],
      stars,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-2xl border border-indigo-200/80 bg-indigo-50/30 dark:border-indigo-900/60 dark:bg-indigo-950/20 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
          {initialData ? 'Edit Featured Project' : 'Add New Featured Project'}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 p-1"
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
          Project Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Distributed Rate Limiter API"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
          Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short overview of what you built and tech highlights..."
          className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Repository URL (GitHub)
          </label>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Live Demo URL (Optional)
          </label>
          <input
            type="url"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            placeholder="https://myproject.dev"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
          Tags / Technologies
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Type tag & press Enter (e.g. Next.js, Redis)..."
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1 pt-1">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="text-slate-400 hover:text-rose-500"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
        >
          {initialData ? 'Save Project' : 'Add to Showcase'}
        </button>
      </div>
    </form>
  );
}
