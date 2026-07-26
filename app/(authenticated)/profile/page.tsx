'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from "@/domains/identity";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, MapPin, Link as LinkIcon, Mail, Calendar, Edit3, 
  ChevronRight, Code, GitPullRequest, Star, BookOpen, GitCommit, 
  MessageSquare, Flame, Trophy, Check, GraduationCap, Award, Compass,
  Loader2, X, Camera, Phone, Settings, Globe, CheckSquare, Activity,
  BadgeCheck, Lock
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

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

function ProfilePageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Badge visibility toggle
  const [showAllBadges, setShowAllBadges] = useState(false);
  
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
  
  // Avatar upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

    setIsUploadingAvatar(true);
    try {
      const updatedUser = await UserService.uploadAvatar(file);
      updateUser(updatedUser);
      setProfileData(updatedUser);
      toast.success('Avatar uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Generate 53x7 grid with real date calculation and random counts
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
        
        let count = 0; // minutes
        if (activityData[targetDateISO]) {
          count = Math.floor(activityData[targetDateISO] / 60);
        }

        let level = 0;
        if (count < 15) level = 0; // Blank
        else if (count < 30) level = 1; // Light Blue
        else if (count < 45) level = 2; // Little Dark Blue
        else level = 3; // Dark Blue

        week.push({ dateStr, count, level });
      }
      grid.push(week);
    }
    return grid;
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
        if (i === 0) continue; // If today is 0, don't break the streak just yet
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
      {/* Global Background (Pure White / Dark) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-white dark:bg-[#020617]"></div>
      <motion.div 
        className="mx-auto max-w-6xl w-full space-y-6 pb-16 px-4 sm:px-6 relative transition-colors z-10 pt-28 md:pt-32"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >

      {/* ── Main Profile Header Card ── */}
      <div className="relative px-6 py-6 transition-colors mb-8">
        
        {/* Edit Profile Button - Moved to Top Right Corner */}
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-6 right-6 z-30 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-purple-600 bg-white/70 hover:bg-white shadow-sm border border-white dark:bg-neutral-900/50 dark:text-purple-400 dark:border-neutral-800 dark:hover:bg-neutral-900 transition-all duration-200 cursor-pointer backdrop-blur-sm"
        >
          <Edit3 size={14} />
          Edit Profile
        </button>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 w-full">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full md:w-auto">
            {/* Avatar Container */}
            <div className="relative flex h-[120px] w-[120px] shrink-0">
              <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-black p-1 shadow-sm border border-slate-100 dark:border-neutral-800 transition-colors">
                <div className="flex h-full w-full items-center justify-center rounded-full overflow-hidden bg-slate-50 dark:bg-neutral-900 relative group transition-colors">
                  {currentUser.avatarUrl ? (
                    <img src={getAvatarUrl(currentUser.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon size={52} className="text-purple-400" />
                  )}

                  {/* Camera Hover Overlay */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 bg-black/45 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Upload Avatar"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="animate-spin text-white" size={24} />
                    ) : (
                      <Camera size={24} />
                    )}
                  </button>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleAvatarSelect}
              />
            </div>

            {/* Details / Bio */}
            <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left pt-5 w-full relative">
              <div className="flex items-center gap-3">
                <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#111827] dark:text-white tracking-tight leading-none transition-colors flex items-center gap-2">
                  {currentUser.fullName || (currentUser.firstName + (currentUser.lastName ? ' ' + currentUser.lastName : '')) || 'User'}
                  
                  {/* Verification Tick */}
                  {(() => {
                    const bioLower = (currentUser.bio || '').toLowerCase();
                    const isCreator = currentUser.platformRoles?.some((r: any) => r.code === 'CREATOR') || bioLower.includes('creator');
                    const isDeveloper = currentUser.platformRoles?.some((r: any) => r.code === 'DEVELOPER') || bioLower.includes('developer');
                    
                    if (isCreator || isDeveloper) {
                      return <BadgeCheck className="text-white fill-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] shrink-0 ml-1.5" size={26} strokeWidth={2.5} />;
                    }
                    return null;
                  })()}
                </h1>
              </div>
              
              <p className="text-[14px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 mt-2 transition-colors">
                @{username}
              </p>

              {/* Bio */}
              {currentUser.bio && (
                <div className="mt-5 flex items-start gap-1.5 text-[#4b5563] dark:text-neutral-400 text-[13px] font-bold leading-relaxed w-full transition-colors">
                  <Code size={15} className="text-purple-600 shrink-0 mt-[1px]" />
                  <div className="flex flex-wrap items-center md:items-start">
                    {currentUser.bio.split('|').map((part: string, i: number, arr: string[]) => (
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
                  <span className="truncate">{currentUser.address || 'India'}</span>
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
          
          {/* Interactive Contribution Settings Dropdown (re-styled as Last 1 Year) */}
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              <span>Last 1 Year</span>
              <ChevronRight size={12} className={`transition-transform duration-200 ${showSettings ? 'rotate-90' : 'rotate-90'}`} />
            </button>
            
            <AnimatePresence>
              {showSettings && (
                <>
                  {/* Backdrop Clicker */}
                  <div className="fixed inset-0 z-30" onClick={() => setShowSettings(false)}></div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-xl z-40 text-xs font-semibold text-slate-600"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Visibility
                    </div>
                    <button 
                      onClick={() => { setActivityVisibility('Public'); setShowSettings(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-left cursor-pointer"
                    >
                      <span>Public activity only</span>
                      {activityVisibility === 'Public' && <Check size={14} className="text-purple-600" />}
                    </button>
                    <button 
                      onClick={() => { setActivityVisibility('Private'); setShowSettings(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-left cursor-pointer"
                    >
                      <span>Include private activity</span>
                      {activityVisibility === 'Private' && <Check size={14} className="text-purple-600" />}
                    </button>
                    
                    <div className="h-px bg-slate-100 my-1.5"></div>
                    
                    <button 
                      onClick={() => setShowPrivateActivity(!showPrivateActivity)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-left cursor-pointer"
                    >
                      <span>Show private counts</span>
                      {showPrivateActivity && <Check size={14} className="text-purple-600" />}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
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
            <Award size={18} className="text-amber-500" />
            Pinned Certificates
          </h3>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-50 dark:bg-neutral-800 px-2.5 py-1 rounded-md">
            Max 10
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentUser.certificates && currentUser.certificates.length > 0 ? (
            currentUser.certificates.slice(0, 10).map((cert: any, idx: number) => (
              <div key={idx} className="group flex items-center justify-between p-4 rounded-[20px] border border-slate-100 dark:border-neutral-900 bg-white dark:bg-black shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 text-amber-500 dark:text-amber-400 transition-colors group-hover:scale-105 duration-300">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-extrabold text-slate-800 dark:text-white tracking-tight leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{cert.name}</h4>
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

      {/* ── Edit Profile Modal (Enhanced Premium Design) ── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Glass Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            {/* Modal Body Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-xl rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(124,58,237,0.15)] z-10 flex flex-col max-h-[88vh] overflow-hidden transition-colors"
            >
              {/* Top Gradient Accent Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-7 py-5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/40 shadow-xs">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Edit Profile Info</h3>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Update your personal details, credentials, and social profiles</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-600 dark:hover:text-white transition-all cursor-pointer focus:outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleEditSubmit} className="flex flex-col flex-grow overflow-hidden">
                <div className="flex-grow overflow-y-auto px-7 py-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <UserIcon size={12} className="text-purple-500" />
                        First Name
                      </label>
                      <input 
                        type="text" 
                        required
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all shadow-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <UserIcon size={12} className="text-purple-500" />
                        Last Name
                      </label>
                      <input 
                        type="text" 
                        required
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Username Field with Validation & Suggestions */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code size={12} className="text-purple-500" />
                      Username
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                        className={`w-full rounded-2xl border bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 transition-all shadow-xs ${
                          usernameAvailable === true ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/10' :
                          usernameAvailable === false ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' :
                          'border-slate-200 dark:border-slate-800 focus:border-purple-500 focus:ring-purple-500/10'
                        }`}
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {isCheckingUsername && <Loader2 className="animate-spin text-purple-500" size={14} />}
                        {usernameAvailable === true && <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">Available</span>}
                        {usernameAvailable === false && <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">Taken</span>}
                      </div>
                    </div>
                    {usernameAvailable === false && usernameSuggestions.length > 0 && (
                      <div className="bg-rose-50/70 dark:bg-rose-950/30 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-[11px] space-y-1.5 mt-2">
                        <span className="font-bold text-rose-700 dark:text-rose-400">Username is taken. Try one of these:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {usernameSuggestions.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setEditUsername(s)}
                              className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 hover:border-purple-400 text-slate-700 dark:text-slate-300 font-extrabold px-2.5 py-1 rounded-xl active:scale-95 transition-all cursor-pointer shadow-xs"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Locked Email & Locked Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Mail size={12} className="text-purple-500" />
                          Email Address
                        </label>
                        <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-800">
                          <Lock size={9} /> Locked
                        </span>
                      </div>
                      <input 
                        type="email" 
                        disabled
                        value={editEmail}
                        className="w-full rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-100/70 dark:bg-slate-900/40 px-4 py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed select-none focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <UserIcon size={12} className="text-purple-500" />
                          Gender
                        </label>
                        <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-800">
                          <Lock size={9} /> Locked
                        </span>
                      </div>
                      <select 
                        disabled
                        value={editGender}
                        className="w-full appearance-none rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-100/70 dark:bg-slate-900/40 px-4 py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed select-none focus:outline-none transition-all"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FaLinkedin size={12} className="text-blue-600" />
                        LinkedIn Profile Link
                      </label>
                      <input 
                        type="url" 
                        value={editLinkedinUrl}
                        onChange={(e) => setEditLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all shadow-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <GitCommit size={12} className="text-slate-700 dark:text-slate-300" />
                        GitHub Profile Link
                      </label>
                      <input 
                        type="url" 
                        value={editGithubUrl}
                        onChange={(e) => setEditGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Mobile & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone size={12} className="text-purple-500" />
                        Mobile Number
                      </label>
                      <input 
                        type="text" 
                        required
                        value={editMobileNumber}
                        onChange={(e) => setEditMobileNumber(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all shadow-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={12} className="text-purple-500" />
                        Address
                      </label>
                      <input 
                        type="text" 
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="House, Street, City, State, Country"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Edit3 size={12} className="text-purple-500" />
                      Bio (Split using &apos;|&apos; for multiple lines)
                    </label>
                    <textarea 
                      rows={3}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-purple-500/10 focus:outline-none resize-none transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 px-7 py-4 flex items-center justify-end gap-3 transition-colors">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving || usernameAvailable === false}
                    className="px-6 py-2.5 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all shadow-md shadow-purple-500/20 active:scale-[0.98] flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving && <Loader2 size={16} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
