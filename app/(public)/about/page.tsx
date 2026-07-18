import type { Metadata } from "next";
import AboutPageMotion from "@/components/about/AboutPageMotion";
import AboutHero from "@/components/about/AboutHero";
import MissionSection from "@/components/about/MissionSection";
import OfferingsShowcase from "@/components/about/OfferingsShowcase";
import BuiltBySection from "@/components/about/BuiltBySection";
import AboutCampus from "@/components/about/AboutCampus";
import "@/styles/landing.css";
import "@/components/about/about.css";

export const metadata: Metadata = {
  title: "About Arcade — Amal Jyothi College of Engineering",
  description:
    "Arcade is a learning platform built by the Department of Computer Applications at Amal Jyothi College of Engineering. Modern learning, trusted certification, built for the future.",
  openGraph: {
    title: "About Arcade",
    description:
      "Modern Learning. Trusted Certification. Built for the Future. — Department of Computer Applications, AJCE.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="landing-root">
      <AboutPageMotion>
        <AboutHero />
        <MissionSection />
        <OfferingsShowcase />
        <BuiltBySection />
        <AboutCampus />
      </AboutPageMotion>
    </div>
  );
}
