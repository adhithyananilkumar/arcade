'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserService } from "@/domains/identity";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, MapPin, Link as LinkIcon, Mail, Calendar, Edit3,
  ChevronRight, Code, GitPullRequest, Star, BookOpen, GitCommit,
  MessageSquare, Flame, Trophy, Check, GraduationCap, Award, Compass,
  Loader2, X, Camera, Phone, Settings, Globe, CheckSquare, Shield, Map, Wrench, Activity, BadgeCheck, Lock, Sparkles
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import Image from 'next/image';
import PublicProfileLoading from './loading';
import Lottie from 'lottie-react';
import notFoundAnimation from '@/public/404 page not found.json';

const badges = [
  { 
    name: 'React Fundamentals', 
    subtitle: '0-50 XP',
    courseName: 'React Fundamentals', 
    achievedDate: 'Oct 15, 2026', 
    link: '/courses/react-fundamentals', 
    type: 'sword-crown' 
  },
  { 
    name: 'Advanced Next.js', 
    subtitle: '51-150 XP',
    courseName: 'Advanced Next.js', 
    achievedDate: 'Nov 02, 2026', 
    link: '/courses/advanced-nextjs', 
    type: 'potion' 
  },
  { 
    name: 'TypeScript Masterclass', 
    subtitle: '151-300 XP',
    courseName: 'TypeScript Masterclass', 
    achievedDate: 'Dec 12, 2026', 
    link: '/courses/typescript-masterclass', 
    type: 'mountain' 
  },
  { 
    name: 'System Architecture', 
    subtitle: '301-500 XP',
    courseName: 'System Architecture', 
    achievedDate: 'Jan 05, 2027', 
    link: '/courses/system-architecture', 
    type: 'flower' 
  },
  { 
    name: 'Cloud Native DevOps', 
    subtitle: '500+ XP',
    courseName: 'Cloud Native DevOps', 
    achievedDate: 'Feb 20, 2027', 
    link: '/courses/cloud-native-devops', 
    type: 'skull-arrows' 
  },
  {
    name: 'Full Stack Master',
    subtitle: '600+ XP',
    courseName: 'Full Stack Master',
    achievedDate: 'Mar 10, 2027',
    link: '/courses/full-stack-master',
    type: 'star'
  },
  {
    name: 'Backend Specialist',
    subtitle: '750+ XP',
    courseName: 'Backend Specialist',
    achievedDate: 'Apr 05, 2027',
    link: '/courses/backend-specialist',
    type: 'shield-book'
  },
  {
    name: 'Performance Guru',
    subtitle: '900+ XP',
    courseName: 'Performance Guru',
    achievedDate: 'May 12, 2027',
    link: '/courses/performance-guru',
    type: 'lightning'
  },
  {
    name: 'UI/UX Design',
    subtitle: '1000+ XP',
    courseName: 'UI/UX Design',
    achievedDate: 'Jun 20, 2027',
    link: '/courses/ui-ux-design',
    type: 'crystal' 
  },
  {
    name: 'Algorithmic Master',
    subtitle: '1200+ XP',
    courseName: 'Algorithmic Master',
    achievedDate: 'Jul 01, 2027',
    link: '/courses/algorithmic-master',
    type: 'atom-science'
  },
  {
    name: 'Web Security Pro',
    subtitle: '1350+ XP',
    courseName: 'Web Security Pro',
    achievedDate: 'Aug 10, 2027',
    link: '/courses/web-security-pro',
    type: 'fire-flame'
  },
  {
    name: 'Database Architect',
    subtitle: '1500+ XP',
    courseName: 'Database Architect',
    achievedDate: 'Sep 05, 2027',
    link: '/courses/database-architect',
    type: 'code-brackets'
  },
  {
    name: 'Mobile App Engineer',
    subtitle: '1700+ XP',
    courseName: 'Mobile App Engineer',
    achievedDate: 'Oct 12, 2027',
    link: '/courses/mobile-app-engineer',
    type: 'compass-navigation'
  },
  {
    name: 'AI/ML Specialist',
    subtitle: '2000+ XP',
    courseName: 'AI/ML Specialist',
    achievedDate: 'Nov 20, 2027',
    link: '/courses/aiml-specialist',
    type: 'cpu-chip'
  },
  {
    name: 'Open Source Champion',
    subtitle: '2500+ XP',
    courseName: 'Open Source Champion',
    achievedDate: 'Dec 15, 2027',
    link: '/courses/open-source-champion',
    type: 'target-bullseye'
  },
];

