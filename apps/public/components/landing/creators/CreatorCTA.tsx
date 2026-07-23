"use client";

import React from "react";
import Link from "next/link";

export default function CreatorCTA() {
  return (
    <section className="cta" id="cta">
      <div className="wrap cta-inner">
        <span className="cta-cursive">Your next chapter starts here...</span>
        <h2 className="cta-title">
          START CREATING <span className="cta-highlight">TODAY</span>
        </h2>
        <p className="cta-desc">Join Arcade as a creator and start building learning experiences that educate, inspire, and create lasting impact.</p>
        <div className="cta-actions">
          <Link href="/register?role=creator" className="btn btn-cta-primary">
            Become a Creator →
          </Link>
          <a href="#tools" className="btn btn-cta-secondary">
            Explore the Tools
          </a>
        </div>
      </div>
    </section>
  );
}
