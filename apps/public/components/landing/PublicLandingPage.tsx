import type { Metadata } from "next";
import HeroSection from "@/apps/public/components/landing/HeroSection";
import LogoStrip from "@/apps/public/components/landing/LogoStrip";
import CourseShowcase from "@/apps/public/components/landing/CourseShowcase";
import MagicBento from "@/apps/public/components/landing/MagicBento";
import Testimonials from "@/apps/public/components/landing/Testimonials";
import JourneyTimeline from "@/apps/public/components/landing/JourneyTimeline";
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

export default function PublicLandingPage() {
  return (
    <div className="landing-root">
      <HeroSection />
      <LogoStrip />
      <CourseShowcase />
      <div className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-6">Level up your learning</h2>
          <p className="text-xl text-zinc-600">The Arcade ecosystem brings everything together.</p>
        </div>
        <MagicBento enableTilt={true} enableMagnetism={true} clickEffect={true} enableStars={true} />
      </div>
      <Testimonials />
      <JourneyTimeline />
    </div>
  );
}

