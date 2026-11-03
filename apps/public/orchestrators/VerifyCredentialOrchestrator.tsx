"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps (public)
 *
 * "Is this credential real?" — for an employer holding only an ID from a CV. The answer is the
 * server's; this page asks and shows it. Works for private credentials too: the holder chose to
 * share the ID, so it verifies without exposing their public page.
 * ------------------------------------------------------------------
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Award, ClipboardList, Loader2, Search, ShieldAlert, ShieldCheck, ShieldQuestion, ShieldX, TimerOff } from "lucide-react";
import { CredentialBadge, credentialsApi, type BadgeLevel, type CredentialKind, type VerifyResult } from "@/domains/credentials";
import { cn } from "@/shared/utils/utils";

const LOOK = {
  VALID: { icon: ShieldCheck, title: "Valid", cls: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200" },
  REVOKED: { icon: ShieldAlert, title: "Revoked", cls: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200" },
  EXPIRED: { icon: TimerOff, title: "Expired", cls: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200" },
  TAMPERED: { icon: ShieldX, title: "Failed verification", cls: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200" },
  NOT_FOUND: { icon: ShieldQuestion, title: "No such credential", cls: "border-slate-200 bg-slate-50 text-slate-800" },
} as const;

const NOUN: Record<CredentialKind, string> = {
  BADGE: "badge",
  CERTIFICATE: "certificate",
  GRADE_CARD: "grade card",
};

function heading(result: VerifyResult) {
  const look = LOOK[result.status];
  if (!result.kind || result.status === "NOT_FOUND" || result.status === "TAMPERED") return look.title;
  return `${look.title} ${NOUN[result.kind]}`;
}

export function VerifyCredentialOrchestrator() {
  const params = useSearchParams();
  const router = useRouter();
  const fromUrl = params.get("id") ?? "";
  const [input, setInput] = useState(fromUrl);
  // Each lookup is its own request object, so checking the same ID twice still runs. The lookup
  // used to be keyed on the URL alone: submitting the ID already in the address bar left the URL
  // unchanged, the effect never re-ran, and the button spun forever.
  const [request, setRequest] = useState<{ code: string } | null>(fromUrl ? { code: fromUrl } : null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const checking = request !== null && result === null && error === null;

  // Back/forward or a link to another ID changes the URL without a submit.
  useEffect(() => {
    if (!fromUrl) return;
    setInput(fromUrl);
    setRequest((current) => (current?.code === fromUrl ? current : { code: fromUrl }));
  }, [fromUrl]);

  useEffect(() => {
    if (!request) return;
    let cancelled = false;
    setResult(null);
    setError(null);
    credentialsApi
      .verify(request.code)
      .then((r) => {
        if (!cancelled) setResult(r);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Verification is unavailable right now.");
      });
    return () => {
      cancelled = true;
    };
  }, [request]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = input.trim();
    if (!id) return;
    setRequest({ code: id });
    // Keeps the address shareable; the lookup itself no longer depends on it.
    router.replace(`/credentials/verify?id=${encodeURIComponent(id)}`, { scroll: false });
  };

  const look = result ? LOOK[result.status] : null;
  const Icon = look?.icon ?? ShieldCheck;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <header className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          <ShieldCheck size={13} className="text-[#2962D6] dark:text-[#7eb5ff]" />
          Credential verification
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-[2.5rem] sm:leading-tight">
          Verify an Arcade credential
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500">
          Confirm that a badge, certificate or grade card is genuine, current and unaltered. No sign-in needed.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="mt-9 rounded-2xl border border-slate-200/80 bg-surface p-4 shadow-[0_8px_30px_rgba(20,20,43,0.05)] sm:p-5"
      >
        <label htmlFor="credential-id" className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Credential ID
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="credential-id"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="CERT-XXXX-XXXX-XXXX"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl border border-slate-200 bg-surface py-3 pl-11 pr-4 font-mono text-sm font-bold uppercase tracking-wider text-slate-900 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-400 focus:border-[#2962D6] focus:outline-none focus:ring-2 focus:ring-[#2962D6]/20"
            />
          </div>
          <button
            type="submit"
            disabled={checking || !input.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-on-ink transition hover:bg-ink-hover disabled:opacity-50"
          >
            {checking ? <Loader2 size={16} className="animate-spin" /> : "Verify"}
          </button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Found printed on the document or beside the QR code. Badges start with{" "}
          <span className="font-mono font-bold">ARC-</span>, certificates with{" "}
          <span className="font-mono font-bold">CERT-</span> and grade cards with{" "}
          <span className="font-mono font-bold">GC-</span>.
        </p>
      </form>

      {error && <p className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}

      {result && look && (
        <section className={cn("mt-6 rounded-2xl border p-5 sm:p-6", look.cls)} aria-live="polite">
          <div className="flex items-start gap-3">
            <Icon size={24} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-lg font-black">{heading(result)}</p>
              <p className="mt-1 text-sm opacity-80">{result.message}</p>
            </div>
          </div>

          {!result.badgeClass && result.name && result.kind && (
            <div className="mt-5 flex items-start gap-4 rounded-2xl bg-surface/80 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-on-ink">
                {result.kind === "GRADE_CARD" ? <ClipboardList size={20} /> : <Award size={20} />}
              </span>
              <dl className="grid min-w-0 flex-1 gap-x-4 gap-y-1.5 text-sm text-slate-800 sm:grid-cols-2">
                <Row label={result.subtitle ?? "Credential"}>{result.name}</Row>
                <Row label="Holder">{result.recipientName}</Row>
                <Row label="Issuer">{result.issuerName}</Row>
                {result.issuedAt && <Row label="Issued">{new Date(result.issuedAt).toLocaleDateString()}</Row>}
                {result.expiresAt && <Row label="Valid until">{new Date(result.expiresAt).toLocaleDateString()}</Row>}
                {result.details
                  .filter((d) => d.label !== "Type")
                  .map((d) => (
                    <Row key={d.label} label={d.label}>
                      {d.value}
                    </Row>
                  ))}
                <Row label="ID">
                  <span className="font-mono">{result.credentialCode}</span>
                </Row>
              </dl>
            </div>
          )}

          {result.badgeClass && result.name && (
            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-surface/80 p-4">
              <div className="w-20 shrink-0">
                <CredentialBadge
                  family={result.badgeClass.family.key}
                  level={result.badgeClass.tier.level as BadgeLevel}
                  title={result.name}
                  stars={honourStars(result)}
                  revoked={result.status !== "VALID"}
                />
              </div>
              <dl className="grid min-w-0 flex-1 gap-x-4 gap-y-1.5 text-sm text-slate-800 sm:grid-cols-2">
                <Row label="Credential">{result.name}</Row>
                <Row label="Level">{result.badgeClass.tier.label}</Row>
                <Row label="Holder">{result.recipientName}</Row>
                <Row label="Issuer">{result.issuerName}</Row>
                {result.issuedAt && <Row label="Issued">{new Date(result.issuedAt).toLocaleDateString()}</Row>}
                <Row label="ID">
                  <span className="font-mono">{result.credentialCode}</span>
                </Row>
              </dl>
            </div>
          )}

          {result.publicPage && result.publicPath && result.status !== "NOT_FOUND" && (
            <Link
              href={result.publicPath}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#2962D6] hover:underline dark:text-[#7eb5ff]"
            >
              Open the full credential page <ArrowRight size={14} />
            </Link>
          )}
          {!result.publicPage && result.status !== "NOT_FOUND" && result.kind !== "GRADE_CARD" && (
            <p className="mt-4 text-xs opacity-70">The holder keeps this credential off their public profile.</p>
          )}
          {result.kind === "GRADE_CARD" && result.status !== "NOT_FOUND" && (
            <p className="mt-4 text-xs opacity-70">
              Grade cards have no public page. Compare these facts with the document you were given; any difference means
              the document was altered.
            </p>
          )}
        </section>
      )}
      {!result && !error && !checking && (
        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Genuine", text: "Issued by Arcade and recorded at the time of award." },
            { icon: TimerOff, title: "Current", text: "Shows if a credential has expired or been revoked." },
            { icon: ShieldX, title: "Unaltered", text: "Details are checked against the sealed original." },
          ].map(({ icon: I, title, text }) => (
            <li key={title} className="rounded-2xl border border-slate-200/80 bg-surface p-4">
              <I size={18} className="text-[#2962D6] dark:text-[#7eb5ff]" />
              <p className="mt-2 text-sm font-bold text-ink">{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{text}</p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-center text-xs text-slate-500">
        Want to know how credentials are awarded?{" "}
        <Link href="/credentials/standards" className="font-semibold text-[#2962D6] hover:underline dark:text-[#7eb5ff]">
          Read the credential standards
        </Link>
      </p>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</dt>
      <dd className="break-words font-bold">{children}</dd>
    </div>
  );
}

/** An honour's rating, from the "Rating" detail the server reports ("4 of 5 stars"). */
function honourStars(result: VerifyResult): number | undefined {
  const rating = result.details.find((d) => d.label === "Rating")?.value;
  const n = rating ? parseInt(rating, 10) : NaN;
  return Number.isFinite(n) ? n : undefined;
}
