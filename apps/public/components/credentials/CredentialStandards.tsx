"use client";

/**
 * The public statement of the badge standard: three levels, three kinds of achievement, how each is
 * earned and how any badge can be checked. The levels' wording comes from the server catalogue.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { CredentialBadge, credentialsApi, type BadgeCatalogue, type BadgeLevel } from "@/domains/credentials";

export function CredentialStandards() {
  const [catalogue, setCatalogue] = useState<BadgeCatalogue | null>(null);

  useEffect(() => {
    credentialsApi.catalogue().then(setCatalogue).catch(() => setCatalogue(null));
  }, []);

  const tiers = catalogue ? [...catalogue.tiers].sort((a, b) => a.level - b.level) : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Arcade credentials</p>
      <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        One standard for every badge on Arcade
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
        Channels publish the content; Arcade issues the badge. Every badge is drawn, worded and levelled the same way,
        whoever taught the course or ran the event — so a Level 2 badge means the same thing everywhere, and every one of
        them can be verified.
      </p>

      <section className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-surface">
        <div className="grid border-b border-slate-100 md:grid-cols-[200px_repeat(3,1fr)]">
          <div className="hidden md:block" />
          {tiers.map((t) => (
            <div key={t.level} className="border-l border-slate-100 p-5">
              <p className="text-base font-bold text-slate-900">{t.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.meaning}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{t.guidance}</p>
            </div>
          ))}
        </div>
        {catalogue?.families.map((f) => (
          <div key={f.key} id={f.key} className="grid border-b border-slate-100 last:border-b-0 md:grid-cols-[200px_repeat(3,1fr)]">
            <div className="p-5">
              <p className="text-sm font-bold text-slate-900">{f.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.criteria}</p>
            </div>
            {tiers.map((t) => (
              <div
                key={t.level}
                id={`ARC-${f.key}-L${t.level}`}
                className="flex items-center justify-center border-l border-slate-100 bg-slate-50/60 p-5"
              >
                <div className="w-32">
                  <CredentialBadge family={f.key} level={t.level as BadgeLevel} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          ["Earned, never granted by hand", "Badges are issued automatically at 100% completion — every required lesson and assessment, a verified check-in, or a passed exam. Nobody can award one manually."],
          ["Sealed at issuance", "Each badge's facts — holder, content, level, issuer, date — are sealed with a server-side signature. Any later change to the record is detected on its public page."],
          ["Open to verify", "Every badge has a credential ID and a public page, and is published as an Open Badges 2.0 assertion that third-party verifiers can read."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-surface p-5">
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{body}</p>
          </div>
        ))}
      </section>

      <Link
        href="/credentials/verify"
        className="mt-10 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-on-ink hover:bg-[#23234a]"
      >
        <ShieldCheck size={16} /> Verify a credential
      </Link>
    </main>
  );
}
