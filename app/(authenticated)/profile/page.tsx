'use client';

import { useState, useEffect, useLayoutEffect, useMemo, useRef, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from "@/domains/identity";
import { toast } from 'sonner';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { 
  User as UserIcon, MapPin, Link as LinkIcon, Mail, Calendar, Edit3, 
  ChevronRight, Code, GitPullRequest, Star, BookOpen, GitCommit, 
  MessageSquare, Flame, Trophy, Check, GraduationCap, Award, Compass,
  Loader2, X, Camera, Phone, Settings, Globe, CheckSquare, Activity,
  BadgeCheck, Lock, Trash2, Pin, ExternalLink, Search, Filter, Sparkles, Zap, Shield
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';
import MagicBento, { ParticleCard, GlobalSpotlight, useMobileDetection } from '@/components/ui/MagicBento';
import Masonry from '@/components/ui/Masonry';
import PartyPopper from '@/components/ui/PartyPopper';
import AnimatedList, { AnimatedItem } from '@/components/ui/AnimatedList';
import TicketNotchBorder from '@/components/ui/TicketNotchBorder';

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
  const outerHex = "50,8 92,30 92,100 50,122 8,100 8,30";
  const innerHex = "50,17 84,35 84,95 50,113 16,95 16,35";
  const innerShadow = "50,17 84,35 84,95 50,113";

  return (
    <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-lg filter drop-shadow-[0_8px_15px_rgba(0,0,0,0.3)] overflow-visible">
      {/* 1. Sword and Crown */}
      {type === 'sword-crown' && (
        <g>
          {/* Outer Border */}
          <polygon points={outerHex} fill="#b8860b" />
          
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

function CountUpNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  useEffect(() => {
    if (!isInView) {
      setDisplayValue(0);
      return;
    }

    let startTimestamp: number | null = null;
    const duration = 300;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easedProgress * value));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, value]);

  return <span ref={ref}>{displayValue}</span>;
}

function ProfilePageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const bentoGridRef = useRef<HTMLDivElement>(null);
  const achievementsModalRef = useRef<HTMLDivElement>(null);
  const certificatesModalRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();

  useLayoutEffect(() => {
    if (!bentoGridRef.current) return;
    const cards = bentoGridRef.current.querySelectorAll('.magic-bento-card');
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.08
        }
      );
    }
  }, []);
  
  // Badge visibility toggle
  const [showAllBadges, setShowAllBadges] = useState(false);

  // Achievements & Pinned Certificates Modal States
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isCertificatesModalOpen, setIsCertificatesModalOpen] = useState(false);
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'in_progress'>('all');
  const [achievementSearch, setAchievementSearch] = useState('');
  const [certificateSearch, setCertificateSearch] = useState('');

  // Full list of achievements
  const allAchievementsList = useMemo(() => [
    { id: '1', title: 'Quick Learner', desc: 'Complete 5 courses', date: 'Jul 15, 2026', icon: Star, color: 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', category: 'Learning', unlocked: true, progress: 100 },
    { id: '2', title: 'Knowledge Seeker', desc: 'Earn 3 certificates', date: 'Jul 10, 2026', icon: Trophy, color: 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', category: 'Certificates', unlocked: true, progress: 100 },
    { id: '3', title: 'Consistent Streak', desc: 'Maintain a 7-day streak', date: 'Jul 5, 2026', icon: Flame, color: 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', category: 'Streak', unlocked: true, progress: 100 },
    { id: '4', title: 'Top Performer', desc: 'Score 90%+ in any course', date: 'Jun 28, 2026', icon: Award, color: 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', category: 'Excellence', unlocked: true, progress: 100 },
    { id: '5', title: 'Speed Demon', desc: 'Complete 1 module in under 30 mins', date: 'Jun 18, 2026', icon: Zap, color: 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', category: 'Speed', unlocked: true, progress: 100 },
    { id: '6', title: 'Code Pioneer', desc: 'Submit 10 interactive lab exercises', date: 'Jun 05, 2026', icon: Code, color: 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', category: 'Coding', unlocked: true, progress: 100 },
    { id: '7', title: 'Community Helper', desc: 'Post 5 helpful answers in student forum', date: 'May 22, 2026', icon: MessageSquare, color: 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', category: 'Community', unlocked: true, progress: 100 },
    { id: '8', title: 'Master Scholar', desc: 'Earn 10 certificates across tracks', date: 'In Progress', icon: GraduationCap, color: 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', category: 'Certificates', unlocked: false, progress: 80 },
    { id: '9', title: 'Night Owl', desc: 'Complete 3 midnight study sessions', date: 'In Progress', icon: Compass, color: 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', category: 'Habits', unlocked: false, progress: 66 },
    { id: '10', title: 'Arcade Vanguard', desc: 'Participate in platform beta releases', date: 'Jan 01, 2026', icon: Shield, color: 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', category: 'Special', unlocked: true, progress: 100 },
  ], []);

  // List of all certificates with pinning status
  const [certificatesList, setCertificatesList] = useState([
    { id: 'cert-1', name: 'React Fundamentals & UI Patterns', issuer: 'Arcade Academy', date: 'Jul 15, 2026', grade: '98% (Distinction)', credentialId: 'ARC-2026-8812', isPinned: true },
    { id: 'cert-2', name: 'Advanced Next.js Architecture', issuer: 'Arcade Academy', date: 'Jul 10, 2026', grade: '95% (Honors)', credentialId: 'ARC-2026-9204', isPinned: true },
    { id: 'cert-3', name: 'TypeScript Masterclass & Patterns', issuer: 'Amal Jyothi College', date: 'Jul 02, 2026', grade: '92%', credentialId: 'ARC-2026-4410', isPinned: true },
    { id: 'cert-4', name: 'Full Stack Engineering Specialization', issuer: 'Amal Jyothi College', date: 'Jun 20, 2026', grade: '96% (Distinction)', credentialId: 'ARC-2026-1189', isPinned: true },
    { id: 'cert-5', name: 'Cloud Native DevOps & Kubernetes', issuer: 'Arcade Ecosystem', date: 'Jun 05, 2026', grade: '90%', credentialId: 'ARC-2026-7731', isPinned: false },
    { id: 'cert-6', name: 'System Architecture & Microservices', issuer: 'Arcade Ecosystem', date: 'May 28, 2026', grade: '94%', credentialId: 'ARC-2026-3092', isPinned: false },
    { id: 'cert-7', name: 'UI/UX Design Systems & Motion Design', issuer: 'Arcade Ecosystem', date: 'May 14, 2026', grade: '99% (High Distinction)', credentialId: 'ARC-2026-5519', isPinned: false },
  ]);

  const togglePinCertificate = (id: string) => {
    setCertificatesList(prev => {
      const target = prev.find(c => c.id === id);
      if (!target) return prev;
      const currentlyPinned = prev.filter(c => c.isPinned).length;
      if (!target.isPinned && currentlyPinned >= 4) {
        toast.error('You can pin up to 4 certificates on your profile.');
        return prev;
      }
      const newPinned = !target.isPinned;
      toast.success(newPinned ? `Pinned "${target.name}" to profile!` : `Unpinned "${target.name}".`);
      return prev.map(c => c.id === id ? { ...c, isPinned: newPinned } : c);
    });
  };

  // Sub Navigation Active Tab
  const [activeTab, setActiveTab] = useState<'courses' | 'enrolled' | 'certificates'>('courses');
  
  useEffect(() => {
    if (tabParam === 'enrolled' || tabParam === 'courses' || tabParam === 'certificates') {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);
  
  // Edit Profile Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLinkedinUrl, setEditLinkedinUrl] = useState('');
  const [editGithubUrl, setEditGithubUrl] = useState('');
  const [editMobileNumber, setEditMobileNumber] = useState('');
  const [editGender, setEditGender] = useState('MALE');
  const [editAddress, setEditAddress] = useState('');

  // Used to force a re-render when the TimeTracker updates local storage
  const [timeTick, setTimeTick] = useState(0);

  useEffect(() => {
    const handleTimeUpdate = () => setTimeTick(t => t + 1);
    const handleLocalTime = (e: Event) => {
      const customEvent = e as CustomEvent;
      const secondsToAdd = customEvent.detail.seconds;
      setActivityData(prev => {
        const today = new Date().toISOString().split('T')[0];
        const current = prev[today] || 0;
        return { ...prev, [today]: current + secondsToAdd };
      });
    };
    window.addEventListener('timeTrackerUpdated', handleTimeUpdate);
    window.addEventListener('localTimeIncrement', handleLocalTime);
    // Also trigger an initial tick to pick up SSR hydration differences
    setTimeTick(1);
    return () => {
      window.removeEventListener('timeTrackerUpdated', handleTimeUpdate);
      window.removeEventListener('localTimeIncrement', handleLocalTime);
    };
  }, []);
  const [editEmail, setEditEmail] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);
  
  // Avatar upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);

  // Settings dropdown state for contribution activity
  const [showSettings, setShowSettings] = useState(false);

  const [activityData, setActivityData] = useState<Record<string, number>>({});

  useEffect(() => {
    if (profileData?.username) {
      UserService.getUserActivity(profileData.username).then(data => {
        const dataMap: Record<string, number> = {};
        data.forEach((item: any) => {
          dataMap[item.date] = item.secondsSpent;
        });
        setActivityData(dataMap);
      }).catch(console.error);
    }
  }, [profileData?.username, timeTick]);
  const [showPrivateActivity, setShowPrivateActivity] = useState(true);
  const [activityVisibility, setActivityVisibility] = useState('Public');

  // Tooltip hover coordinates
  const [hoveredCell, setHoveredCell] = useState<{ count: number; dateStr: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await UserService.getMe();
        updateUser(data);
        setProfileData(data);
        
        // Pre-fill edit inputs
        setEditFirstName(data.firstName || '');
        setEditLastName(data.lastName || '');
        setEditUsername(data.username || '');
        setEditBio(data.bio || '');
        setEditLinkedinUrl(data.linkedinUrl || '');
        setEditGithubUrl(data.githubUrl || '');
        setEditMobileNumber(data.mobileNumber || '');
        setEditGender(data.gender || 'MALE');
        setEditAddress(data.address || '');
        setEditEmail(data.email || '');
      } catch (err) {
        console.error('Failed to load profile details from DB:', err);
        toast.error('Could not load profile information.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Handle populating fields and resetting validations when edit modal is opened
  useEffect(() => {
    if (isEditModalOpen && (profileData || user)) {
      const u = profileData || user;
      setEditFirstName(u.firstName || '');
      setEditLastName(u.lastName || '');
      setEditUsername(u.username || '');
      setEditBio(u.bio || '');
      setEditLinkedinUrl(u.linkedinUrl || '');
      setEditGithubUrl(u.githubUrl || '');
      setEditMobileNumber(u.mobileNumber || '');
      setEditGender(u.gender || 'MALE');
      setEditAddress(u.address || '');
      setEditEmail(u.email || '');
      setUsernameAvailable(null);
      setUsernameSuggestions([]);
    }
  }, [isEditModalOpen, profileData, user]);

  // Debounced effect to check username availability
  useEffect(() => {
    if (!isEditModalOpen) return;

    const currentUsername = profileData?.username || user?.username;
    if (!editUsername || editUsername === currentUsername) {
      setUsernameAvailable(null);
      setUsernameSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await UserService.checkUsername(editUsername);
        setUsernameAvailable(res.available);
        setUsernameSuggestions(res.suggestions || []);
      } catch (err) {
        console.error('Failed to check username availability:', err);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 450); // 450ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [editUsername, isEditModalOpen, profileData, user]);

  useEffect(() => {
    if (!isEditModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isEditModalOpen]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameAvailable === false) {
      toast.error('The selected username is already taken. Please choose another.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await UserService.updateProfile(
        editFirstName, 
        editLastName, 
        editBio, 
        editLinkedinUrl, 
        editUsername,
        editMobileNumber,
        editGender,
        editAddress,
        editGithubUrl
      );
      updateUser(updated);
      setProfileData(updated);
      setIsEditModalOpen(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error('Update failed:', err);
      toast.error(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image must be less than 5MB');
      return;
    }

    setCropSourceFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAvatarCropped = async (croppedFile: File) => {
    setCropSourceFile(null);
    setIsUploadingAvatar(true);
    try {
      const updatedUser = await UserService.uploadAvatar(croppedFile);
      updateUser(updatedUser);
      setProfileData(updatedUser);
      toast.success('Avatar uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsRemovingAvatar(true);
    try {
      const updatedUser = await UserService.removeAvatar();
      updateUser(updatedUser);
      setProfileData(updatedUser);
      toast.success('Avatar removed successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to remove image');
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  // Generate calendar year grid (Jan 1 to Dec 31 of current year, Sun=0 to Sat=6)
  const { contributionGrid, months, totalWeeks } = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const jan1 = new Date(currentYear, 0, 1);
    const jan1Day = jan1.getDay(); // 0 = Sun, ..., 6 = Sat
    
    // Start on Sunday of the week containing Jan 1
    const startDate = new Date(jan1);
    startDate.setDate(jan1.getDate() - jan1Day);

    const dec31 = new Date(currentYear, 11, 31);
    const dec31Day = dec31.getDay();
    const endDate = new Date(dec31);
    endDate.setDate(dec31.getDate() + (6 - dec31Day));

    const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const numWeeks = Math.ceil(totalDays / 7);

    const grid = [];
    const monthHeaders: { name: string; col: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < numWeeks; w++) {
      const week = [];
      for (let r = 0; r < 7; r++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + w * 7 + r);
        
        const m = currentDate.getMonth();
        if (m !== lastMonth && currentDate.getFullYear() === currentYear) {
          monthHeaders.push({
            name: currentDate.toLocaleDateString('en-US', { month: 'short' }),
            col: w
          });
          lastMonth = m;
        }

        const dateStr = currentDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        const targetDateISO = currentDate.toISOString().split('T')[0];
        
        let count = 0; // minutes
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
    return { contributionGrid: grid, months: monthHeaders, totalWeeks: numWeeks };
  }, [activityData]);

  const totalMinutesSpent = useMemo(() => {
    let total = 0;
    contributionGrid.forEach(week => {
      week.forEach(cell => {
        total += cell.count;
      });
    });
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

  const currentWeekDays = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    
    const sunDate = new Date(today);
    sunDate.setDate(today.getDate() - currentDayOfWeek);

    return dayNames.map((dayName, idx) => {
      const d = new Date(sunDate);
      d.setDate(sunDate.getDate() + idx);
      const isoDate = d.toISOString().split('T')[0];
      
      const seconds = activityData[isoDate] || 0;
      const isCompleted = seconds > 0 || (idx <= currentDayOfWeek && currentStreak > 0 && (currentDayOfWeek - idx) < currentStreak);
      const isToday = idx === currentDayOfWeek;
      const isFuture = idx > currentDayOfWeek;

      return {
        dayName,
        isoDate,
        isCompleted,
        isToday,
        isFuture
      };
    });
  }, [activityData, currentStreak]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-purple-600" size={36} />
        <p className="text-sm font-semibold text-slate-400">Fetching profile details from database...</p>
      </div>
    );
  }

  const currentUser = profileData || user;
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

  const username = currentUser.username || currentUser.email?.split('@')[0] || 'username';

  return (
    <>
      {/* Page Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-slate-50 via-[#f8fafc] to-slate-100 dark:from-[#090d16] dark:via-[#0f172a] dark:to-[#090d16]"></div>
      
      {/* Ambient background glow orbs */}
      <div className="fixed top-12 left-1/4 w-[500px] h-[500px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed top-96 right-1/4 w-[450px] h-[450px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[130px] pointer-events-none z-0" />

      <motion.div 
        className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-28 relative transition-colors z-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >



        {/* ── Main GitHub 2-Column Responsive Layout ── */}
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* ── LEFT SIDEBAR (GitHub Profile Column) ── */}
          <div className="w-full md:w-72 lg:w-80 shrink-0 space-y-5">

            <div className="relative flex w-48 h-48 sm:w-64 sm:h-64 shrink-0 group/avatar mx-auto md:mx-0">
              <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900 transition-transform hover:scale-[1.02]">
                {currentUser.avatarUrl ? (
                  <img src={getAvatarUrl(currentUser.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon size={110} className="text-purple-400 dark:text-purple-300" />
                )}

                {/* Camera Hover Overlay */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar || isRemovingAvatar}
                  className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload Avatar"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="animate-spin text-white mb-1" size={28} />
                  ) : (
                    <>
                      <Camera size={28} className="mb-1" />
                      <span className="text-xs font-semibold">Change avatar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Remove Avatar Button */}
              {currentUser.avatarUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={isRemovingAvatar || isUploadingAvatar}
                  className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-red-500 shadow-md opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove Avatar"
                >
                  {isRemovingAvatar ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              )}
            </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleAvatarSelect}
              />

            {/* User Full Name & Role */}
            <div className="text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                {currentUser.fullName || (currentUser.firstName + (currentUser.lastName ? ' ' + currentUser.lastName : '')) || 'User'}
                
                {/* Verification Tick */}
                {(() => {
                  const bioLower = (currentUser.bio || '').toLowerCase();
                  const isAdmin = 
                    currentUser.role === 'ADMIN' ||
                    currentUser.role === 'ROLE_ADMIN' ||
                    currentUser.role === 'PLATFORM_ADMIN' ||
                    currentUser.isAdmin === true ||
                    currentUser.platformRoles?.some((r: any) => ['ADMIN', 'ROLE_ADMIN', 'PLATFORM_ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMIN'].includes((r.code || r.name || '').toUpperCase())) ||
                    currentUser.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('ADMIN'));

                  const isCreator = 
                    currentUser.role === 'CREATOR' ||
                    currentUser.role === 'ROLE_CREATOR' ||
                    currentUser.role === 'INSTRUCTOR' ||
                    currentUser.isCreator === true ||
                    currentUser.platformRoles?.some((r: any) => ['CREATOR', 'INSTRUCTOR', 'TEACHER', 'AUTHOR'].includes((r.code || r.name || '').toUpperCase())) ||
                    currentUser.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('CREATOR')) ||
                    bioLower.includes('creator');

                  if (isAdmin) {
                    return (
                      <span title="Verified Admin" className="inline-flex items-center">
                        <BadgeCheck className="text-white fill-[#8b5cf6] dark:fill-[#8b5cf6] drop-shadow-[0_2px_6px_rgba(139,92,246,0.4)] shrink-0 ml-1 align-middle" size={24} strokeWidth={2.2} />
                      </span>
                    );
                  }

                  if (isCreator) {
                    return (
                      <span title="Verified Creator" className="inline-flex items-center">
                        <BadgeCheck className="text-white fill-[#1d9bf0] dark:fill-[#1d9bf0] drop-shadow-[0_2px_6px_rgba(29,155,240,0.4)] shrink-0 ml-1 align-middle" size={24} strokeWidth={2.2} />
                      </span>
                    );
                  }
                  return null;
                })()}
              </h1>

              <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                <span className="text-base font-normal text-slate-500 dark:text-slate-400">
                  @{username}
                </span>
                <span className="text-slate-400 font-medium">•</span>
                {(() => {
                  const bioLower = (currentUser.bio || '').toLowerCase();
                  const isAdmin = 
                    currentUser.role === 'ADMIN' ||
                    currentUser.role === 'ROLE_ADMIN' ||
                    currentUser.role === 'PLATFORM_ADMIN' ||
                    currentUser.isAdmin === true ||
                    currentUser.platformRoles?.some((r: any) => ['ADMIN', 'ROLE_ADMIN', 'PLATFORM_ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMIN'].includes((r.code || r.name || '').toUpperCase())) ||
                    currentUser.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('ADMIN'));

                  const isCreator = 
                    currentUser.role === 'CREATOR' ||
                    currentUser.role === 'ROLE_CREATOR' ||
                    currentUser.role === 'INSTRUCTOR' ||
                    currentUser.isCreator === true ||
                    currentUser.platformRoles?.some((r: any) => ['CREATOR', 'INSTRUCTOR', 'TEACHER', 'AUTHOR'].includes((r.code || r.name || '').toUpperCase())) ||
                    currentUser.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('CREATOR')) ||
                    bioLower.includes('creator');

                  if (isAdmin) {
                    return (
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Shield size={13} className="fill-rose-500/20 text-rose-600 dark:text-rose-400" /> Admin
                      </span>
                    );
                  }

                  if (isCreator) {
                    return (
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Sparkles size={13} className="fill-blue-500 text-blue-500" /> Creator
                      </span>
                    );
                  }

                  return (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Star size={13} className="fill-amber-500 text-amber-500" /> Learner
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Bio */}
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-center md:text-left">
              {currentUser.bio ? (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-1">
                  <Code size={14} className="text-purple-600 dark:text-purple-400 shrink-0 mr-1" />
                  {currentUser.bio.split('|').map((part: string, i: number, arr: string[]) => (
                    <span key={i} className="inline-flex items-center">
                      {part.trim()}
                      {i < arr.length - 1 && <span className="mx-1.5 text-slate-300 dark:text-slate-700">|</span>}
                    </span>
                  ))}
                </div>
              ) : (
                <p>Passionate learner exploring new skills and enhancing knowledge every day.</p>
              )}
            </div>

            {/* GitHub Details List */}
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium pt-1">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400 shrink-0" />
                <span>{currentUser.address || 'India'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400 shrink-0" />
                <span>Joined July 2026</span>
              </div>
              {currentUser.email && (
                <div className="flex items-center gap-2 truncate">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                </div>
              )}
              {currentUser.linkedinUrl && (
                <div className="flex items-center gap-2">
                  <FaLinkedin size={16} className="text-blue-600 shrink-0" />
                  <a href={currentUser.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-purple-600 dark:text-purple-400 truncate">
                    {currentUser.linkedinUrl.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {currentUser.githubUrl && (
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-slate-500 shrink-0" />
                  <a href={currentUser.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-purple-600 dark:text-purple-400 truncate">
                    {currentUser.githubUrl.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            {/* GitHub-style Full Width Edit Profile Button */}
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold px-4 py-2 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <Edit3 size={15} />
              <span>Edit profile</span>
            </button>

            {/* Sidebar Achievements Section */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Badges
                </h4>
                <button 
                  onClick={() => setShowAllBadges(!showAllBadges)}
                  className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer focus:outline-none transition-colors"
                >
                  <span>{showAllBadges ? 'Show less' : 'View all badges'}</span>
                  <ChevronRight size={12} className={`transition-transform ${showAllBadges ? 'rotate-90' : ''}`} />
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {(showAllBadges ? dynamicBadges : dynamicBadges.slice(0, 5)).map((badge) => (
                  <div 
                    key={badge.name} 
                    className="relative group cursor-pointer"
                  >
                    <div className="w-11 h-11 relative flex items-center justify-center group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                      <BadgeGraphic type={badge.type as string} />
                    </div>

                    {/* Hover Tooltip Box */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-60 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 translate-y-2 group-hover:translate-y-0">
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                        <div className="w-14 h-14 mb-2 drop-shadow-md">
                          <BadgeGraphic type={badge.type as string} />
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mb-1 leading-tight">{badge.courseName}</h4>
                        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-2.5">Achieved: {badge.achievedDate}</p>
                        <a 
                          href={badge.link} 
                          className="text-[11px] font-extrabold bg-purple-50 hover:bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 dark:text-purple-400 py-1.5 px-4 rounded-full transition-colors w-full shadow-xs text-center"
                        >
                          View Course
                        </a>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-800 rotate-45" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT MAIN CONTENT (GitHub Profile Cards Column) ── */}
          <div className="flex-1 min-w-0 w-full space-y-6">



            {/* 2. Learning Streak & GitHub Contribution Matrix */}
            <div className="py-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <Flame size={18} className="text-amber-500" />
                    <span>Learning Streak & Activity</span>
                  </h3>
                </div>
              </div>

              {/* Daily Streak Checks + Heatmap Grid */}
              <div className="flex flex-col lg:flex-row items-center gap-6 pt-1">
                {/* Heatmap Grid */}
                <div className="flex-grow w-full overflow-hidden">
                  <div className="flex gap-3 items-start">
                    <div className="hidden sm:grid grid-rows-7 gap-[2px] text-[9px] text-slate-400 font-bold select-none shrink-0 pt-4">
                      <div className="flex items-center h-[10px]">Sun</div>
                      <div className="h-[10px]" />
                      <div className="flex items-center h-[10px]">Wed</div>
                      <div className="h-[10px]" />
                      <div className="flex items-center h-[10px]">Fri</div>
                      <div className="h-[10px]" />
                    </div>

                    <div className="flex-grow overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1">
                      <div className="w-fit">
                        <div className="flex text-[9px] text-slate-400 font-bold mb-1.5 h-3.5 relative select-none">
                          {months.map((m, i) => (
                            <span 
                              key={`${m.name}-${m.col}-${i}`} 
                              className="absolute" 
                              style={{ left: `calc(${m.col} * (100% / ${totalWeeks || 53}))` }}
                            >
                              {m.name}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-flow-col grid-rows-7 gap-[2px]">
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
                                className={`w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-xs transition-all duration-150 cursor-pointer ${
                                  cell.level === 0 ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200' :
                                  cell.level === 1 ? 'bg-purple-200 dark:bg-purple-900/60 hover:scale-110' :
                                  cell.level === 2 ? 'bg-purple-400 dark:bg-purple-600 hover:scale-110' :
                                  'bg-purple-600 dark:bg-purple-500 hover:scale-110 shadow-2xs'
                                }`}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-3 text-xs text-slate-400 font-medium">
                    <span>Less</span>
                    <div className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-slate-800" />
                    <div className="w-2.5 h-2.5 rounded-xs bg-purple-200 dark:bg-purple-900/60" />
                    <div className="w-2.5 h-2.5 rounded-xs bg-purple-400 dark:bg-purple-600" />
                    <div className="w-2.5 h-2.5 rounded-xs bg-purple-600 dark:bg-purple-500" />
                    <span>More</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Achievements & Pinned Certificates Grid */}
            <MagicBento glowColor="147, 51, 234" enableSpotlight={true} enableBorderGlow={true}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full bento-section">

                {/* Achievements Card - Party Popper Confetti Blast + Magic Bento Border Glow */}
                <ParticleCard
                  glowColor="147, 51, 234"
                  enableTilt={false}
                  className="relative bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 p-6 shadow-xs flex flex-col justify-between asymmetric-leaf-card magic-bento-card magic-bento-card--border-glow"
                >
                  <PartyPopper className="w-full h-full">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                          <Star size={18} className="text-slate-900 dark:text-white shrink-0" />
                          <span className="text-slate-900 dark:text-white font-black">
                            Achievements
                          </span>
                        </h3>
                        <button 
                          onClick={() => setIsAchievementsModalOpen(true)}
                          className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer hover:underline transition-all relative z-20 shrink-0"
                        >
                          View all <span>-&gt;</span>
                        </button>
                      </div>

                      <AnimatedList
                        items={allAchievementsList.slice(0, 4)}
                        showGradients={false}
                        displayScrollbar={false}
                        staggerDelay={0.06}
                        renderItem={(ach, idx, isSelected) => {
                          const IconComponent = ach.icon;
                          return (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border transition-all ${isSelected ? 'border-purple-400 dark:border-purple-500 shadow-xs bg-purple-50/30 dark:bg-purple-950/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${ach.color}`}>
                                  <IconComponent size={16} />
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{ach.title}</h4>
                                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">{ach.desc}</p>
                                </div>
                              </div>
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0">{ach.date}</span>
                            </div>
                          );
                        }}
                      />
                    </div>
                  </PartyPopper>
                </ParticleCard>

                {/* Pinned Certificates Card - Party Popper Confetti Blast + Magic Bento Border Glow */}
                <ParticleCard
                  glowColor="147, 51, 234"
                  enableTilt={false}
                  className="relative bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 p-6 shadow-xs flex flex-col justify-between asymmetric-leaf-card magic-bento-card magic-bento-card--border-glow"
                >
                  <PartyPopper className="w-full h-full">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                          <Award size={18} className="text-slate-900 dark:text-white shrink-0" />
                          <span className="text-slate-900 dark:text-white font-black">
                            Pinned Certificates
                          </span>
                        </h3>
                        <button 
                          onClick={() => setIsCertificatesModalOpen(true)}
                          className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer hover:underline transition-all relative z-20 shrink-0"
                        >
                          View all <span>-&gt;</span>
                        </button>
                      </div>

                      {certificatesList.filter(c => c.isPinned).length > 0 ? (
                        <AnimatedList
                          items={certificatesList.filter(c => c.isPinned).slice(0, 4)}
                          showGradients={false}
                          displayScrollbar={false}
                          staggerDelay={0.06}
                          renderItem={(cert: any, idx: number, isSelected: boolean) => (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border transition-all ${isSelected ? 'border-purple-400 dark:border-purple-500 shadow-xs bg-purple-50/30 dark:bg-purple-950/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                                  <Award size={16} />
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{cert.name}</h4>
                                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">Issued by {cert.issuer}</p>
                                </div>
                              </div>
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0">{cert.date}</span>
                            </div>
                          )}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white mb-2 border border-slate-200 dark:border-slate-700">
                            <Award size={22} />
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-1">No pinned certificates yet.</h4>
                          <button 
                            onClick={() => setIsCertificatesModalOpen(true)}
                            className="text-xs font-bold text-slate-900 dark:text-white hover:underline mt-1 relative z-20"
                          >
                            Browse Certificates
                          </button>
                        </div>
                      )}
                    </div>
                  </PartyPopper>
                </ParticleCard>
              </div>
            </MagicBento>


          </div>
        </div>



      </motion.div>

      {/* Edit Profile Modal */}
      {portalReady && createPortal(
        <AnimatePresence>
          {isEditModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditModalOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />

              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-profile-title"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 flex max-h-[min(88vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-5">
                  <div className="min-w-0">
                    <h3 id="edit-profile-title" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                      Edit Profile Info
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Update your details, bio, and social connections.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">First name</label>
                        <input
                          type="text"
                          required
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Last name</label>
                        <input
                          type="text"
                          required
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Username</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                          className={`${
                            usernameAvailable === true
                              ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-600'
                              : usernameAvailable === false
                                ? 'border-rose-500 focus:border-rose-600 focus:ring-rose-600'
                                : 'border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:ring-purple-600'
                          } w-full rounded-xl border bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:ring-1`}
                        />
                        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                          {isCheckingUsername && <Loader2 className="animate-spin text-purple-600" size={14} />}
                          {usernameAvailable === true && (
                            <span className="rounded bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              Available
                            </span>
                          )}
                          {usernameAvailable === false && (
                            <span className="rounded bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              Taken
                            </span>
                          )}
                        </div>
                      </div>
                      {usernameAvailable === false && usernameSuggestions.length > 0 && (
                        <div className="mt-2 rounded-xl border border-rose-100 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/30 p-3 text-[12px]">
                          <p className="mb-1.5 font-bold text-rose-600 dark:text-rose-400">Username is taken. Try:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {usernameSuggestions.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setEditUsername(s)}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition hover:border-purple-600 hover:text-purple-600"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email</label>
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            <Lock size={9} /> Locked
                          </span>
                        </div>
                        <input type="email" disabled value={editEmail} className="w-full cursor-not-allowed select-none rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 px-3.5 py-2.5 text-sm font-medium text-slate-400 outline-none" />
                      </div>
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Gender</label>
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            <Lock size={9} /> Locked
                          </span>
                        </div>
                        <select disabled value={editGender} className="w-full cursor-not-allowed select-none rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 px-3.5 py-2.5 text-sm font-medium text-slate-400 outline-none appearance-none">
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">LinkedIn</label>
                        <input
                          type="url"
                          value={editLinkedinUrl}
                          onChange={(e) => setEditLinkedinUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">GitHub</label>
                        <input
                          type="url"
                          value={editGithubUrl}
                          onChange={(e) => setEditGithubUrl(e.target.value)}
                          placeholder="https://github.com/username"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Mobile</label>
                        <input
                          type="text"
                          required
                          value={editMobileNumber}
                          onChange={(e) => setEditMobileNumber(e.target.value)}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Address</label>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="City, State, Country"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Bio</label>
                      <p className="mb-1.5 text-[11px] text-slate-400">Use | to split lines</p>
                      <textarea
                        rows={3}
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || usernameAvailable === false}
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving && <Loader2 size={15} className="animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* All Achievements Modal */}
      {portalReady && createPortal(
        <AnimatePresence>
          {isAchievementsModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAchievementsModalOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />

              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="achievements-modal-title"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <PartyPopper className="flex max-h-[min(88vh,750px)] w-full flex-col overflow-hidden rounded-3xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
                  {/* Modal Header */}
                  <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-5">
                    <div>
                      <h3 id="achievements-modal-title" className="text-lg font-extrabold tracking-tight flex items-center gap-2">
                        <Star size={20} className="text-slate-900 dark:text-white" />
                        <span className="text-slate-900 dark:text-white font-black">
                          All Achievements & Milestones
                        </span>
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Explore all earned badges, skill milestones, and learning streaks.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAchievementsModalOpen(false)}
                      className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer relative z-20"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="relative w-full sm:w-64">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search achievements..."
                        value={achievementSearch}
                        onChange={(e) => setAchievementSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white focus:ring-1 focus:ring-slate-900 dark:focus:ring-white relative z-20"
                      />
                    </div>
                    <div className="flex items-center gap-1 w-full sm:w-auto">
                      {(['all', 'unlocked', 'in_progress'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setAchievementFilter(tab)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer relative z-20 ${
                            achievementFilter === tab
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {tab === 'all' ? 'All' : tab === 'unlocked' ? 'Unlocked' : 'In Progress'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Achievement Items List */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    <AnimatedList
                      items={allAchievementsList
                        .filter(ach => {
                          if (achievementFilter === 'unlocked') return ach.unlocked;
                          if (achievementFilter === 'in_progress') return !ach.unlocked;
                          return true;
                        })
                        .filter(ach => {
                          if (!achievementSearch) return true;
                          return ach.title.toLowerCase().includes(achievementSearch.toLowerCase()) ||
                                 ach.desc.toLowerCase().includes(achievementSearch.toLowerCase());
                        })}
                      showGradients={false}
                      displayScrollbar={false}
                      staggerDelay={0.04}
                      renderItem={(ach, idx, isSelected) => {
                        const IconComponent = ach.icon;
                        return (
                          <div key={ach.id} className={`flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border transition-all ${isSelected ? 'border-purple-400 dark:border-purple-500 shadow-xs bg-purple-50/30 dark:bg-purple-950/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${ach.color}`}>
                                <IconComponent size={22} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">{ach.title}</h4>
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                    ach.unlocked
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                  }`}>
                                    {ach.unlocked ? 'Unlocked' : `${ach.progress}%`}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{ach.desc}</p>
                                {!ach.unlocked && (
                                  <div className="w-36 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-slate-900 dark:bg-white rounded-full" style={{ width: `${ach.progress}%` }} />
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400 shrink-0">{ach.date}</span>
                          </div>
                        );
                      }}
                    />
                  </div>
                </PartyPopper>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* All Certificates Modal */}
      {portalReady && createPortal(
        <AnimatePresence>
          {isCertificatesModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCertificatesModalOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />

              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="certificates-modal-title"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <PartyPopper className="flex max-h-[min(88vh,750px)] w-full flex-col overflow-hidden rounded-3xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
                  {/* Modal Header */}
                  <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-5">
                    <div>
                      <h3 id="certificates-modal-title" className="text-lg font-extrabold tracking-tight flex items-center gap-2">
                        <Award size={20} className="text-slate-900 dark:text-white" />
                        <span className="text-slate-900 dark:text-white font-black">
                          All Earned Certificates
                        </span>
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Manage pinned certificates on your profile (Max 4 pinned).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCertificatesModalOpen(false)}
                      className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer relative z-20"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="relative w-full">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search certificates..."
                        value={certificateSearch}
                        onChange={(e) => setCertificateSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white focus:ring-1 focus:ring-slate-900 dark:focus:ring-white relative z-20"
                      />
                    </div>
                  </div>

                  {/* Certificates List */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    <AnimatedList
                      items={certificatesList
                        .filter(cert => {
                          if (!certificateSearch) return true;
                          return cert.name.toLowerCase().includes(certificateSearch.toLowerCase()) ||
                                 cert.issuer.toLowerCase().includes(certificateSearch.toLowerCase()) ||
                                 cert.credentialId.toLowerCase().includes(certificateSearch.toLowerCase());
                        })}
                      showGradients={false}
                      displayScrollbar={false}
                      staggerDelay={0.04}
                      renderItem={(cert, idx, isSelected) => (
                        <div key={cert.id} className={`flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border transition-all ${isSelected ? 'border-purple-400 dark:border-purple-500 shadow-xs bg-purple-50/30 dark:bg-purple-950/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                              <Award size={22} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white">{cert.name}</h4>
                                <span className="text-[10px] font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                                  {cert.credentialId}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                Issued by {cert.issuer} • Grade: <span className="font-semibold text-slate-600 dark:text-slate-300">{cert.grade}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">{cert.date}</span>
                            <button
                              onClick={() => togglePinCertificate(cert.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative z-20 ${
                                cert.isPinned
                                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              <Pin size={13} className={cert.isPinned ? 'fill-white dark:fill-slate-900' : ''} />
                              <span>{cert.isPinned ? 'Pinned' : 'Pin'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </PartyPopper>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Hover Tooltip for Contribution Heatmap Cells */}
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
      <ImageCropModal
        open={cropSourceFile !== null}
        file={cropSourceFile}
        aspectRatio={1}
        title="Crop Profile Avatar"
        onCancel={() => setCropSourceFile(null)}
        onCropped={handleAvatarCropped}
      />
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-purple-600" /></div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
