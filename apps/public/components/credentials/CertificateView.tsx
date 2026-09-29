"use client";

/**
 * The public certificate page body: verification first (is this real?), then the certificate as it
 * looks, then who earned what from whom. Presentational apart from the download and copy actions;
 * the orchestrator loads the data and the server decides validity.
 */

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Award, Building2, Calendar, Check, Copy, Download, Fingerprint, Loader2, Share2, ShieldAlert, ShieldCheck, ShieldX,
  TimerOff, User,
} from "lucide-react";
import {
  CertificateFace,
  LinkedInGlyph,
  credentialPath,
  credentialsApi,
  linkedInAddToProfileUrl,
  linkedInShareUrl,
  verifyPath,
  type PublicCertificate,
} from "@/domains/credentials";
import { cn } from "@/shared/utils/utils";

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

const STATUS = {
  VALID: {
    icon: ShieldCheck,
    title: "Verified certificate",
    box: "border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
    iconBox: "bg-emerald-600 text-white",
  },
  REVOKED: {
    icon: ShieldAlert,
    title: "This certificate has been revoked",
    box: "border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
    iconBox: "bg-amber-500 text-white",
  },
  EXPIRED: {
    icon: TimerOff,
    title: "This certificate has expired",
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

const secondary =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

export function CertificateView({ data }: { data: PublicCertificate }) {
  const { certificate: c, verification } = data;
  const status = STATUS[verification.status];
  const StatusIcon = status.icon;
  const valid = verification.status === "VALID";

  const [copied, setCopied] = useState<"id" | "link" | null>(null);
  const [downloading, setDownloading] = useState(false);
  const url =
    typeof window === "undefined" ? credentialPath(c.credentialCode) : `${window.location.origin}${credentialPath(c.credentialCode)}`;

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
      await credentialsApi.downloadPublicCertificate(c.credentialCode);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const checks: { label: string; ok: boolean; detail: string }[] = [
    { label: "Issuer", ok: true, detail: `Arcade, on behalf of ${c.issuerName}` },
    {
      label: "Record integrity",
      ok: verification.signatureValid,
      detail: verification.signatureValid
        ? `Sealed at issuance (${verification.signatureAlgorithm}); unchanged since`
        : "Does not match the seal it was issued with",
    },
    {
      label: "Status",
      ok: valid,
      detail: c.revoked
        ? `Revoked ${c.revokedAt ? longDate(c.revokedAt) : ""}`
        : c.expired && c.expiresAt
          ? `Expired ${longDate(c.expiresAt)}`
          : c.expiresAt
            ? `Active — valid until ${longDate(c.expiresAt)}`
            : "Active — not revoked, does not expire",
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
              {checks.map((k) => (
                <li key={k.label} className="rounded-2xl bg-white/70 px-3 py-2 dark:bg-slate-950/40">
                  <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] opacity-70">
                    {k.ok ? <Check size={11} strokeWidth={3} className="text-emerald-600" /> : <ShieldX size={11} className="text-rose-600" />}
                    {k.label}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold leading-snug">{k.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── The certificate ── */}
        <section className="rounded-[2rem] border border-slate-200/80 bg-slate-50 p-3 shadow-[0_20px_60px_rgba(20,20,43,0.08)] dark:border-slate-800 dark:bg-slate-900/60 sm:p-6">
          <CertificateFace certificate={c} className="mx-auto max-w-4xl shadow-xl" />
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/95 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{c.documentTitle}</p>
            <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-[#14142b] dark:text-white sm:text-3xl">{c.title}</h1>
            {c.programme && <p className="mt-1 text-sm text-slate-500">{c.programme}</p>}

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <Fact icon={User} label="Awarded to">
                {c.recipientHandle ? (
                  <Link href={`/${c.recipientHandle}`} className="hover:underline">
                    {c.recipientName}
                  </Link>
                ) : (
                  c.recipientName
                )}
              </Fact>
              <Fact icon={Building2} label="Issued by">
                {c.issuerHandle ? (
                  <Link href={`/${c.issuerHandle}`} className="hover:underline">
                    {c.issuerName}
                  </Link>
                ) : (
                  c.issuerName
                )}
                <span className="block text-xs font-medium text-slate-500">through Arcade</span>
              </Fact>
              <Fact icon={Calendar} label="Awarded on">
                {longDate(c.achievedAt)}
              </Fact>
              {c.scorePercent != null && (
                <Fact icon={Award} label="Result">
                  {Number(c.scorePercent.toFixed(2))}%
                  {c.passPercent != null && (
                    <span className="block text-xs font-medium text-slate-500">Pass mark {Number(c.passPercent.toFixed(2))}%</span>
                  )}
                </Fact>
              )}
              <Fact icon={Fingerprint} label="Credential ID">
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-mono tracking-wider">{c.credentialCode}</span>
                  <button
                    type="button"
                    onClick={() => copy(c.credentialCode, "id")}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    aria-label="Copy credential ID"
                  >
                    {copied === "id" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                </span>
              </Fact>
            </dl>

            <p className="mt-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{c.criteria}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {valid && (
                <>
                  <a
                    href={linkedInAddToProfileUrl({ credentialCode: c.credentialCode, name: c.title, issuedAt: c.issuedAt, url })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0958a8]"
                  >
                    <LinkedInGlyph size={14} /> Add to LinkedIn profile
                  </a>
                  <a href={linkedInShareUrl(url)} target="_blank" rel="noopener noreferrer" className={secondary}>
                    <Share2 size={14} /> Share post
                  </a>
                </>
              )}
              <button type="button" onClick={() => copy(url, "link")} className={secondary}>
                {copied === "link" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />} Copy link
              </button>
              <button type="button" onClick={download} disabled={downloading} className={secondary}>
                {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download PDF
              </button>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/95 sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-black tracking-tight text-[#14142b] dark:text-white">
              <ShieldCheck size={15} className="text-slate-400" /> Verifying this certificate
            </h2>
            <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">1.</strong> This page is served by Arcade, and every fact on
                it is read from Arcade&apos;s record at the moment you open it.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">2.</strong> The record was sealed when it was issued; any
                later edit to it shows here as a failed verification.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">3.</strong> A printed or PDF copy carries the ID{" "}
                <span className="font-mono font-bold">{c.credentialCode}</span> and a QR code leading back here. Anyone can check
                the ID at{" "}
                <Link href={verifyPath(c.credentialCode)} className="font-bold text-[#2962D6] hover:underline">
                  arcade · verify
                </Link>
                . If a copy disagrees with this page, trust this page.
              </li>
            </ol>
          </section>
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
