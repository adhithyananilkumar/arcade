"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ScrollReveal from "./ScrollReveal";

const SPRING = { type: "spring" as const, stiffness: 400, damping: 26 };

function UnderlineLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  const content = (
    <>
      {children}
      <span className="about-built__link-line" aria-hidden="true" />
    </>
  );

  return (
    <motion.li
      whileHover={shouldReduceMotion ? undefined : { x: 2 }}
      transition={SPRING}
    >
      {external ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="about-built__link"
        >
          {content}
        </Link>
      ) : (
        <a href={href} className="about-built__link">
          {content}
        </a>
      )}
    </motion.li>
  );
}

export default function BuiltBySection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="about-section" aria-labelledby="about-built-heading">
      <ScrollReveal y={28}>
        <motion.div
          className="about-built"
          whileHover={
            shouldReduceMotion
              ? undefined
              : { y: -2, transition: SPRING }
          }
        >
          <motion.div
            className="about-built__brand"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={
              shouldReduceMotion
                ? { duration: 0.3 }
                : { type: "spring", stiffness: 260, damping: 22, delay: 0.1 }
            }
          >
            <Image
              src="/ComputerApllicationsAJCE.svg"
              alt="Department of Computer Applications, Amal Jyothi College of Engineering"
              width={280}
              height={120}
              className="about-built__logo"
              priority={false}
            />
          </motion.div>

          <div className="about-built__copy">
            <p className="about-eyebrow">Built by</p>
            <h2 id="about-built-heading" className="about-heading">
              Department of Computer Applications
            </h2>
            <p className="about-lede about-built__lede">
              Arcade is designed and maintained by the Department of Computer
              Applications at Amal Jyothi College of Engineering (AJCE) — an
              academic initiative to make modern learning institutional,
              trustworthy, and lasting.
            </p>

            <Separator className="my-8 bg-[var(--l-ink)]/10" />

            <ul className="about-built__links">
              <UnderlineLink href="https://mca.ajce.in" external>
                <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                <span>mca.ajce.in</span>
              </UnderlineLink>
              <UnderlineLink href="mailto:hodmca@amaljyothi.ac.in">
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                <span>hodmca@amaljyothi.ac.in</span>
              </UnderlineLink>
            </ul>
          </div>
        </motion.div>
      </ScrollReveal>
    </section>
  );
}
