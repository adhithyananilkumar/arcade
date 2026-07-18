"use client";

import ScrollReveal from "./ScrollReveal";
import AnimatedPullQuote from "./AnimatedPullQuote";

export default function MissionSection() {
  return (
    <section
      className="about-section about-mission"
      aria-labelledby="about-mission-heading"
    >
      <div className="about-mission__grid">
        <ScrollReveal className="about-mission__prose" y={28}>
          <p className="about-eyebrow">Mission</p>
          <h2 id="about-mission-heading" className="about-heading">
            A learning platform meant to be experienced.
          </h2>
          <div className="about-mission__body">
            <p>
              Arcade is the online learning platform of Amal Jyothi College of
              Engineering — courses, workshops, forums, and certified
              achievements under one roof. It began as a unified ecosystem for
              campus learners and creators, and continues as an institutional
              product: modern delivery with credentials you can trust.
            </p>
            <p>
              The platform is built by the{" "}
              <strong>Department of Computer Applications</strong> at AJCE —
              designed by builders, for builders, so education stays continuous,
              collaborative, and ready for what comes next.
            </p>
          </div>
        </ScrollReveal>

        <AnimatedPullQuote quote="Education should not simply be delivered. It should be experienced, trusted, and continuously evolving." />
      </div>
    </section>
  );
}
