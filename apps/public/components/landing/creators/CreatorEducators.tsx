"use client";

import React from "react";
import { GraduationCap, Building2, Briefcase, Heart, User, UserCheck } from "lucide-react";

export default function CreatorEducators() {
  return (
    <section className="edu-sec" id="educators">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Built for every educator</span>
          <h2>A professional platform, whoever you are</h2>
        </div>

        <div className="edu-grid">
          <div className="edu-chip">
            <span className="ic" style={{ background: "#2E2EAB" }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </span>
            <div><b>Universities &amp; colleges</b><span>Accredited-quality learning</span></div>
          </div>
          <div className="edu-chip">
            <span className="ic" style={{ background: "#20B8CF" }}>
              <Building2 className="w-5 h-5 text-white" />
            </span>
            <div><b>Training institutes</b><span>Structured, certified programs</span></div>
          </div>
          <div className="edu-chip">
            <span className="ic" style={{ background: "#F5A623" }}>
              <Briefcase className="w-5 h-5 text-white" />
            </span>
            <div><b>Companies</b><span>Professional training at scale</span></div>
          </div>
          <div className="edu-chip">
            <span className="ic" style={{ background: "#7A5AF8" }}>
              <Heart className="w-5 h-5 text-white" />
            </span>
            <div><b>Nonprofits</b><span>Mission-driven education</span></div>
          </div>
          <div className="edu-chip">
            <span className="ic" style={{ background: "#1F8A9E" }}>
              <User className="w-5 h-5 text-white" />
            </span>
            <div><b>Freelancers &amp; experts</b><span>Turn expertise into income</span></div>
          </div>
          <div className="edu-chip">
            <span className="ic" style={{ background: "#2E2EAB" }}>
              <UserCheck className="w-5 h-5 text-white" />
            </span>
            <div><b>Independent educators</b><span>Publish on your own terms</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
