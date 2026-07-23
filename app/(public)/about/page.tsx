"use client";

import React, { useRef } from "react";
import { motion, Variants, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building,
  CheckCircle,
  Code,
  GraduationCap,
  Layout,
  Lightbulb,
  Medal,
  PlaySquare,
  Shield,
  ShieldCheck,
  Trophy,
  Users,
  Video,
  Zap,
  BadgeCheck,
  FileBadge,
  Building2,
  Handshake,
} from "lucide-react";
import Link from "next/link";

import VariableProximity from "@/apps/public/components/landing/VariableProximity";
import "@/apps/public/landing.css";

// Reusable Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function AboutPage() {
  const headerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="landing-root min-h-screen flex flex-col relative z-10 bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-100/50 rounded-full blur-[120px] opacity-70" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[100px]" />
      </div>

      {/* --- HERO SECTION --- */}
      <header
        ref={headerRef}
        className="max-w-[1000px] mx-auto w-full px-6 md:px-12 pt-32 pb-24 relative z-10 flex flex-col items-center justify-center text-center"
      >
        <div className="space-y-8 flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-bold font-bricolage text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            <VariableProximity
              label="Learn. Compete. Get Certified."
              fromFontVariationSettings="'wght' 300, 'opsz' 20"
              toFontVariationSettings="'wght' 800, 'opsz' 80"
              containerRef={headerRef}
              radius={250}
              falloff="linear"
              className="font-bricolage text-slate-900 flex justify-center"
            />
          </h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-lg md:text-xl font-medium text-slate-600 leading-relaxed max-w-3xl"
          >
            Arcade is the official learning, innovation, and event platform by Amal
            Jyothi College of Engineering, empowering learners, organizations, and
            educators through certified webinars, hackathons, workshops,
            competitions, and collaborative learning experiences.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300"
            >
              <span>Explore Events</span>
              <ArrowRight size={18} />
            </Link>
            <button
              disabled
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-400 font-semibold text-base cursor-not-allowed opacity-70"
              title="Verification feature coming soon"
            >
              <ShieldCheck size={18} />
              <span>Verify Certificates</span>
            </button>
          </motion.div>
        </div>
      </header>

      {/* --- SECTION 1: WHY GET CERTIFIED? --- */}
      <section className="py-24 bg-white border-y border-slate-200/50">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <SectionHeader
            title="Why Get Certified?"
            description="An Arcade certificate is more than proof of participation—it is a verified record of your commitment to learning, issued through the academic ecosystem of Amal Jyothi College of Engineering."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16"
          >
            {[
              { icon: ShieldCheck, title: "AJCE-Backed Recognition", desc: "Every certificate issued through Arcade is institutionally backed by Amal Jyothi College of Engineering, adding academic credibility to every achievement." },
              { icon: BadgeCheck, title: "Verified & Authentic", desc: "Certificates are securely generated through Arcade and can be verified online, making them reliable for employers, institutions, and professional networks." },
              { icon: Briefcase, title: "Strengthen Your Portfolio", desc: "Showcase your participation in webinars, hackathons, workshops, and competitions as evidence of continuous learning and practical engagement." },
              { icon: FileBadge, title: "Professional Profile Ready", desc: "Add your certificates to your résumé, LinkedIn profile, or personal portfolio to demonstrate your commitment to upskilling." },
              { icon: Trophy, title: "Recognize Every Achievement", desc: "Whether you attend a webinar or win a hackathon, every meaningful milestone is captured as a permanent digital credential." },
              { icon: GraduationCap, title: "Learn with Confidence", desc: "Participate in events knowing your accomplishments are recognized through a trusted academic platform, not just a generic event website." },
            ].map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </motion.div>

          {/* Bottom Highlight Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100/50 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
          >
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Award className="w-64 h-64 text-blue-500" />
            </div>
            <div className="md:w-2/3 relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Why an Arcade Certificate Matters</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Unlike certificates generated by standalone event platforms, Arcade certificates are issued through the official learning ecosystem of Amal Jyothi College of Engineering. They represent verified participation in meaningful learning experiences and provide a trusted record of your academic and professional development.
              </p>
            </div>
            <div className="md:w-1/3 flex justify-center relative z-10">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 bg-white rounded-full shadow-xl shadow-blue-500/10 flex items-center justify-center border-4 border-blue-50"
              >
                <Award className="w-16 h-16 text-blue-600" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CORE VALUES (from compile branch) --- */}
      <section className="max-w-[1200px] mx-auto w-full px-6 md:px-12 py-24 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Our Core Values
          </h2>
          <p className="text-base text-slate-500">
            Everything we build is guided by these core principles to ensure the best experience for our community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${val.bg} ${val.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{val.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{val.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- CTA (from compile branch) --- */}
      <section className="max-w-[1200px] mx-auto w-full px-6 md:px-12 py-24 mb-12">
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Ready to transform the way you teach?
            </h2>
            <p className="text-blue-100/80 text-lg">
              Join thousands of educators and institutions already building on Arcade.
            </p>
            <div className="pt-4">
              <Link
                href="/creators"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-blue-50 text-slate-900 font-bold text-sm tracking-wide shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span>Become a Creator</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: POWERED BY AJCE --- */}
      <AJCESection />




      {/* --- SECTION 5: WHO IS ARCADE FOR? --- */}
      <section className="py-24 md:py-32 bg-slate-50 border-t border-slate-200/50 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <SectionHeader title="Who is Arcade For?" />
          
          <TimelineSection />

        </div>
      </section>




    </div>
  );
}

