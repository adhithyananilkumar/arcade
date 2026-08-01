import type { Metadata } from "next";
import HeroSection from "@/apps/public/components/landing/HeroSection";
import LogoStrip from "@/apps/public/components/landing/LogoStrip";
import CourseShowcase from "@/apps/public/components/landing/CourseShowcase";
import Testimonials from "@/apps/public/components/landing/Testimonials";
import JourneyTimeline from "@/apps/public/components/landing/JourneyTimeline";
import MagicBento from "@/apps/public/components/landing/MagicBento";
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
    color: '#ffffff',
    title: 'Interactive Courses',
    description: 'Learn through hands-on, high-quality technical content built by experts.',
    label: 'Learn',
    icon: BookOpen
  },
  {
    color: '#2451D6', // Arcade Blue
    title: 'Live Workshops',
    description: 'Join real-time sessions and build projects alongside the community.',
    label: 'Build',
    icon: MonitorPlay
  },
  {
    color: '#ffffff',
    title: 'Student Forums',
    description: 'Ask questions, share knowledge, and collaborate with peers.',
    label: 'Connect',
    icon: MessageSquare
  },
  {
    color: '#12141C', // Dark Slate
    title: 'Verified Certificates',
    description: 'Earn verifiable credentials to showcase your new skills.',
    label: 'Achieve',
    icon: Award
  },
  {
    color: '#ffffff',
    title: 'Hackathons & Competitions',
    description: 'Test your abilities in live coding challenges and campus-wide hackathons.',
    label: 'Compete',
    icon: Trophy
  },
  {
    color: '#ffffff',
    title: 'Webinars & Articles',
    description: 'Deep dive into specialized topics with industry experts and written tutorials.',
    label: 'Explore',
    icon: Video
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
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Everything you need to level up.
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Master new skills, build real projects, and connect with other builders using our unified platform tools.
          </p>
        </div>
        <div className="w-full">
          <MagicBento cardData={arcadeFeatures} glowColor="36, 81, 214" particleCount={15} />
        </div>
      </section>

      <Testimonials />
      <JourneyTimeline />
    </div>
  );
}

