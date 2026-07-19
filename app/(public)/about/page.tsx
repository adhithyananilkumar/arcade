"use client";

import React from "react";
import { ArrowRight, Globe, Users, Zap, Shield, HeartHandshake } from "lucide-react";
import Link from "next/link";
import VariableProximity from "@/apps/public/components/landing/VariableProximity";
import "@/apps/public/landing.css";

export default function AboutPage() {
  const headerRef = React.useRef<HTMLDivElement>(null);

  const stats = [
    { label: "Active Students", value: "10,000+" },
    { label: "Courses Created", value: "500+" },
    { label: "Universities", value: "50+" },
    { label: "Community Members", value: "25,000+" },
  ];

  const values = [
    {
      title: "Global Reach",
      description: "Empowering learners from every corner of the world with accessible education.",
      icon: Globe,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      title: "Community First",
      description: "Built by educators for educators, fostering an active and supportive network.",
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      title: "Lightning Fast",
      description: "Experience uncompromised speed with our optimized learning delivery network.",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
    {
      title: "Secure & Reliable",
      description: "Enterprise-grade security protecting your intellectual property and data.",
      icon: Shield,
      color: "text-rose-500",
      bg: "bg-rose-50"
    },
  ];

  return (
    <div className="landing-root min-h-screen flex flex-col relative z-10 bg-white">
      {/* Hero Section */}
      <header 
        ref={headerRef} 
        className="max-w-[1200px] mx-auto w-full px-6 md:px-12 pt-40 pb-20 text-center space-y-8 relative z-10"
      >
        <div className="absolute inset-0 bg-radial-gradient from-indigo-50/50 to-transparent blur-3xl -z-10" />
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-4 shadow-sm">
          <HeartHandshake className="w-4 h-4" />
          <span>Our Mission</span>
        </div>

        <h1 className="text-5xl md:text-7xl text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
          <VariableProximity
            label="Empowering the Future of Education"
            fromFontVariationSettings="'wght' 300, 'opsz' 20"
            toFontVariationSettings="'wght' 800, 'opsz' 80"
            containerRef={headerRef}
            radius={250}
            falloff="linear"
            className="variable-proximity-serif text-slate-900"
          />
        </h1>
        
        <p className="text-lg md:text-xl font-medium text-slate-500 leading-relaxed max-w-2xl mx-auto">
          Arcade is an all-in-one platform designed to help educators, institutions, and creators build premium interactive courses and workspace labs seamlessly.
        </p>

        <div className="pt-8">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span>Explore Platform</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Stats Section */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-16">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200/60">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center px-4">
                <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2 font-space">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
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

      {/* CTA Section */}
      <section className="max-w-[1200px] mx-auto w-full px-6 md:px-12 py-24 mb-12">
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden">
          {/* Decorative Elements */}
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
                href="/for-creators"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-blue-50 text-slate-900 font-bold text-sm tracking-wide shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span>Become a Creator</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
