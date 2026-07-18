import type { Metadata } from "next";
import HeroSection from "@/components/landing/HeroSection";
import LogoStrip from "@/components/landing/LogoStrip";
import CourseShowcase from "@/components/landing/CourseShowcase";
import Testimonials from "@/components/landing/Testimonials";
import JourneyTimeline from "@/components/landing/JourneyTimeline";
import "@/styles/landing.css";

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

export default function Home() {
  return (
    <div className="landing-root">
      <HeroSection />
      <LogoStrip />
      <CourseShowcase />
      <Testimonials />
      <JourneyTimeline />
    </div>
  );
}

