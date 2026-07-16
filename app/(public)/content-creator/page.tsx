"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import HeroNav from "@/components/landing/HeroNav";
import TrueFocus from "@/components/landing/TrueFocus";
import { toast } from "sonner";
import "../courses/courses.css";

export default function ContentCreatorPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you! Your message has been sent successfully.");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      message: ""
    });
  };

  return (
    <div className="courses-dashboard-root min-h-screen flex flex-col relative z-10 bg-gradient-to-b from-[#E9EEFB] via-[#F8FAFC] to-[#EAF7EF]">
      
      {/* Header Navigation */}
      <HeroNav />

      {/* Main Content Area: Split 2-column layout matching the reference mockup */}
      <main className="flex-grow max-w-[1200px] mx-auto w-full px-6 md:px-12 pt-32 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Heading & Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="font-voyage text-5xl sm:text-6xl text-[#14142b] tracking-tight leading-none">
              <TrueFocus 
                sentence="Get in touch."
                manualMode={false}
                blurAmount={3}
                borderColor="#2451D6"
                glowColor="rgba(36, 81, 214, 0.4)"
                animationDuration={0.8}
                pauseBetweenAnimations={1.5}
              />
            </h1>
            <p className="text-sm font-semibold text-slate-500 leading-relaxed max-w-sm">
              Whether you are a student, a course creator, an educator, or are sharing knowledge independently — tell us what you need.
            </p>

            <div className="pt-8 border-t border-slate-200/50 space-y-4">
              <span className="text-[10px] font-black text-slate-400 block tracking-wider uppercase">ADDRESS</span>
              <div className="space-y-1 text-sm font-bold text-slate-700 leading-relaxed">
                <p>Arcade, Amal Jyothi College Of Engineering</p>
                <p>Koovapally, Kanjirapally</p>
                <p>Kerala</p>
              </div>
              
              <div className="pt-4">
                <a 
                  href="mailto:info@amaljyothi.ac.in" 
                  className="inline-flex items-center gap-1.5 text-sm font-black text-[#2451D6] hover:text-blue-700 hover:underline transition-colors"
                >
                  <span>info@amaljyothi.ac.in</span>
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form Grid */}
          <div className="lg:col-span-3 bg-gradient-to-br from-white/85 to-[#F8F9FC]/45 backdrop-blur-xl border border-slate-300/85 rounded-[24px] p-6 sm:p-10 shadow-[0_12px_40px_rgba(36,81,214,0.02)] transition-all duration-500 hover:scale-[1.015] hover:border-[#2451D6]/30 hover:shadow-[0_20px_50px_rgba(36,81,214,0.06)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-wider block uppercase">First Name</label>
                  <input 
                    type="text" 
                    placeholder="" 
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-[#F8F9FC]/95 border border-slate-200/85 rounded-xl px-4 py-3 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-wider block uppercase">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="" 
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-[#F8F9FC]/95 border border-slate-200/85 rounded-xl px-4 py-3 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 tracking-wider block uppercase">Email</label>
                <input 
                  type="email" 
                  placeholder="" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#F8F9FC]/95 border border-slate-200/85 rounded-xl px-4 py-3 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-sm transition-all"
                />
              </div>

              {/* Row 3: How can we help? */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 tracking-wider block uppercase">How can we help?</label>
                <textarea 
                  rows={4}
                  placeholder="" 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-[#F8F9FC]/95 border border-slate-200/85 rounded-xl px-4 py-3 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-sm transition-all resize-none"
                />
              </div>

              {/* Submit button: full-width white-on-dark pill in mockup, styled in our brand tone */}
              <button 
                type="submit" 
                className="w-full text-center py-3.5 rounded-[24px] bg-[#2451D6] hover:bg-blue-700 text-white font-bold text-xs tracking-widest uppercase shadow-md shadow-blue-500/10 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </main>

    </div>
  );
}