// --- SUB-COMPONENTS ---

function TimelineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Subtle parallax for the whole block
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const yParallax = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const personas = [
    {
      label: "For Students",
      title: "Accelerate your career with verified credentials",
      description: "Master new skills and prove your expertise to employers with institution-backed certificates.",
      features: ["Learn highly practical skills", "Build your technical portfolio", "Earn verifiable certificates"],
      icon: GraduationCap,
      color: "text-blue-600",
      glowColor: "rgba(37,99,235,0.35)",
      ringColor: "rgba(37,99,235,0.7)",
      iconBg: "bg-blue-50"
    },
    {
      label: "For Organizations",
      title: "Scale your technical events & reach top talent",
      description: "Host hackathons, coding challenges, and tech talks for an engaged community of learners.",
      features: ["Host robust technical events", "Reach highly targeted learners", "Build vibrant communities"],
      icon: Building,
      color: "text-orange-500",
      glowColor: "rgba(249,115,22,0.35)",
      ringColor: "rgba(249,115,22,0.7)",
      iconBg: "bg-orange-50"
    },
    {
      label: "For Content Creators",
      title: "Monetize your expertise & grow your audience",
      description: "Deliver live workshops and courses to students eager to learn from industry professionals.",
      features: ["Conduct interactive live workshops", "Share your domain expertise", "Grow your loyal audience"],
      icon: PlaySquare,
      color: "text-emerald-500",
      glowColor: "rgba(16,185,129,0.35)",
      ringColor: "rgba(16,185,129,0.7)",
      iconBg: "bg-emerald-50"
    },
    {
      label: "For Institutions",
      title: "Expand your educational impact globally",
      description: "Partner with Arcade to co-certify programs and offer your curriculum to a broader audience.",
      features: ["Partner directly with Arcade", "Reach larger academic communities", "Co-certify premium programs"],
      icon: Layout,
      color: "text-purple-600",
      glowColor: "rgba(147,51,234,0.35)",
      ringColor: "rgba(147,51,234,0.7)",
      iconBg: "bg-purple-50"
    }
  ];

  return (
    <motion.div ref={containerRef} style={{ y: yParallax }} className="relative max-w-5xl mx-auto mt-24">
      {/* Mobile Vertical Line */}
      <div className="absolute left-[calc(50%-1.5px)] top-32 bottom-32 w-[3px] bg-slate-200 md:hidden z-0" />

      {/* Desktop connecting pipes (pure CSS — no pulse) */}
      <div className="absolute inset-0 hidden md:block pointer-events-none z-0">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`absolute border-slate-200 opacity-80 ${
              i % 2 === 0
                ? "border-l-[3px] border-b-[3px] rounded-bl-[100px]"
                : "border-r-[3px] border-b-[3px] rounded-br-[100px]"
            }`}
            style={{
              top: `calc(${i * 25}% + 12.5%)`,
              bottom: `calc(${(2 - i) * 25}%)`,
              left: i % 2 === 0 ? "calc(25% - 1.5px)" : undefined,
              right: i % 2 !== 0 ? "calc(25% - 1.5px)" : undefined,
              width: "50%",
            }}
          />
        ))}
      </div>

      {personas.map((persona, index) => (
        <TimelineNode
          key={index}
          persona={persona}
          isLeft={index % 2 === 0}
        />
      ))}
    </motion.div>
  );
}

