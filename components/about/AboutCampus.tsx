"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CampusPhotoBackground from "./CampusPhotoBackground";

gsap.registerPlugin(ScrollTrigger);

const HEADLINE = "Grown from Amal Jyothi College of Engineering.";
const SUPPORT = "25 years of engineering education in Kerala.";

const BODY =
  "Amal Jyothi stands for pure light — a symbol for the search for unblemished truth — and that meaning has carried through 25 years of engineering education in Kerala. Founded in 2001 and managed by the Catholic Diocese of Kanjirappally, the college sits on a mildly undulating 65-acre campus in the Western Ghats. It holds Autonomous status, conferred by the UGC on 6 July 2023, and has been affiliated with APJ Abdul Kalam Technological University since 2015, alongside recognition as the first engineering college in Kerala to earn an NAAC 'A' grade. Arcade was built within this environment — by the Department of Computer Applications, one of the college's academic units — carrying that same institutional commitment into a digital learning platform.";

export default function AboutCampus() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const supportRef = useRef<HTMLParagraphElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);

  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const reducedMotion = !mounted || prefersReduced === true;
  const animate = mounted && prefersReduced === false;

  // Entrance: eyebrow + badge → word stagger → support → rule → body
  useGSAP(
    () => {
      const section = sectionRef.current;
      const eyebrow = eyebrowRef.current;
      const badge = badgeRef.current;
      const headline = headlineRef.current;
      const support = supportRef.current;
      const body = bodyRef.current;
      const rule = ruleRef.current;
      if (!section || !eyebrow || !badge || !headline || !support || !body || !rule)
        return;

      const words = headline.querySelectorAll<HTMLElement>("[data-prov-word]");

      if (!animate) {
        gsap.set([eyebrow, badge, support, body, rule, ...words], {
          opacity: 1,
          y: 0,
          scale: 1,
        });
        return;
      }

      gsap.set(eyebrow, { opacity: 0, y: 10 });
      gsap.set(badge, { opacity: 0, y: 8, scale: 0.94 });
      gsap.set(words, { opacity: 0, y: "0.45em" });
      gsap.set(support, { opacity: 0, y: 10 });
      gsap.set(rule, { opacity: 0, scaleX: 0.4 });
      gsap.set(body, { opacity: 0, y: 12 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      });

      tl.to(eyebrow, {
        opacity: 0.88,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
      })
        .to(
          badge,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.4)",
          },
          "-=0.28"
        )
        .to(
          words,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.045,
            ease: "power2.out",
          },
          "-=0.12"
        )
        .to(
          support,
          {
            opacity: 0.82,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
          },
          "-=0.18"
        )
        .to(
          rule,
          {
            opacity: 1,
            scaleX: 1,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.2"
        )
        .to(
          body,
          {
            opacity: 0.9,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.12"
        );
    },
    { dependencies: [animate], revertOnUpdate: true }
  );

  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => window.clearTimeout(t);
  }, [animate]);

  const words = HEADLINE.replace(/\.$/, "").split(" ");

  return (
    <section
      ref={sectionRef}
      className={`about-section about-provenance${
        reducedMotion ? " is-reduced" : ""
      }`}
      aria-labelledby="about-campus-heading"
    >
      <CampusPhotoBackground animate={animate} />

      <div className="about-provenance__content">
        <div className="about-provenance__meta">
          <p ref={eyebrowRef} className="about-provenance__eyebrow">
            Provenance
          </p>
          <div ref={badgeRef}>
            <Badge
              variant="outline"
              className="about-provenance__badge border-white/35 bg-white/10 text-[0.65rem] font-semibold tracking-[0.12em] text-[rgba(244,240,232,0.92)] uppercase backdrop-blur-sm"
            >
              Est. 2001
            </Badge>
          </div>
        </div>

        <h2
          ref={headlineRef}
          id="about-campus-heading"
          className="about-provenance__headline"
          aria-label={HEADLINE}
        >
          <span aria-hidden="true">
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="about-provenance__word-wrap"
                style={{
                  marginRight: i < words.length - 1 ? "0.28em" : 0,
                }}
              >
                <span className="about-provenance__word" data-prov-word>
                  {word}
                </span>
              </span>
            ))}
            <span className="about-provenance__word-wrap">
              <span className="about-provenance__word" data-prov-word>
                .
              </span>
            </span>
          </span>
        </h2>

        <p ref={supportRef} className="about-provenance__support">
          {SUPPORT}
        </p>

        <div ref={ruleRef} className="about-provenance__rule-wrap">
          <Separator className="about-provenance__rule bg-white/30" />
        </div>

        <p ref={bodyRef} className="about-provenance__body">
          {BODY}{" "}
          Learn more at{" "}
          <motion.a
            href="https://ajce.in"
            target="_blank"
            rel="noopener noreferrer"
            className="about-provenance__body-link"
            whileHover={reducedMotion ? undefined : { y: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          >
            ajce.in
          </motion.a>
          .
        </p>
      </div>
    </section>
  );
}
