"use client";

/**
 * The credential page body: verification first (is this real?), then who earned what, from whom,
 * at which level, what that level means, and what the content was. Presentational; the orchestrator
 * loads the data.
 */

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Award, BadgeCheck, Building2, Calendar, Check, Copy, Download, ExternalLink, FileJson, Fingerprint,
  Loader2, Share2, ShieldAlert, ShieldCheck, ShieldX, User,
} from "lucide-react";
import { API_ORIGIN } from "@/infrastructure/config/env";
import {
  CredentialBadge,
  LinkedInGlyph,
  TIER_STYLE,
  TierLadder,
  credentialPath,
  downloadBadgeImage,
  linkedInAddToProfileUrl,
  linkedInShareUrl,
  openBadgesAssertionUrl,
  xShareUrl,
  type BadgeLevel,
  type BadgeTierInfo,
  type PublicBadge,
} from "@/domains/credentials";
import { cn } from "@/shared/utils/utils";

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

const STATUS = {
  VALID: {
    icon: ShieldCheck,
    title: "Verified credential",
    box: "border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
    iconBox: "bg-emerald-600 text-white",
  },
  REVOKED: {
    icon: ShieldAlert,
    title: "This credential has been revoked",
    box: "border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
    iconBox: "bg-amber-500 text-white",
  },
  TAMPERED: {
    icon: ShieldX,
    title: "This record failed verification",
    box: "border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
    iconBox: "bg-rose-600 text-white",
  },
} as const;

