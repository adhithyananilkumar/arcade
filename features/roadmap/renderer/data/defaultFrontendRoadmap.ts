import {
  Globe,
  Code2,
  Palette,
  Terminal,
  GitBranch,
  Atom,
  Briefcase,
  Boxes,
  Users,
  Rocket,
  LucideIcon,
} from 'lucide-react';

export type StageLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface StageData {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  level: StageLevel;
  duration: string;
  theme: string;
  color: string;
  lightBg: string;
  borderColor: string;
  icon: LucideIcon;
  badgeLabel?: string;
  checklist: string[];
}

export const DEFAULT_FRONTEND_STAGES: StageData[] = [
  {
    id: 'node-internet',
    number: '1',
    title: 'Internet & Web Basics',
    subtitle: 'How the web works, DNS, browsers, and deployment.',
    level: 'Beginner',
    duration: '1 – 2 weeks',
    theme: 'theme-blue',
    color: '#2563EB',
    lightBg: '#EFF6FF',
    borderColor: '#BFDBFE',
    icon: Globe,
    checklist: [
      'How the web works (HTTP/HTTPS)',
      'DNS & domains',
      'Browsers & developer tools',
      'Hosting & deployment basics',
    ],
  },
  {
    id: 'node-html',
    number: '2',
    title: 'HTML',
    subtitle: 'Semantic structure, accessible forms, and SEO fundamentals.',
    level: 'Beginner',
    duration: '1 – 2 weeks',
    theme: 'theme-lavender',
    color: '#7C3AED',
    lightBg: '#F5F3FF',
    borderColor: '#DDD6FE',
    icon: Code2,
    badgeLabel: '5',
    checklist: [
      'Semantic HTML',
      'Forms & validation',
      'Accessibility (a11y)',
      'SEO basics',
    ],
  },
  {
    id: 'node-css',
    number: '3',
    title: 'CSS',
    subtitle: 'Selectors, box model, Flexbox, Grid, and micro-animations.',
    level: 'Beginner',
    duration: '2 – 3 weeks',
    theme: 'theme-mint',
    color: '#059669',
    lightBg: '#ECFDF5',
    borderColor: '#A7F3D0',
    icon: Palette,
    badgeLabel: '3',
    checklist: [
      'Selectors & cascade',
      'Box model',
      'Flexbox & Grid',
      'Responsive design',
      'Animations & transitions',
    ],
  },
  {
    id: 'node-javascript',
    number: '4',
    title: 'JavaScript',
    subtitle: 'Core programming syntax, DOM manipulation, and ES6+ standards.',
    level: 'Intermediate',
    duration: '3 – 4 weeks',
    theme: 'theme-peach',
    color: '#D97706',
    lightBg: '#FFFBEB',
    borderColor: '#FED7AA',
    icon: Terminal,
    badgeLabel: 'JS',
    checklist: [
      'Variables & data types',
      'Functions',
      'Arrays & objects',
      'DOM manipulation',
      'Events',
      'ES6+ features',
    ],
  },
  {
    id: 'node-git',
    number: '5',
    title: 'Git & GitHub',
    subtitle: 'Version control workflows, branches, commits, and pull requests.',
    level: 'Intermediate',
    duration: '1 – 2 weeks',
    theme: 'theme-sky',
    color: '#0284C7',
    lightBg: '#F0F9FF',
    borderColor: '#BAE6FD',
    icon: GitBranch,
    checklist: [
      'Git basics',
      'Branches & commits',
      'Pull requests',
      'GitHub workflow',
    ],
  },
  {
    id: 'node-frameworks',
    number: '6',
    title: 'JavaScript Frameworks',
    subtitle: 'Modern React components, state, hooks, routing, and bundlers.',
    level: 'Intermediate',
    duration: '3 – 5 weeks',
    theme: 'theme-violet',
    color: '#7C3AED',
    lightBg: '#F5F3FF',
    borderColor: '#DDD6FE',
    icon: Atom,
    checklist: [
      'React fundamentals',
      'Components & props',
      'State management',
      'Routing',
      'Hooks',
      'Build & deploy (Vite / CRA)',
    ],
  },
  {
    id: 'node-advanced',
    number: '7',
    title: 'Advanced Topics',
    subtitle: 'TypeScript, automated testing, performance, and state systems.',
    level: 'Advanced',
    duration: '2 – 3 weeks',
    theme: 'theme-teal',
    color: '#0D9488',
    lightBg: '#F0FDFA',
    borderColor: '#99F6E4',
    icon: Briefcase,
    checklist: [
      'TypeScript (optional)',
      'Testing (Jest / React Testing Library)',
      'Performance optimization',
      'PWA',
      'Accessibility (advanced)',
      'State management (Redux/Zustand)',
    ],
  },
  {
    id: 'node-projects',
    number: '8',
    title: 'Build Projects',
    subtitle: 'Clone production apps, craft your portfolio, and polish UI/UX.',
    level: 'Advanced',
    duration: '3 – 6 weeks',
    theme: 'theme-rose',
    color: '#E11D48',
    lightBg: '#FFF1F2',
    borderColor: '#FECDD3',
    icon: Boxes,
    checklist: [
      'Clone real-world projects',
      'Build your own portfolio',
      'Use Git & GitHub',
      'Fix bugs and improve UI/UX',
    ],
  },
  {
    id: 'node-jobs',
    number: '9',
    title: 'Prepare for Jobs',
    subtitle: 'Interview DSA, basic system design, LinkedIn, and mock sessions.',
    level: 'Advanced',
    duration: '2 – 4 weeks',
    theme: 'theme-indigo',
    color: '#4F46E5',
    lightBg: '#EEF2FF',
    borderColor: '#C7D2FE',
    icon: Users,
    checklist: [
      'DSA (basic for interviews)',
      'System design (basic)',
      'Resume & LinkedIn',
      'Mock interviews',
    ],
  },
  {
    id: 'node-grow',
    number: '10',
    title: 'Get Hired & Grow',
    subtitle: 'Apply for roles, build open source credibility, and keep shipping.',
    level: 'Advanced',
    duration: 'Ongoing',
    theme: 'theme-emerald',
    color: '#10B981',
    lightBg: '#ECFDF5',
    borderColor: '#A7F3D0',
    icon: Rocket,
    checklist: [
      'Apply to internships / jobs',
      'Build a strong GitHub profile',
      'Keep learning',
      'Contribute to open source',
    ],
  },
];

export interface ResourceLink {
  title: string;
  description: string;
  url: string;
}

export const ADDITIONAL_RESOURCES: ResourceLink[] = [
  {
    title: 'roadmap.sh',
    description: 'Frontend Developer Roadmap',
    url: 'https://roadmap.sh/frontend',
  },
  {
    title: 'MDN Web Docs',
    description: 'https://developer.mozilla.org',
    url: 'https://developer.mozilla.org',
  },
  {
    title: 'freeCodeCamp',
    description: 'https://www.freecodecamp.org',
    url: 'https://www.freecodecamp.org',
  },
  {
    title: 'Frontend Mentor',
    description: 'https://www.frontendmentor.io',
    url: 'https://www.frontendmentor.io',
  },
  {
    title: 'YouTube',
    description: 'Traversy Media / CodeWithMosh / Web Dev Simplified',
    url: 'https://www.youtube.com',
  },
];

export const ROADMAP_GOAL = {
  title: 'Your Goal',
  quote: 'Build beautiful, fast and accessible web experiences that make an impact.',
  encouragement: 'Keep going!',
};