function BadgeGraphic({ type }: { type: string }) {
  // Shape Paths for elongated vertical hexagon (viewBox 0 0 100 130) exactly matching the reference
  const outerHex = "50,5 95,30 95,100 50,125 5,100 5,30";
  const leftBevel = "50,5 50,125 5,100 5,30";
  const innerHex = "50,15 85,35 85,95 50,115 15,95 15,35";
  const innerShadow = "50,15 85,35 85,95 50,115";

  return (
    <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-lg filter drop-shadow-[0_8px_15px_rgba(0,0,0,0.3)]">
      {/* 1. Sword and Crown */}
      {type === 'sword-crown' && (
        <g>
          {/* Outer Border */}
          <polygon points={outerHex} fill="#b8860b" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          
          {/* Inner Fill */}
          <polygon points={innerHex} fill="#0a2a43" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          {/* Background rays */}
          <path d="M 50,25 L 50,105 M 25,50 L 75,80 M 25,80 L 75,50" stroke="#4682b4" strokeWidth="2" opacity="0.4" />
          
          {/* Crown */}
          <path d="M 25,70 L 35,80 L 50,65 L 65,80 L 75,70 L 70,90 L 30,90 Z" fill="#daa520" />
          {/* Sword Blade */}
          <polygon points="50,35 58,55 50,95 42,55" fill="#a9c2d9" />
          {/* Sword Hilt */}
          <rect x="40" y="90" width="20" height="5" fill="#4682b4" />
          <rect x="47" y="95" width="6" height="10" fill="#2c3e50" />
        </g>
      )}

      {/* 2. Potion */}
      {type === 'potion' && (
        <g>
          <polygon points={outerHex} fill="#2980b9" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          <polygon points={innerHex} fill="#0d1f2d" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          <path d="M 30,75 C 30,95 70,95 70,75 C 70,65 60,60 60,50 L 60,40 L 40,40 L 40,50 C 40,60 30,65 30,75 Z" fill="#81ecec" />
          {/* Liquid level */}
          <path d="M 32,75 C 45,80 55,70 68,75 C 65,90 35,90 32,75 Z" fill="#00cec9" opacity="0.6" />
          {/* Plus sign */}
          <rect x="47" y="90" width="6" height="15" fill="#81ecec" />
          <rect x="42.5" y="94.5" width="15" height="6" fill="#81ecec" />
          {/* Cork */}
          <rect x="42" y="35" width="16" height="8" fill="#4a69bd" />
        </g>
      )}

      {/* 3. Mountain Peak */}
      {type === 'mountain' && (
        <g>
          <polygon points={outerHex} fill="#b2bec3" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          <polygon points={innerHex} fill="#2d3436" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          {/* Background Crown */}
          <path d="M 35,50 L 42,60 L 50,45 L 58,60 L 65,50 L 60,65 L 40,65 Z" fill="#f1c40f" />
          
          {/* Mountains */}
          <polygon points="15,87 40,55 60,75 70,65 85,87" fill="#74b9ff" />
          {/* Mountain Snow Caps */}
          <polygon points="40,55 32,64 43,66 48,61" fill="#dfe6e9" />
          <polygon points="70,65 64,72 73,74" fill="#dfe6e9" />
          <polygon points="15,87 85,87 50,105" fill="#0984e3" />
        </g>
      )}

      {/* 4. Flower/Leaf */}
      {type === 'flower' && (
        <g>
          <polygon points={outerHex} fill="#00b894" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          <polygon points={innerHex} fill="#004d40" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          {/* Leaf / Flower petals */}
          <path d="M 50,35 C 65,50 65,60 50,70 C 35,60 35,50 50,35 Z" fill="#55efc4" />
          <path d="M 50,70 C 65,60 75,70 70,85 C 60,85 55,75 50,70 Z" fill="#55efc4" />
          <path d="M 50,70 C 35,60 25,70 30,85 C 40,85 45,75 50,70 Z" fill="#55efc4" />
          {/* Center core */}
          <circle cx="50" cy="70" r="5" fill="#ffeaa7" />
          
          {/* Plus sign below */}
          <rect x="47" y="90" width="6" height="14" fill="#55efc4" />
          <rect x="43" y="94" width="14" height="6" fill="#55efc4" />
        </g>
      )}

      {/* 5. Skull and Arrows */}
      {type === 'skull-arrows' && (
        <g>
          <polygon points={outerHex} fill="#e1b12c" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          <polygon points={innerHex} fill="#2f3640" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          {/* Crossed Arrows */}
          <line x1="25" y1="50" x2="75" y2="90" stroke="#e84118" strokeWidth="4" />
          <polygon points="70,93 78,85 78,93" fill="#e84118" />
          <line x1="75" y1="50" x2="25" y2="90" stroke="#e84118" strokeWidth="4" />
          <polygon points="30,93 22,85 22,93" fill="#e84118" />
          
          {/* Flat stylized Skull */}
          <path d="M 35,60 C 35,45 65,45 65,60 L 65,70 L 60,80 L 40,80 L 35,70 Z" fill="#dcdde1" />
          {/* Eyes */}
          <circle cx="43" cy="65" r="4" fill="#2f3640" />
          <circle cx="57" cy="65" r="4" fill="#2f3640" />
          {/* Nose hole */}
          <polygon points="50,70 48,74 52,74" fill="#2f3640" />
          {/* Teeth lines */}
          <line x1="45" y1="80" x2="45" y2="75" stroke="#2f3640" strokeWidth="2" />
          <line x1="50" y1="80" x2="50" y2="75" stroke="#2f3640" strokeWidth="2" />
          <line x1="55" y1="80" x2="55" y2="75" stroke="#2f3640" strokeWidth="2" />
        </g>
      )}

      {/* 6. Star */}
      {type === 'star' && (
        <g>
          <polygon points={outerHex} fill="#8e44ad" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          <polygon points={innerHex} fill="#2c3e50" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          {/* Star Shape */}
          <polygon points="50,40 55,55 70,55 58,65 62,80 50,72 38,80 42,65 30,55 45,55" fill="#f1c40f" />
          <polygon points="50,40 55,55 50,72 38,80 42,65 30,55 45,55" fill="#f39c12" opacity="0.5" />
        </g>
      )}

      {/* 7. Shield-Book */}
      {type === 'shield-book' && (
        <g>
          <polygon points={outerHex} fill="#c0392b" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          <polygon points={innerHex} fill="#641e16" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          {/* Book */}
          <path d="M 35,55 L 50,60 L 65,55 L 65,75 L 50,80 L 35,75 Z" fill="#ecf0f1" />
          <path d="M 35,55 L 50,60 L 50,80 L 35,75 Z" fill="#bdc3c7" />
          
          {/* Bookmark */}
          <polygon points="45,50 55,50 55,75 50,70 45,75" fill="#e74c3c" />
        </g>
      )}

      {/* 8. Lightning */}
      {type === 'lightning' && (
        <g>
          <polygon points={outerHex} fill="#f39c12" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          <polygon points={innerHex} fill="#7e5109" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          {/* Lightning Bolt */}
          <polygon points="55,35 35,65 50,65 45,95 65,60 50,60" fill="#f1c40f" />
          <polygon points="55,35 50,65 45,95 65,60 50,60" fill="#f39c12" opacity="0.5" />
        </g>
      )}

      {/* 9. Crystal */}
      {type === 'crystal' && (
        <g>
          <polygon points={outerHex} fill="#e84393" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          <polygon points={innerHex} fill="#6c5ce7" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          {/* Crystal Shape */}
          <polygon points="50,40 65,55 50,85 35,55" fill="#a29bfe" />
          <polygon points="50,40 65,55 50,85" fill="#dfe6e9" opacity="0.4" />
          <polygon points="50,40 35,55 50,85" fill="#636e72" opacity="0.2" />
          <polygon points="45,35 55,35 60,45 40,45" fill="#74b9ff" />
          <polygon points="45,35 55,35 50,40" fill="#0984e3" />
        </g>
      )}

      {/* 10. Atom Science */}
      {type === 'atom-science' && (
        <g>
          <polygon points={outerHex} fill="#00cec9" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          <polygon points={innerHex} fill="#051923" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          <ellipse cx="50" cy="65" rx="25" ry="10" fill="none" stroke="#81ecec" strokeWidth="2.5" transform="rotate(-30 50 65)" />
          <ellipse cx="50" cy="65" rx="25" ry="10" fill="none" stroke="#81ecec" strokeWidth="2.5" transform="rotate(30 50 65)" />
          <circle cx="50" cy="65" r="7" fill="#74b9ff" />
          <circle cx="50" cy="65" r="4" fill="#ffffff" />
        </g>
      )}

      {/* 11. Fire Flame */}
      {type === 'fire-flame' && (
        <g>
          <polygon points={outerHex} fill="#ff7675" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          <polygon points={innerHex} fill="#4a0e17" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          <path d="M 50,35 C 40,55 30,65 30,78 C 30,90 40,95 50,95 C 60,95 70,90 70,78 C 70,65 60,55 50,35 Z" fill="#e17055" />
          <path d="M 50,50 C 43,62 36,70 36,80 C 36,88 42,91 50,91 C 58,91 64,88 64,80 C 64,70 57,62 50,50 Z" fill="#fdcb6e" />
          <path d="M 50,65 C 46,72 42,76 42,82 C 42,86 45,88 50,88 C 55,88 58,86 58,82 C 58,76 54,72 50,65 Z" fill="#ffffff" />
        </g>
      )}

      {/* 12. Code Brackets */}
      {type === 'code-brackets' && (
        <g>
          <polygon points={outerHex} fill="#30336b" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          <polygon points={innerHex} fill="#130f40" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          <path d="M 38,45 L 28,55 L 28,62 L 35,65 L 28,68 L 28,75 L 38,85" fill="none" stroke="#f1c40f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 62,45 L 72,55 L 72,62 L 65,65 L 72,68 L 72,75 L 62,85" fill="none" stroke="#f1c40f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="54" y1="45" x2="46" y2="85" stroke="#48dbfb" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}

      {/* 13. Compass Navigation */}
      {type === 'compass-navigation' && (
        <g>
          <polygon points={outerHex} fill="#d35400" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          <polygon points={innerHex} fill="#3d1e03" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          <circle cx="50" cy="65" r="28" fill="none" stroke="#f39c12" strokeWidth="2.5" />
          <polygon points="50,40 55,65 50,65" fill="#e74c3c" />
          <polygon points="50,40 45,65 50,65" fill="#c0392b" />
          <polygon points="50,90 55,65 50,65" fill="#ecf0f1" />
          <polygon points="50,90 45,65 50,65" fill="#bdc3c7" />
          <circle cx="50" cy="65" r="4" fill="#f1c40f" />
        </g>
      )}

      {/* 14. CPU Chip */}
      {type === 'cpu-chip' && (
        <g>
          <polygon points={outerHex} fill="#0984e3" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          <polygon points={innerHex} fill="#001427" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          <rect x="35" y="50" width="30" height="30" rx="4" fill="#00cec9" stroke="#74b9ff" strokeWidth="2" />
          <rect x="42" y="57" width="16" height="16" rx="2" fill="#001427" />
          <line x1="40" y1="42" x2="40" y2="50" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="50" y1="42" x2="50" y2="50" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="60" y1="42" x2="60" y2="50" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="40" y1="80" x2="40" y2="88" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="50" y1="80" x2="50" y2="88" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="60" y1="80" x2="60" y2="88" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="27" y1="55" x2="35" y2="55" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="27" y1="65" x2="35" y2="65" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="27" y1="75" x2="35" y2="75" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="65" y1="55" x2="73" y2="55" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="65" y1="65" x2="73" y2="65" stroke="#00cec9" strokeWidth="2.5" />
          <line x1="65" y1="75" x2="73" y2="75" stroke="#00cec9" strokeWidth="2.5" />
        </g>
      )}

      {/* 15. Target Bullseye */}
      {type === 'target-bullseye' && (
        <g>
          <polygon points={outerHex} fill="#6c5ce7" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.15" />
          <polygon points={innerHex} fill="#111111" />
          <polygon points={innerShadow} fill="#000000" opacity="0.25" />
          
          <circle cx="50" cy="65" r="26" fill="none" stroke="#ff7675" strokeWidth="3" />
          <circle cx="50" cy="65" r="17" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="50" cy="65" r="8" fill="#d63031" />
          <line x1="20" y1="65" x2="80" y2="65" stroke="#fdcb6e" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="50" y1="35" x2="50" y2="95" stroke="#fdcb6e" strokeWidth="2" strokeDasharray="3 3" />
        </g>
      )}
    </svg>
  );
}



function statusBadgeClasses(status?: string) {
  switch ((status || '').toUpperCase()) {
    case 'PUBLISHED':
      return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
    case 'DRAFT':
      return 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-neutral-700';
    case 'IN_REVIEW':
    case 'PENDING':
      return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
    case 'ARCHIVED':
      return 'bg-slate-100 dark:bg-neutral-800 text-slate-400 dark:text-neutral-500 border-slate-200 dark:border-neutral-700';
    default:
      return 'bg-slate-50 dark:bg-neutral-900 text-slate-500 dark:text-neutral-500 border-slate-100 dark:border-neutral-800';
  }
}

function AuthoredContentCard({ item }: { item: any }) {
  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-slate-100 dark:border-neutral-900 bg-white dark:bg-black p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer">
      <div className="relative z-10">
        <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white tracking-tight leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {item.title}
        </h4>
        <p className="text-[12px] text-slate-500 dark:text-neutral-400 font-bold leading-relaxed mt-2 line-clamp-3">
          {item.description || 'No description provided.'}
        </p>
      </div>

      <div className="relative z-10 mt-6 pt-4 border-t border-slate-50 dark:border-neutral-900 flex items-center justify-between gap-4">
        <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border ${statusBadgeClasses(item.status)}`}>
          {(item.status || 'UNKNOWN').replace(/_/g, ' ')}
        </span>
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-neutral-500 tracking-wide uppercase shrink-0">
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : ''}
        </span>
      </div>
    </div>
  );
}


export default function PublicProfilePage() {
  const params = useParams();
  const usernameParam = params.username as string;
  
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'courses' | 'roadmaps' | 'workshops' | 'enrolled' | 'certificates'>('courses');
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ count: number; dateStr: string; x: number; y: number } | null>(null);
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await UserService.getPublicProfile(usernameParam);
        setProfileData(data);
        const activity = await UserService.getUserActivity(usernameParam);
        const dataMap: Record<string, number> = {};
        activity.forEach((item: any) => {
          dataMap[item.date] = item.secondsSpent;
        });
        setActivityData(dataMap);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('User not found.');
        } else {
          setError('Could not load profile information.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (usernameParam) loadProfile();
  }, [usernameParam]);

  useEffect(() => {
    const handleLocalTime = (e: Event) => {
      const customEvent = e as CustomEvent;
      const secondsToAdd = customEvent.detail.seconds;
      setActivityData(prev => {
        const today = new Date().toISOString().split('T')[0];
        const current = prev[today] || 0;
        return { ...prev, [today]: current + secondsToAdd };
      });
    };
    
    window.addEventListener('localTimeIncrement', handleLocalTime);
    return () => {
      window.removeEventListener('localTimeIncrement', handleLocalTime);
    };
  }, []);

  const contributionGrid = useMemo(() => {
    const cols = 53;
    const rows = 7;
    const today = new Date();
    const grid = [];
    
    for (let c = 0; c < cols; c++) {
      const week = [];
      for (let r = 0; r < rows; r++) {
        // Calculate offset in days relative to today
        const todayDayOfWeek = (today.getDay() + 6) % 7; // Mon=0, Sun=6
        const dayOffset = (52 - c) * 7 + (todayDayOfWeek - r);
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - dayOffset);
        
        const dateStr = targetDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        const targetDateISO = targetDate.toISOString().split('T')[0];

        let count = 0;
        if (activityData[targetDateISO]) {
          count = Math.floor(activityData[targetDateISO] / 60);
        }

        let level = 0;
        if (count < 15) level = 0;
        else if (count < 30) level = 1;
        else if (count < 45) level = 2;
        else level = 3;

        week.push({ dateStr, count, level });
      }
      grid.push(week);
    }
    return grid;
  }, [activityData]);

  const totalMinutesSpent = useMemo(() => {
    let total = 0;
    contributionGrid.forEach(week => week.forEach(cell => { total += cell.count; }));
    return total;
  }, [contributionGrid]);

  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      const targetDateISO = targetDate.toISOString().split('T')[0];
      
      let count = 0;
      if (activityData[targetDateISO]) {
        count = Math.floor(activityData[targetDateISO] / 60);
      }
      
      if (count > 0) {
        streak++;
      } else {
        if (i === 0) continue;
        break;
      }
    }
    return streak;
  }, [activityData]);

  const dynamicBadges = useMemo(() => {
    return badges.map(b => {
      if (b.name.startsWith('Streak')) {
        return { ...b, name: `Streak ${currentStreak} Days` };
      }
      return b;
    });
  }, [currentStreak]);

  const months = useMemo(() => {
    const cols = [0, 4, 9, 13, 17, 22, 26, 31, 35, 39, 44, 48, 52];
    const today = new Date();
    return cols.map(c => {
      const d = new Date(today);
      d.setDate(today.getDate() - (52 - c) * 7);
      return { name: d.toLocaleDateString(undefined, { month: 'short' }), col: c };
    });
  }, []);

  if (isLoading) {
    return <PublicProfileLoading />;
  }

  if (error || !profileData) {
    return (
      <div className="flex flex-col md:flex-row items-center justify-center min-h-[60vh] py-12 gap-8 md:gap-16 text-slate-600 px-4">
        {/* Left Side: Animation */}
        <div className="w-64 h-64 md:w-96 md:h-96 shrink-0">
          <Lottie 
            lottieRef={lottieRef}
            animationData={notFoundAnimation} 
            loop={false} 
            onDOMLoaded={() => {
              if (lottieRef.current) {
                lottieRef.current.setSpeed(0.5);
              }
            }}
          />
        </div>

        {/* Right Side: Text */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-7xl md:text-9xl font-black text-slate-800 tracking-tight leading-none">404</h1>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-600 mt-2 md:mt-4">Page not found</h2>
          <p className="mt-4 text-slate-500 font-medium max-w-sm">The page or user you're looking for doesn't exist or might have been removed.</p>
          <Link href="/" className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm active:scale-95">
            Back
          </Link>
        </div>
      </div>
    );
  }

  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    if (url.startsWith('/api/v1/')) {
      return baseUrl.replace('/api/v1', '') + url;
    }
    if (!url.includes('/')) {
      return baseUrl + '/users/avatars/' + url;
    }
    return baseUrl + (url.startsWith('/') ? '' : '/') + url;
  };

  const username = profileData.username || 'username';
  const displayedBadges = showAllBadges ? dynamicBadges : dynamicBadges.slice(0, 5);

  return (
    <>
      {/* Global Background (Pure White / Dark) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-white dark:bg-[#020617]"></div>
      <motion.div 
        className="mx-auto max-w-6xl w-full space-y-6 pb-16 px-4 sm:px-6 relative transition-colors z-10 pt-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >

      {/* ── Main Profile Header Card ── */}
      <div className="relative px-6 py-6 transition-colors mb-8">
        
        

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 w-full">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full md:w-auto">
            {/* Avatar Container */}
            <div className="relative flex h-[120px] w-[120px] shrink-0">
              <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-black p-1 shadow-sm border border-slate-100 dark:border-neutral-800 transition-colors">
                <div className="flex h-full w-full items-center justify-center rounded-full overflow-hidden bg-slate-50 dark:bg-neutral-900 relative group transition-colors">
                  {profileData.avatarUrl ? (
                    <img src={getAvatarUrl(profileData.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon size={52} className="text-purple-400" />
                  )}

                  
                </div>
              </div>
              
            </div>

            {/* Details / Bio */}
            <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left pt-5 w-full relative">
              <div className="flex items-center gap-3">
                <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#111827] dark:text-white tracking-tight leading-none transition-colors flex items-center gap-2">
                  {profileData.fullName || (profileData.firstName + (profileData.lastName ? ' ' + profileData.lastName : '')) || 'User'}
                  
                  {/* Verification Tick */}
                  {(() => {
                    const bioLower = (profileData.bio || '').toLowerCase();
                    const isAdmin = 
                      profileData.role === 'ADMIN' ||
                      profileData.role === 'ROLE_ADMIN' ||
                      profileData.role === 'PLATFORM_ADMIN' ||
                      profileData.isAdmin === true ||
                      profileData.platformRoles?.some((r: any) => ['ADMIN', 'ROLE_ADMIN', 'PLATFORM_ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMIN'].includes((r.code || r.name || '').toUpperCase())) ||
                      profileData.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('ADMIN'));

                    const isCreator = 
                      profileData.role === 'CREATOR' ||
                      profileData.role === 'ROLE_CREATOR' ||
                      profileData.role === 'INSTRUCTOR' ||
                      profileData.isCreator === true ||
                      profileData.platformRoles?.some((r: any) => ['CREATOR', 'INSTRUCTOR', 'TEACHER', 'AUTHOR'].includes((r.code || r.name || '').toUpperCase())) ||
                      profileData.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('CREATOR')) ||
                      bioLower.includes('creator');

                    if (isAdmin) {
                      return (
                        <span title="Verified Admin" className="inline-flex items-center">
                          <BadgeCheck className="text-white fill-[#8b5cf6] dark:fill-[#8b5cf6] drop-shadow-[0_2px_6px_rgba(139,92,246,0.4)] shrink-0 ml-1.5 align-middle" size={26} strokeWidth={2.2} />
                        </span>
                      );
                    }

                    if (isCreator) {
                      return (
                        <span title="Verified Creator" className="inline-flex items-center">
                          <BadgeCheck className="text-white fill-[#1d9bf0] dark:fill-[#1d9bf0] drop-shadow-[0_2px_6px_rgba(29,155,240,0.4)] shrink-0 ml-1.5 align-middle" size={26} strokeWidth={2.2} />
                        </span>
                      );
                    }
                    return null;
                  })()}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-[14px] font-semibold text-purple-600 dark:text-purple-400 transition-colors">
                  @{username}
                </p>
                {(() => {
                  const bioLower = (profileData.bio || '').toLowerCase();
                  const isAdmin = 
                    profileData.role === 'ADMIN' ||
                    profileData.role === 'ROLE_ADMIN' ||
                    profileData.role === 'PLATFORM_ADMIN' ||
                    profileData.isAdmin === true ||
                    profileData.platformRoles?.some((r: any) => ['ADMIN', 'ROLE_ADMIN', 'PLATFORM_ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMIN'].includes((r.code || r.name || '').toUpperCase())) ||
                    profileData.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('ADMIN'));

                  const isCreator = 
                    profileData.role === 'CREATOR' ||
                    profileData.role === 'ROLE_CREATOR' ||
                    profileData.role === 'INSTRUCTOR' ||
                    profileData.isCreator === true ||
                    profileData.platformRoles?.some((r: any) => ['CREATOR', 'INSTRUCTOR', 'TEACHER', 'AUTHOR'].includes((r.code || r.name || '').toUpperCase())) ||
                    profileData.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('CREATOR')) ||
                    bioLower.includes('creator');

                  if (isAdmin) {
                    return (
                      <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Shield size={13} className="fill-rose-500/20 text-rose-600 dark:text-rose-400" /> Admin
                      </span>
                    );
                  }

                  if (isCreator) {
                    return (
                      <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Sparkles size={13} className="fill-blue-500 text-blue-500" /> Creator
                      </span>
                    );
                  }

                  return (
                    <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Star size={13} className="fill-amber-500 text-amber-500" /> Learner
                    </span>
                  );
                })()}
              </div>

              {/* Bio */}
              {profileData.bio && (
                <div className="mt-5 flex items-start gap-1.5 text-[#4b5563] dark:text-neutral-400 text-[13px] font-bold leading-relaxed w-full transition-colors">
                  <Code size={15} className="text-purple-600 shrink-0 mt-[1px]" />
                  <div className="flex flex-wrap items-center md:items-start">
                    {profileData.bio.split('|').map((part: string, i: number, arr: string[]) => (
                      <span key={i} className="inline-flex items-center">
                        {part.trim()}
                        {i < arr.length - 1 && <span className="mx-1.5 text-slate-300 dark:text-neutral-600">|</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location / Joined */}
              <div className="mt-4 flex flex-wrap items-center gap-6 text-[13px] text-slate-500 dark:text-neutral-500 font-bold w-full transition-colors">
                <div className="flex items-center gap-1.5">
                  <MapPin size={15} className="shrink-0 text-slate-400" />
                  <span className="truncate">{profileData.address || 'India'}</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Calendar size={15} className="shrink-0 text-slate-400" />
                  <span className="truncate">Joined July 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Badges Section ── */}
      <div className="relative z-10 mb-8 mt-2 px-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Trophy size={18} className="text-purple-600" />
            Badges
          </h3>
          <button 
            onClick={() => setShowAllBadges(!showAllBadges)}
            className="text-[13px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 cursor-pointer focus:outline-none"
          >
            {showAllBadges ? 'Show less' : 'View all badges'} <span className="font-light tracking-tighter">{'->'}</span>
          </button>
        </div>

        {/* Row 1: Exactly 10 Badges in a single line */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3 w-full items-center justify-items-center pt-1 pb-2">
          {dynamicBadges.slice(0, 10).map((badge) => (
            <div 
              key={badge.name} 
              className="flex flex-col items-center justify-center group relative cursor-pointer w-full"
            >
              <div className="relative w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] md:w-[68px] md:h-[68px] flex items-center justify-center z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-xl">
                <BadgeGraphic type={badge.type as string} />
              </div>

              {/* Tooltip Hover Box */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 translate-y-2 group-hover:translate-y-0">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                  <div className="w-16 h-16 mb-4 drop-shadow-md">
                    <BadgeGraphic type={badge.type as string} />
                  </div>
                  <h4 className="font-extrabold text-[15px] text-slate-900 dark:text-white mb-1.5 leading-tight">{badge.courseName}</h4>
                  <p className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 mb-4">Achieved: {badge.achievedDate}</p>
                  <a href={badge.link} className="text-[12px] font-extrabold bg-purple-50 hover:bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 dark:text-purple-400 py-2 px-5 rounded-full transition-colors w-full shadow-sm">
                    View Course
                  </a>
                </div>
                {/* Arrow pointing down */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-b border-r border-slate-100 dark:border-slate-800 rotate-45"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Other Badges listed below the 10 badges when "View all badges" is clicked */}
        <AnimatePresence>
          {showAllBadges && dynamicBadges.length > 10 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3 w-full items-center justify-items-center pt-4 border-t border-slate-100 dark:border-neutral-900 mt-3"
            >
              {dynamicBadges.slice(10).map((badge) => (
                <div 
                  key={badge.name} 
                  className="flex flex-col items-center justify-center group relative cursor-pointer w-full"
                >
                  <div className="relative w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] md:w-[68px] md:h-[68px] flex items-center justify-center z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-xl">
                    <BadgeGraphic type={badge.type as string} />
                  </div>

                  {/* Tooltip Hover Box */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                      <div className="w-16 h-16 mb-4 drop-shadow-md">
                        <BadgeGraphic type={badge.type as string} />
                      </div>
                      <h4 className="font-extrabold text-[15px] text-slate-900 dark:text-white mb-1.5 leading-tight">{badge.courseName}</h4>
                      <p className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 mb-4">Achieved: {badge.achievedDate}</p>
                      <a href={badge.link} className="text-[12px] font-extrabold bg-purple-50 hover:bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 dark:text-purple-400 py-2 px-5 rounded-full transition-colors w-full shadow-sm">
                        View Course
                      </a>
                    </div>
                    {/* Arrow pointing down */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-b border-r border-slate-100 dark:border-slate-800 rotate-45"></div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Working GitHub-Style Contribution Section (Purple Light Theme) ── */}
      <div className="rounded-[24px] border-[1px] border-slate-100/80 dark:border-neutral-900 bg-white/80 backdrop-blur-md dark:bg-black/60 px-8 py-8 shadow-[0_2px_15px_rgb(0,0,0,0.015)] text-slate-700 dark:text-neutral-300 font-sans relative transition-colors mt-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Activity size={18} className="text-purple-600 stroke-[2.5]" />
            Streak
          </h3>
          
          {/* Static text for Last 1 Year */}
          <div className="relative">
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 flex items-center gap-2 cursor-default">
              <span>Last 1 Year</span>
            </div>
          </div>
        </div>

        {/* Container for the grid without inner border */}
        <div className="transition-colors">
          <div className="flex gap-4 items-start">
            
            {/* Mon, Wed, Fri Labels */}
            <div className="hidden sm:grid grid-rows-7 gap-[2px] md:gap-[3px] text-[8px] md:text-[9px] text-slate-400 font-bold select-none shrink-0 pt-5">
              <div className="h-[7px] md:h-[10px] lg:h-[11px]"></div>
              <div className="flex items-center h-[7px] md:h-[10px] lg:h-[11px]">Mon</div>
              <div className="h-[7px] md:h-[10px] lg:h-[11px]"></div>
              <div className="flex items-center h-[7px] md:h-[10px] lg:h-[11px]">Wed</div>
              <div className="h-[7px] md:h-[10px] lg:h-[11px]"></div>
              <div className="flex items-center h-[7px] md:h-[10px] lg:h-[11px]">Fri</div>
              <div className="h-[7px] md:h-[10px] lg:h-[11px]"></div>
            </div>

            <div className="flex-grow w-full overflow-hidden flex justify-end sm:justify-start">
              <div className="w-fit">
                <div className="flex text-[9px] text-slate-400 font-bold mb-1.5 h-3.5 relative select-none">
                  {months.map((m, i) => (
                    <span 
                      key={`${m.name}-${m.col}-${i}`} 
                      className="absolute" 
                      style={{ left: `calc(${m.col} * (100% / 53))` }}
                    >
                      {m.name}
                    </span>
                  ))}
                </div>

                <div className="grid grid-flow-col grid-rows-7 gap-[1px] sm:gap-[2px] md:gap-[3px]">
                  {contributionGrid.map((week, wIdx) => 
                    week.map((cell, dIdx) => (
                      <div 
                        key={`${wIdx}-${dIdx}`}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          count: cell.count,
                          dateStr: cell.dateStr,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] md:w-[12px] md:h-[12px] lg:w-[14px] lg:h-[14px] rounded-full transition-all duration-200 cursor-pointer ${
                        cell.level === 0 ? 'bg-cyan-50 hover:bg-cyan-100 dark:bg-neutral-800 dark:hover:bg-neutral-700' :
                        cell.level === 1 ? 'bg-teal-400 hover:scale-105' :
                        cell.level === 2 ? 'bg-cyan-500 hover:scale-105' :
                        'bg-blue-600 hover:scale-105 shadow-sm'
                      }`}
                    />
                  ))
                )}
              </div>
            </div>
            </div>
          </div>

          {/* Grid Footer - Interactive elements */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 mt-6 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-2 select-none">
              <span>Less</span>
              <div className="w-[12px] h-[12px] rounded-full bg-cyan-50 dark:bg-neutral-800"></div>
              <div className="w-[12px] h-[12px] rounded-full bg-teal-400"></div>
              <div className="w-[12px] h-[12px] rounded-full bg-cyan-500"></div>
              <div className="w-[12px] h-[12px] rounded-full bg-blue-600"></div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pinned Certificates Section ── */}
      <div className="mt-12 mb-8 px-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Award size={18} className="text-slate-900 dark:text-white" />
            Pinned Certificates
          </h3>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-50 dark:bg-neutral-800 px-2.5 py-1 rounded-md">
            Max 10
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileData.certificates && profileData.certificates.length > 0 ? (
            profileData.certificates.slice(0, 10).map((cert: any, idx: number) => (
              <div key={idx} className="group flex items-center justify-between p-4 rounded-[20px] border border-slate-100 dark:border-neutral-900 bg-white dark:bg-black shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white transition-colors group-hover:scale-105 duration-300">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-extrabold text-slate-800 dark:text-white tracking-tight leading-snug group-hover:text-black dark:group-hover:text-slate-200 transition-colors">{cert.name}</h4>
                    <p className="text-[11px] text-slate-400 dark:text-neutral-500 font-bold mt-0.5">Issued by {cert.issuer}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-neutral-500 bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 px-2 py-0.5 rounded-md">
                    {cert.date}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 text-center py-10 border-2 border-dashed border-slate-100 dark:border-neutral-800 rounded-3xl text-slate-400 text-sm font-bold bg-slate-50/20 dark:bg-neutral-900/30">
              No pinned certificates yet.
            </div>
          )}
        </div>
      </div>

      

      {/* Absolute Custom Hover Tooltip */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 bg-slate-900 text-white text-[12px] font-bold px-4 py-2.5 rounded-xl shadow-xl pointer-events-none -translate-x-1/2 -translate-y-full flex items-center gap-1.5 whitespace-nowrap"
            style={{ left: hoveredCell.x, top: hoveredCell.y }}
          >
            <span>{hoveredCell.count === 0 ? '0 minutes spent' : `${hoveredCell.count} minutes spent`}</span>
            <span className="text-slate-400 font-semibold">on {hoveredCell.dateStr}</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
            {activeTab === 'roadmaps' && (
              <motion.div
                key="roadmaps"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {profileData.roadmaps && profileData.roadmaps.length > 0 ? (
                  profileData.roadmaps.map((roadmap: any, idx: number) => (
                    <AuthoredContentCard key={idx} item={roadmap} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-10 border-2 border-dashed border-slate-100 dark:border-neutral-800 rounded-3xl text-slate-400 text-sm font-bold bg-slate-50/20 dark:bg-neutral-900/30">
                    No authored roadmaps found for this user.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'workshops' && (
              <motion.div
                key="workshops"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {profileData.workshops && profileData.workshops.length > 0 ? (
                  profileData.workshops.map((workshop: any, idx: number) => (
                    <AuthoredContentCard key={idx} item={workshop} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-10 border-2 border-dashed border-slate-100 dark:border-neutral-800 rounded-3xl text-slate-400 text-sm font-bold bg-slate-50/20 dark:bg-neutral-900/30">
                    No authored workshops found for this user.
                  </div>
                )}
              </motion.div>
            )}


    </>
  );
}
