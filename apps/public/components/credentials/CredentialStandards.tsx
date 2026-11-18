"use client";

/**
 * The public statement of the badge standard: five levels, four kinds of achievement, how each is
 * earned and how any badge can be checked. The levels' wording comes from the server catalogue.
 *
 * Styled like the Reach Us page: open editorial layout, serif headings, hairlines instead of cards.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import "@/apps/public/landing.css";
import { CredentialBadge, credentialsApi, type BadgeCatalogue, type BadgeLevel } from "@/domains/credentials";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.215, 0.61, 0.355, 1] },
  }),
};

const PRINCIPLES = [
  {
    title: "Earned, never granted by hand",
    body: "Badges are issued automatically at 100% completion — every required lesson and assessment, a verified check-in, or a passed exam. Nobody can award one manually.",
  },
  {
    title: "Sealed at issuance",
    body: "Each badge's facts — holder, content, level, issuer, date — are sealed with a server-side signature. Any later change to the record is detected on its public page.",
  },
  {
    title: "Open to verify",
    body: "Every badge has a credential ID and a public page, and is published as an Open Badges 2.0 assertion that third-party verifiers can read.",
  },
];

const COLS = "md:grid-cols-[180px_repeat(5,minmax(0,1fr))]";

export function CredentialStandards() {
  const reduce = useReducedMotion();
  const [catalogue, setCatalogue] = useState<BadgeCatalogue | null>(null);

  useEffect(() => {
    credentialsApi.catalogue().then(setCatalogue).catch(() => setCatalogue(null));
  }, []);

  const tiers = catalogue ? [...catalogue.tiers].sort((a, b) => a.level - b.level) : [];
  const offered = new Set(catalogue?.classes.map((c) => c.code) ?? []);
  const anim = (i: number) => ({
    initial: reduce ? undefined : ("hidden" as const),
    animate: "visible" as const,
    custom: i,
    variants: fadeInUp,
  });

  return (
    <div className="landing-root relative px-6 pb-20 pt-28 font-sans text-ink selection:bg-blue-100 selection:text-blue-900 sm:px-12 sm:pt-32 lg:px-20 lg:pb-28 lg:pt-36 dark:selection:bg-blue-500/15 dark:selection:text-blue-200">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundColor: "var(--theme-surface, #FAFBFD)",
          backgroundImage: `var(--theme-wash,
            radial-gradient(ellipse 70% 40% at 50% 0%, rgba(224, 236, 255, 0.25) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 10% 25%, rgba(233, 225, 254, 0.20) 0%, transparent 65%),
            radial-gradient(ellipse 60% 40% at 90% 75%, rgba(253, 232, 240, 0.18) 0%, transparent 65%),
            linear-gradient(180deg, #FAFBFD 0%, #F6F8FD 35%, #F8F6FD 70%, #FAF9FB 100%)
          )`,
        }}
      />

      <main className="mx-auto w-[84vw] max-w-[1400px]">
        {/* HEADER */}
        <header className="mx-auto max-w-3xl text-center">
          <motion.p {...anim(0)} className="mb-5 font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
            Arcade credentials
          </motion.p>
          <motion.h1
            {...anim(1)}
            className="mb-7 font-serif text-4xl leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[56px]"
          >
            <span className="block font-bold">One standard</span>
            <span className="block font-normal italic text-[#205ca8] dark:text-[#7cbaff]">for every badge.</span>
          </motion.h1>
          <motion.p
            {...anim(2)}
            className="mx-auto max-w-xl text-[15px] font-normal leading-relaxed text-slate-600 sm:text-base"
          >
            Channels publish the content; Arcade issues the badge. Every badge is drawn, worded and levelled the same
            way, whoever taught the course or ran the event — so a Level 2 badge means the same thing everywhere, and
            every one of them can be verified.
          </motion.p>
        </header>

        {/* LEVEL × KIND MATRIX — open, hairline rows */}
        <motion.section {...anim(3)} className="mt-16 lg:mt-24">
          <div className="mb-10 flex flex-col items-center space-y-3 text-center">
            <h2 className="font-serif text-3xl font-normal italic leading-snug tracking-tight text-ink sm:text-4xl">
              Five levels, four kinds.
            </h2>
            <span className="block h-0.5 w-10 rounded-full bg-[#205ca8]/60" />
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[860px] md:min-w-0">
              <div className={`grid ${COLS} border-b border-slate-300/70`}>
                <div className="hidden md:block" />
                {tiers.map((t) => (
                  <div key={t.level} className="px-3 pb-6 first:pl-0 md:pr-4">
                    <p className="font-bricolage text-lg font-bold leading-snug text-ink">{t.label}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{t.meaning}</p>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{t.guidance}</p>
                  </div>
                ))}
              </div>

              {catalogue?.families.map((f) => (
                <div key={f.key} id={f.key} className={`grid ${COLS} items-center border-b border-slate-200/70`}>
                  <div className="py-7 pr-4">
                    <p className="font-bricolage text-base font-bold leading-snug text-ink">{f.label}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{f.criteria}</p>
                  </div>
                  {tiers.map((t) => (
                    <div key={t.level} id={`ARC-${f.key}-L${t.level}`} className="flex items-center justify-center px-3 py-7">
                      {/* Only the classes the platform offers: Expert on exams, Distinguished as an honour. */}
                      {offered.has(`ARC-${f.key}-L${t.level}`) ? (
                        <div className="w-28 transition-transform duration-300 hover:-translate-y-1 lg:w-32">
                          <CredentialBadge family={f.key} level={t.level as BadgeLevel} />
                        </div>
                      ) : (
                        <span aria-hidden className="text-slate-300">—</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* PRINCIPLES — numbered editorial rows */}
        <section className="mt-20 lg:mt-28">
          <div className="mb-10 flex flex-col items-center space-y-3 text-center">
            <h2 className="font-serif text-3xl font-normal italic leading-snug tracking-tight text-ink sm:text-4xl">
              How it holds up.
            </h2>
            <span className="block h-0.5 w-10 rounded-full bg-[#205ca8]/60" />
          </div>
          <ol className="mx-auto max-w-3xl border-t border-slate-200/70">
            {PRINCIPLES.map((p, i) => (
              <motion.li
                key={p.title}
                initial={reduce ? undefined : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, ease: [0.215, 0.61, 0.355, 1] }}
                className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-slate-200/70 py-7 sm:gap-x-10"
              >
                <span className="pt-1 font-mono text-xs font-semibold tracking-wider text-slate-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-bricolage text-lg font-bold leading-snug text-ink sm:text-xl">{p.title}</p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{p.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* CLOSING ACTION */}
        <section className="mt-20 flex flex-col items-start gap-6 border-t border-slate-200/70 pt-10 lg:mt-28 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-2xl font-normal italic text-ink sm:text-3xl">Holding a credential ID?</p>
          <Link
            href="/credentials/verify"
            className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-3.5 text-sm font-medium tracking-wide text-on-ink shadow-sm transition-all duration-300 ease-out hover:bg-[#205ca8] hover:shadow-md"
          >
            <span>Verify a credential</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
              <ArrowUpRight className="h-3.5 w-3.5 text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </section>
      </main>
    </div>
  );
}
