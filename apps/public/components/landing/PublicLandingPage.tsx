import type { Metadata } from "next";
import HeroSection from "@/apps/public/components/landing/HeroSection";
import LogoStrip from "@/apps/public/components/landing/LogoStrip";
import InteractiveCardFan from "@/apps/public/components/landing/InteractiveCardFan";
import CourseShowcase from "@/apps/public/components/landing/CourseShowcase";
import Testimonials from "@/apps/public/components/landing/Testimonials";
import JourneyTimeline from "@/apps/public/components/landing/JourneyTimeline";
import Footer from "@/apps/public/components/landing/Footer";
import GlobalBackground from "@/apps/public/components/landing/GlobalBackground";
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
      <GlobalBackground />
      <HeroSection />
      <LogoStrip />
      <InteractiveCardFan />
      <CourseShowcase />
      <Testimonials />
      <JourneyTimeline />
      <Footer />
    </div>
  );
}


