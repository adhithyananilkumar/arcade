"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps (public)
 *
 * "Is this credential real?" — for an employer holding only an ID from a CV. The answer is the
 * server's; this page asks and shows it. Works for private credentials too: the holder chose to
 * share the ID, so it verifies without exposing their public page.
 *
 * Styled like the Reach Us page: open editorial layout, serif headline, underline field, no cards.
 * ------------------------------------------------------------------
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight, Loader2 } from "lucide-react";
import "@/apps/public/landing.css";
import { CredentialBadge, credentialsApi, type BadgeLevel, type CredentialKind, type VerifyResult } from "@/domains/credentials";

const LOOK = {
  VALID: { title: "Valid", tag: "Verified", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  REVOKED: { title: "Revoked", tag: "Revoked", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  EXPIRED: { title: "Expired", tag: "Expired", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  TAMPERED: { title: "Failed verification", tag: "Failed", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
  NOT_FOUND: { title: "No such credential", tag: "Not found", text: "text-slate-600 dark:text-slate-300", dot: "bg-slate-400" },
} as const;

const NOUN: Record<CredentialKind, string> = {
  BADGE: "badge",
  CERTIFICATE: "certificate",
  GRADE_CARD: "grade card",
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.215, 0.61, 0.355, 1] },
  }),
};

const ASSURANCES = [
  { title: "Genuine", text: "Issued by Arcade and recorded at the time of award." },
  { title: "Current", text: "Shows if a credential has expired or been revoked." },
  { title: "Unaltered", text: "Details are checked against the sealed original." },
];

function heading(result: VerifyResult) {
  const look = LOOK[result.status];
  if (!result.kind || result.status === "NOT_FOUND" || result.status === "TAMPERED") return look.title;
  return `${look.title} ${NOUN[result.kind]}`;
}