function TimelineNode({ persona, isLeft }: { persona: any; isLeft: boolean }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  // Fire once when the node's center crosses 35% from the bottom of the viewport
  const isInView = useInView(nodeRef, { once: true, margin: "-30% 0px -30% 0px" });

  return (
    <div className="relative w-full">
      <div
        className={`relative z-10 flex flex-col md:flex-row items-center w-full py-16 md:py-0 md:h-[500px] gap-12 md:gap-0 ${
          isLeft ? "" : "md:flex-row-reverse"
        }`}
      >
        {/* Icon Half */}
        <div ref={nodeRef} className="w-full md:w-1/2 flex justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full shadow-xl flex items-center justify-center border-[6px] border-slate-50 relative z-20 group hover:-translate-y-1 transition-transform duration-500"
          >
            {/* Ambient glow bloom — expands in then settles */}
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none blur-xl"
              style={{ backgroundColor: persona.glowColor }}
              initial={{ opacity: 0, scale: 1 }}
              animate={isInView
                ? { opacity: [0, 1, 0.25], scale: [1, 1.35, 1.15] }
                : {}
              }
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Ring flash — appears briefly then fades */}
            <motion.div
              className="absolute rounded-full border-2 pointer-events-none"
              style={{
                inset: "-8px",
                borderColor: persona.ringColor,
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={isInView
                ? { opacity: [0, 1, 0], scale: [0.85, 1.05, 1.15] }
                : {}
              }
              transition={{ duration: 0.7, ease: "easeOut" }}
            />

            <persona.icon
              className={`w-12 h-12 md:w-14 md:h-14 ${persona.color} relative z-10 transition-transform duration-500 group-hover:scale-110`}
            />
          </motion.div>
        </div>

        {/* Text Half */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className={`flex flex-col gap-6 w-full max-w-[420px] ${
              isLeft ? "md:mr-auto md:ml-16" : "md:ml-auto md:mr-16"
            } mx-auto md:mx-0`}
          >
            {/* Header */}
            <div className="flex flex-col gap-4 text-left">
              <span className={`text-sm font-bold tracking-widest uppercase ${persona.color}`}>
                {persona.label}
              </span>
              <h3 className="text-3xl md:text-4xl font-bold font-bricolage text-slate-900 leading-tight">
                {persona.title}
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                {persona.description}
              </p>
            </div>

            {/* Checklist */}
            <ul className="space-y-4 pt-2">
              {persona.features.map((feat: string, idx: number) => (
                <li key={idx} className="flex items-start gap-4 text-slate-700 font-medium text-base text-left">
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${persona.iconBg}`}>
                    <CheckCircle className={`w-4 h-4 ${persona.color}`} />
                  </div>
                  <span className="leading-snug">{feat}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AJCESection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Parallax effect: moves up slowly as you scroll down
  const yParallax = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section ref={containerRef} className="relative py-32 overflow-hidden bg-white border-y border-slate-200/50">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10 flex flex-col lg:flex-row items-center min-h-[500px]">
        
        {/* Left Column (Content) - 55% */}
        <div className="w-full lg:w-[55%] pr-0 lg:pr-12 relative z-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            
            <h2 className="text-3xl md:text-5xl font-bold font-bricolage text-slate-900 tracking-tight leading-tight mb-6">
              Powered by Amal Jyothi College of Engineering
            </h2>
            
            <p className="text-lg text-slate-600 leading-relaxed mb-10">
              Arcade is the official learning and event platform of Amal Jyothi College of Engineering, where every certificate is backed by an institution known for academic excellence, innovation, and industry engagement.
            </p>

            {/* Premium Trust Highlights */}
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Largest Engineering Campus</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Kerala's largest infrastructure with a sprawling 68-acre campus and approximately 1.26 lakh sq. m. built-up area.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <Medal className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">KIRF Rank #4</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Ranked #4 among all engineering colleges in Kerala by the Kerala Institutional Ranking Framework (KIRF).</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Autonomous Excellence</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">An Autonomous Institution recognized for maintaining rigorous academic standards and continuous innovation.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <BadgeCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">NAAC A+ & NBA Accredited</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Highly accredited with a NAAC A+ grade alongside NBA-accredited engineering programmes.</p>
                </div>
              </div>
            </div>

            {/* Compact Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 mb-1">68</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Acres</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 mb-1">1.26L</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sq. m. Area</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 mb-1">#4</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">KIRF Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 mb-1">A+</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">NAAC Grade</div>
              </div>
            </div>

          </motion.div>
        </div>

        {/* Right Column (Background Illustration) - 45% */}
        <div className="absolute inset-0 lg:left-[45%] pointer-events-none select-none overflow-hidden flex items-center justify-end z-0">
          <motion.div
            style={{ y: yParallax }}
            className="w-full h-full relative flex items-center justify-end opacity-100"
          >
            <div 
              className="w-full h-[140%] max-w-[1000px] absolute -right-20"
              style={{
                backgroundImage: 'url(/images/ajce-sketch2.png)',
                backgroundSize: 'contain',
                backgroundPosition: 'right center',
                backgroundRepeat: 'no-repeat',
                filter: "grayscale(100%)",
                maskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 70%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 70%, transparent 100%)',
                WebkitMaskComposite: 'source-in',
                maskComposite: 'intersect',
              }}
            />
          </motion.div>
        </div>
        
      </div>
    </section>
  );
}


function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="text-center space-y-4 max-w-2xl mx-auto">
      <h2 className="text-3xl md:text-5xl font-bold font-bricolage text-slate-900 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-slate-600 leading-relaxed font-medium">
          {description}
        </p>
      )}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
    >
      <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-slate-600 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold font-bricolage text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function LargeFeatureCard({ icon: Icon, title, description, color }: { icon: any; title: string; description: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white border-blue-100",
    indigo: "text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white border-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white border-emerald-100",
    amber: "text-amber-600 bg-amber-50 group-hover:bg-amber-600 group-hover:text-white border-amber-100",
    rose: "text-rose-600 bg-rose-50 group-hover:bg-rose-600 group-hover:text-white border-rose-100",
    purple: "text-purple-600 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white border-purple-100",
  };

  return (
    <motion.div
      variants={fadeInUp}
      className={`bg-white border-t-4 border-x border-b border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden relative ${colorMap[color].split(" ")[0].replace("text-", "border-t-")}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500 ${colorMap[color]}`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-2xl font-bold font-bricolage text-slate-900 mb-4">{title}</h3>
      <p className="text-base text-slate-600 leading-relaxed relative z-10">{description}</p>
    </motion.div>
  );
}






