"use client";

import React from "react";

export default function CreatorTrust() {
  return (
    <section className="trust">
      <div className="wrap">
        <div className="trust-inner">
          <div>
            <span className="eyebrow" style={{ color: "#DDDEFB", borderBottom: "none" }}>Platform Trust</span>
            <h2 className="mt-4">Trusted Learning Starts Here</h2>
            <p>Every creator and organization completes identity verification before publishing content. Combined with Arcade's review process, this helps maintain a trusted ecosystem where learners can confidently enroll in high-quality educational content.</p>
          </div>

          <div className="trust-badges">
            <div className="tbadge">
              <span className="ic">👤</span>
              <div>
                <b>Identity Verification</b>
                <span>KYC check verifies credentials before public catalog access.</span>
              </div>
            </div>
            <div className="tbadge">
              <span className="ic">✔️</span>
              <div>
                <b>Quality Content Reviews</b>
                <span>QA team structural check on video, text, and assessments.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
