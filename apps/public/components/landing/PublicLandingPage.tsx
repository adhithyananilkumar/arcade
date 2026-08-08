import type { Metadata } from "next";
import HeroSection from "@/apps/public/components/landing/HeroSection";
import LogoStrip from "@/apps/public/components/landing/LogoStrip";
import CourseShowcase from "@/apps/public/components/landing/CourseShowcase";
import Testimonials from "@/apps/public/components/landing/Testimonials";
import JourneyTimeline from "@/apps/public/components/landing/JourneyTimeline";
import { TabbedShowcase } from "@/apps/public/components/landing/TabbedShowcase";
import { BookOpen, MonitorPlay, MessageSquare, Award, Trophy, Video } from "lucide-react";
import "@/apps/public/landing.css";

export const metadata: Metadata = {
  title: "Arcade — Built to level you up",
  description:
    "Arcade is the online learning platform for Amal Jyothi College — courses, workshops, forums & certificates, all in one place.",
  openGraph: {
    title: "Arcade — Built to level you up",
    description:
      "Courses, workshops, forums & certificates built for Amal Jyothi College.",
    type: "website",
  },
};

const arcadeFeatures = [
  {
    color: '#FDF2D0', // Cream Yellow
    title: 'Universities & colleges',
    description: 'Accredited-quality academic pathways and departments. Empower your faculty with our advanced publishing tools to build state-of-the-art digital curricula.',
    label: 'Higher Ed',
    icon: BookOpen,
    bgSvg: (
      <svg className="absolute inset-0 w-full h-full text-slate-900 opacity-[0.05]">
        <pattern id="sketch-1" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
          <path d="M0,10 Q10,12 20,8 T40,10 M0,20 Q10,18 20,22 T40,20 M0,30 Q10,32 20,28 T40,30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#sketch-1)" />
      </svg>
    )
  },
  {
    color: '#2451D6', // Arcade Blue
    title: 'Companies & enterprises',
    description: 'Professional internal onboarding and skill tracks at scale. Provide your employees with unified tools, real-time analytics, and customized sandboxes to accelerate technical proficiency.',
    label: 'Enterprise',
    icon: MonitorPlay,
    bgSvg: (
      <svg className="absolute inset-0 w-full h-full text-white opacity-[0.08]">
        <pattern id="sketch-2" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0,10 Q10,12 20,8 T40,10 M0,20 Q10,18 20,22 T40,20 M0,30 Q10,32 20,28 T40,30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#sketch-2)" />
      </svg>
    )
  },
  {
    color: '#E2F1E8', // Soft Mint
    title: 'Freelancers & experts',
    description: 'Monetize domain expertise and build personal brand value. Create self-paced learning resources, publish interactive guides, and grow your unique audience.',
    label: 'Professionals',
    icon: MessageSquare,
    bgSvg: (
      <svg className="absolute inset-0 w-full h-full text-slate-900 opacity-[0.05]">
        <pattern id="sketch-3" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
          <path d="M0,10 Q10,12 20,8 T40,10 M0,20 Q10,18 20,22 T40,20 M0,30 Q10,32 20,28 T40,30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#sketch-3)" />
      </svg>
    )
  },
  {
    color: '#EBEAFA', // Soft Lavender
    title: 'Training institutes',
    description: 'Structured cohorts and certified bootcamp programs. Manage student cohorts, grade assignments, and issue verifiable credentials seamlessly.',
    label: 'Institutes',
    icon: Award,
    bgSvg: (
      <svg className="absolute inset-0 w-full h-full text-white opacity-[0.05]">
        <pattern id="sketch-4" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <path d="M0,10 Q10,12 20,8 T40,10 M0,20 Q10,18 20,22 T40,20 M0,30 Q10,32 20,28 T40,30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#sketch-4)" />
      </svg>
    )
  },
  {
    color: '#FDE2E4', // Soft Pink
    title: 'Nonprofits & communities',
    description: 'Mission-driven open education and public impact tracks. Build robust, accessible learning resources to democratize education for a global audience.',
    label: 'Nonprofits',
    icon: Trophy,
    bgSvg: (
      <svg className="absolute inset-0 w-full h-full text-slate-900 opacity-[0.05]">
        <pattern id="sketch-5" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(75)">
          <path d="M0,10 Q10,12 20,8 T40,10 M0,20 Q10,18 20,22 T40,20 M0,30 Q10,32 20,28 T40,30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#sketch-5)" />
      </svg>
    )
  },
  {
    color: '#E3F2FD', // Soft Blue
    title: 'Independent creators',
    description: 'Publish self-paced learning paths on your own terms. Leverage standard-setting publishing tools to deliver world-class educational content.',
    label: 'Creators',
    icon: Video,
    bgSvg: (
      <svg className="absolute inset-0 w-full h-full text-slate-900 opacity-[0.05]">
        <pattern id="sketch-6" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(-75)">
          <path d="M0,10 Q10,12 20,8 T40,10 M0,20 Q10,18 20,22 T40,20 M0,30 Q10,32 20,28 T40,30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#sketch-6)" />
      </svg>
    )
  }
];

export default function PublicLandingPage() {
  return (
    <div className="landing-root">
      <HeroSection />
      <LogoStrip />
      <CourseShowcase />
      
      {/* Bento Grid Section */}
      <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto w-full flex flex-col items-center">
        <div className="mb-16 text-center">
          <div className="text-xs font-bold text-indigo-500 tracking-[0.2em] uppercase mb-4 flex items-center justify-center gap-4">
            <span className="w-6 h-[1px] bg-indigo-300"></span>
            Built for every educator
            <span className="w-6 h-[1px] bg-indigo-300"></span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            A professional platform, whoever<br className="hidden md:block" /> you are
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Arcade powers educational creators with standard-setting publishing tools, sandboxes, and analytics.
          </p>
        </div>
        <div className="w-full">
          <TabbedShowcase features={arcadeFeatures} />
        </div>
      </section>

      <Testimonials />
      <JourneyTimeline />
    </div>
  );
}

