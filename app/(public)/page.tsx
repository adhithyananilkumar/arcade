import type { Metadata } from "next";
import HeroNav from "@/components/landing/HeroNav";
import HeroSection from "@/components/landing/HeroSection";
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
      <HeroNav />
      <HeroSection />
    </div>
  );
}