export function VerifyCredentialOrchestrator() {
  const params = useSearchParams();
  const router = useRouter();
  const reduce = useReducedMotion();
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
  const anim = (i: number) => ({
    initial: reduce ? undefined : ("hidden" as const),
    animate: "visible" as const,
    custom: i,
    variants: fadeInUp,
  });

  return (
    <div className="landing-root relative flex min-h-[calc(100vh-140px)] flex-col justify-center px-6 pb-16 pt-28 font-sans text-ink selection:bg-blue-100 selection:text-blue-900 sm:px-12 sm:pt-32 lg:px-20 lg:pb-20 lg:pt-36 dark:selection:bg-blue-500/15 dark:selection:text-blue-200">
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

      <main className="mx-auto my-auto w-[84vw] max-w-[1400px]">
        <div className="flex flex-col gap-12 lg:gap-16">
          {/* What this page is */}
          <div className="mx-auto max-w-3xl text-center">
            <motion.p
              {...anim(0)}
              className="mb-5 font-mono text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Credential verification
            </motion.p>
            <motion.h1
              {...anim(1)}
              className="mb-8 font-serif text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[64px]"
            >
              <span className="font-bold">Is it</span>{" "}
              <span className="font-normal italic text-[#205ca8] dark:text-[#7cbaff]">real?</span>
            </motion.h1>
            <motion.p
              {...anim(2)}
              className="mx-auto max-w-xl text-base font-normal leading-relaxed text-slate-600 sm:text-lg"
            >
              Check that a badge, certificate or grade card is genuine, current and unaltered. No sign-in needed.
            </motion.p>

          </div>

          {/* The lookup and its answer */}
          <div className="mx-auto w-full max-w-2xl">
            <motion.div {...anim(2)} className="space-y-10">
              <div className="border-t border-slate-200/70 pt-8">
                <p className="text-sm leading-relaxed text-slate-500">
                  Printed on the document or beside the QR code. Badges start with{" "}
                  <span className="font-mono font-bold">ARC-</span>, certificates with{" "}
                  <span className="font-mono font-bold">CERT-</span>, grade cards with{" "}
                  <span className="font-mono font-bold">GC-</span>.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-7">
                <div className="space-y-2">
                  <label
                    htmlFor="credential-id"
                    className="block font-mono text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    Credential ID <span className="text-blue-600 dark:text-blue-400">*</span>
                  </label>
                  <input
                    id="credential-id"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="CERT-XXXX-XXXX-XXXX"
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full border-b border-slate-300 bg-transparent py-3 font-mono text-lg font-bold uppercase tracking-wider text-slate-900 transition-colors placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#205ca8] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={checking || !input.trim()}
                  className="group relative inline-flex items-center gap-3 rounded-full bg-ink px-8 py-3.5 text-sm font-medium tracking-wide text-on-ink shadow-sm transition-all duration-300 ease-out hover:bg-[#205ca8] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {checking ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify</span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
                        <ArrowUpRight className="h-3.5 w-3.5 text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </>
                  )}
                </button>
              </form>

              {error && (
                <p className="border-l-2 border-rose-400 pl-4 text-sm font-medium text-rose-700 dark:text-rose-300">
                  {error}
                </p>
              )}

              {result && look && (
                <motion.section
                  initial={reduce ? undefined : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  aria-live="polite"
                  className="space-y-6 border-t border-slate-200/70 pt-8"
                >
                  <div className="space-y-2">
                    <p className={`inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider ${look.text}`}>
                      <span className={`h-2 w-2 rounded-full ${look.dot}`} />
                      {look.tag}
                    </p>
                    <h3 className="font-serif text-3xl font-normal italic leading-snug text-ink sm:text-4xl">
                      {heading(result)}.
                    </h3>
                    <p className="max-w-lg text-sm leading-relaxed text-slate-600">{result.message}</p>
                  </div>

                  {!result.badgeClass && result.name && result.kind && (
                    <dl>
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
                  )}

                  {result.badgeClass && result.name && (
                    <div className="flex items-start gap-6">
                      <div className="w-24 shrink-0">
                        <CredentialBadge
                          family={result.badgeClass.family.key}
                          level={result.badgeClass.tier.level as BadgeLevel}
                          title={result.name}
                          stars={honourStars(result)}
                          revoked={result.status !== "VALID"}
                        />
                      </div>
                      <dl className="min-w-0 flex-1">
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
                      className="group inline-flex items-center gap-2 font-bricolage text-base font-bold text-ink transition-colors hover:text-[#205ca8] dark:hover:text-[#7cbaff]"
                    >
                      Open the full credential page
                      <ArrowUpRight className="h-4 w-4 text-slate-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#205ca8] dark:group-hover:text-[#7cbaff]" />
                    </Link>
                  )}
                  {!result.publicPage && result.status !== "NOT_FOUND" && result.kind !== "GRADE_CARD" && (
                    <p className="text-xs text-slate-500">The holder keeps this credential off their public profile.</p>
                  )}
                  {result.kind === "GRADE_CARD" && result.status !== "NOT_FOUND" && (
                    <p className="text-xs leading-relaxed text-slate-500">
                      Grade cards have no public page. Compare these facts with the document you were given; any
                      difference means the document was altered.
                    </p>
                  )}
                </motion.section>
              )}

              <ul className="border-t border-slate-200/70">
                {ASSURANCES.map((a, i) => (
                  <li key={a.title} className="grid grid-cols-[auto_1fr] gap-x-6 border-b border-slate-200/70 py-5 sm:gap-x-10">
                    <span className="pt-1 font-mono text-xs font-semibold tracking-wider text-slate-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-bricolage text-base font-bold leading-snug text-ink sm:text-lg">{a.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">{a.text}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="text-center text-xs text-slate-500 sm:text-sm">
                Want to know how credentials are awarded?{" "}
                <Link
                  href="/credentials/standards"
                  className="font-semibold text-[#205ca8] hover:underline dark:text-[#7cbaff]"
                >
                  Read the credential standards
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-200/70 py-3 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="shrink-0 font-mono text-xs font-semibold uppercase tracking-wider text-slate-500 sm:w-32">{label}</dt>
      <dd className="min-w-0 break-words text-base font-bold text-ink">{children}</dd>
    </div>
  );
}

/** An honour's rating, from the "Rating" detail the server reports ("4 of 5 stars"). */
function honourStars(result: VerifyResult): number | undefined {
  const rating = result.details.find((d) => d.label === "Rating")?.value;
  const n = rating ? parseInt(rating, 10) : NaN;
  return Number.isFinite(n) ? n : undefined;
}