export function CredentialView({ data, tiers }: { data: PublicBadge; tiers: BadgeTierInfo[] }) {
  const { badge, content, verification } = data;
  const level = badge.badgeClass.tier.level as BadgeLevel;
  const family = badge.badgeClass.family.key;
  const style = TIER_STYLE[level];
  const status = STATUS[verification.status];
  const StatusIcon = status.icon;
  const valid = verification.status === "VALID";
  const tier = tiers.find((t) => t.level === level) ?? badge.badgeClass.tier;

  const [copied, setCopied] = useState<"id" | "link" | null>(null);
  const [downloading, setDownloading] = useState(false);
  const url = typeof window === "undefined" ? credentialPath(badge.credentialCode) : `${window.location.origin}${credentialPath(badge.credentialCode)}`;

  const copy = async (text: string, what: "id" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      toast.error("Could not copy to the clipboard");
    }
  };

  const download = async () => {
    setDownloading(true);
    try {
      await downloadBadgeImage(family, level, badge.name, `${badge.name} - Arcade Level ${level} badge`, "png");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const checks: { label: string; ok: boolean; detail: string }[] = [
    { label: "Issuer", ok: true, detail: `Arcade, on behalf of ${badge.issuerName}` },
    {
      label: "Record integrity",
      ok: verification.signatureValid,
      detail: verification.signatureValid
        ? `Sealed at issuance (${verification.signatureAlgorithm}); unchanged since`
        : "Does not match the seal it was issued with",
    },
    {
      label: "Status",
      ok: !badge.revoked,
      detail: badge.revoked ? `Revoked ${badge.revokedAt ? longDate(badge.revokedAt) : ""}` : "Active — not revoked",
    },
  ];

  return (
    <main className="relative min-h-screen w-full pb-24 pt-24 sm:pt-28">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
        {/* ── Verification ── */}
        <section className={cn("rounded-3xl border p-4 sm:p-5", status.box)} aria-live="polite">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm", status.iconBox)}>
                <StatusIcon size={20} />
              </span>
              <div>
                <p className="text-sm font-black">{status.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed opacity-80">{verification.message}</p>
              </div>
            </div>
            <ul className="grid gap-2 sm:grid-cols-3 lg:min-w-[560px]">
              {checks.map((c) => (
                <li key={c.label} className="rounded-2xl bg-white/70 px-3 py-2 dark:bg-slate-950/40">
                  <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] opacity-70">
                    {c.ok ? <Check size={11} strokeWidth={3} className="text-emerald-600" /> : <ShieldX size={11} className="text-rose-600" />}
                    {c.label}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold leading-snug">{c.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── The credential ── */}
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_rgba(20,20,43,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div className="grid lg:grid-cols-[400px_1fr]">
            <div className="relative flex flex-col items-center justify-center border-b border-slate-100 bg-slate-50 px-8 py-10 dark:border-slate-800 dark:bg-slate-900/60 lg:border-b-0 lg:border-r">
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-60 drop-shadow-2xl sm:w-64"
              >
                <CredentialBadge family={family} level={level} title={badge.name} revoked={!valid} label={`${badge.badgeClass.name} — ${badge.name}`} />
              </motion.div>
              <p className="relative mt-4 font-mono text-[11px] font-bold tracking-wider text-slate-500">{badge.badgeClass.code}</p>
            </div>

            <div className="flex flex-col p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{badge.badgeClass.family.label}</span>
                <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", style.chip)}>{badge.badgeClass.tier.label}</span>
              </div>
              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#14142b] dark:text-white sm:text-4xl">{badge.name}</h1>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <Fact icon={User} label="Awarded to">
                  {badge.recipientHandle ? (
                    <Link href={`/${badge.recipientHandle}`} className="hover:underline">
                      {badge.recipientName}
                    </Link>
                  ) : (
                    badge.recipientName
                  )}
                </Fact>
                <Fact icon={Building2} label="Issued by">
                  <span className="inline-flex items-center gap-2">
                    {content.issuerLogoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={content.issuerLogoUrl} alt="" className="h-5 w-5 rounded-md object-cover" />
                    )}
                    {badge.issuerHandle ? (
                      <Link href={`/${badge.issuerHandle}`} className="hover:underline">
                        {badge.issuerName}
                      </Link>
                    ) : (
                      badge.issuerName
                    )}
                  </span>
                  <span className="block text-xs font-medium text-slate-500">through Arcade</span>
                </Fact>
                <Fact icon={Calendar} label="Issued on">
                  {longDate(badge.issuedAt)}
                </Fact>
                <Fact icon={Fingerprint} label="Credential ID">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-mono tracking-wider">{badge.credentialCode}</span>
                    <button
                      type="button"
                      onClick={() => copy(badge.credentialCode, "id")}
                      className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                      aria-label="Copy credential ID"
                    >
                      {copied === "id" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                  </span>
                </Fact>
              </dl>

              {valid && (
                <div className="mt-auto flex flex-wrap gap-2 pt-8">
                  <a
                    href={linkedInAddToProfileUrl({ credentialCode: badge.credentialCode, name: badge.name, issuedAt: badge.issuedAt, url })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0958a8]"
                  >
                    <LinkedInGlyph size={14} /> Add to LinkedIn profile
                  </a>
                  <a
                    href={linkedInShareUrl(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <Share2 size={14} /> Share post
                  </a>
                  <a
                    href={xShareUrl(url, `I earned the Arcade Level ${level} badge for ${badge.name}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    Post on X
                  </a>
                  <button
                    type="button"
                    onClick={() => copy(url, "link")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {copied === "link" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />} Copy link
                  </button>
                  <button
                    type="button"
                    onClick={download}
                    disabled={downloading}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Badge image
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            {/* ── What it certifies ── */}
            <Card title="What this badge certifies" icon={BadgeCheck}>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{badge.criteria}</p>
              <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-semibold text-slate-500">{tier.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{tier.meaning}</p>
                <p className="mt-1 text-xs text-slate-500">{tier.guidance}</p>
              </div>
            </Card>

            {/* ── The content ── */}
            <Card title={`About the ${badge.contentType.toLowerCase()}`} icon={Award}>
              <div className="flex flex-col gap-4 sm:flex-row">
                {content.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={content.imageUrl} alt="" className="h-32 w-full rounded-2xl object-cover sm:w-48" />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-black tracking-tight text-[#14142b] dark:text-white">{content.title}</h3>
                  {content.summary && <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{content.summary}</p>}
                  {content.highlights.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {content.highlights.map((h) => (
                        <span key={h} className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                  {content.available && content.path ? (
                    <Link href={content.path} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#2962D6] hover:underline">
                      View on Arcade <ExternalLink size={11} />
                    </Link>
                  ) : (
                    <p className="mt-3 text-xs text-slate-500">This content is no longer offered. The credential still stands.</p>
                  )}
                </div>
              </div>
            </Card>

            {/* ── How to verify ── */}
            <Card title="Verifying this credential" icon={ShieldCheck}>
              <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">1.</strong> This page is served by Arcade, and every
                  fact on it is read from Arcade&apos;s record at the moment you open it.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">2.</strong> Anyone can check the ID{" "}
                  <span className="font-mono font-bold">{badge.credentialCode}</span> at{" "}
                  <Link href={`/credentials/verify?id=${encodeURIComponent(badge.credentialCode)}`} className="font-bold text-[#2962D6] hover:underline">
                    arcade · verify
                  </Link>
                  .
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">3.</strong> It is also published as an Open Badges 2.0
                  assertion any compatible verifier can read.
                </li>
              </ol>
              <a
                href={openBadgesAssertionUrl(API_ORIGIN, badge.credentialCode)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <FileJson size={13} /> Open Badges assertion (JSON)
              </a>
            </Card>
          </div>

          {/* ── The ladder ── */}
          <div>
            <Card title="The Arcade level standard" icon={Award}>
              <p className="mb-3 text-xs leading-relaxed text-slate-500">
                Every Arcade badge is issued at one of three levels, defined centrally and identical for every
                channel. <Link href="/credentials/standards" className="font-bold text-[#2962D6] hover:underline">About the standard</Link>
              </p>
              {tiers.length > 0 ? (
                <TierLadder tiers={tiers} family={family} current={level} compact />
              ) : (
                <p className="text-xs text-slate-400">Loading levels…</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function Fact({ icon: Icon, label, children }: { icon: typeof User; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</dt>
        <dd className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">{children}</dd>
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/95 sm:p-6">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-black tracking-tight text-[#14142b] dark:text-white">
        <Icon size={15} className="text-slate-400" /> {title}
      </h2>
      {children}
    </section>
  );
}
