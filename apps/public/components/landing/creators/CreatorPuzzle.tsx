"use client";

import React from "react";
import CardScanner from "@/apps/public/components/landing/CardScanner";

export default function CreatorPuzzle() {
  return (
    <section className="puzzle-sec">
      <div className="wrap puzzle-grid">
        <div>
          <CardScanner />
        </div>
        <div>
          <span className="eyebrow">Collaborate &amp; Grow</span>
          <h2>Build great courses, piece by piece</h2>
          <p>Great learning is rarely a solo effort. Bring co-authors, teams, and whole organizations into one shared workspace — every piece its own contribution to something bigger.</p>
          <ul>
            <li>
              <span className="chk">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <span><b>Multiple authors, one course.</b> Co-create lessons and split the work without losing consistency.</span>
            </li>
            <li>
              <span className="chk">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <span><b>Publish under an organization.</b> Keep your institution's brand and roles in one place.</span>
            </li>
            <li>
              <span className="chk">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <span><b>Shared analytics &amp; reviews.</b> Everyone sees engagement and review status as it happens.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
