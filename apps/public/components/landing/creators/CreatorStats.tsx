"use client";

import React from "react";

export default function CreatorStats() {
  return (
    <section className="statbar">
      <div className="wrap" style={{ padding: 0 }}>
        <div className="statbar-inner">
          <div className="statbar-item"><span className="num">4</span><span className="txt"><b>Content formats</b><span>Courses, workshops, webinars, articles</span></span></div>
          <div className="statbar-item"><span className="num">10</span><span className="txt"><b>Creator tools</b><span>All in one dashboard</span></span></div>
          <div className="statbar-item"><span className="num">6</span><span className="txt"><b>Educator types</b><span>Solo experts to institutions</span></span></div>
          <div className="statbar-item"><span className="num">2</span><span className="txt"><b>Trust checkpoints</b><span>Identity check, then content review</span></span></div>
        </div>
      </div>
    </section>
  );
}
