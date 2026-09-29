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
import { ArrowRight, Loader2, Search, ShieldAlert, ShieldCheck, ShieldQuestion, ShieldX } from "lucide-react";
import { CredentialBadge, credentialPath, credentialsApi, type BadgeLevel, type VerifyResult } from "@/domains/credentials";
import { cn } from "@/shared/utils/utils";

const LOOK = {
  VALID: { icon: ShieldCheck, title: "Valid credential", cls: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  REVOKED: { icon: ShieldAlert, title: "Revoked credential", cls: "border-amber-200 bg-amber-50 text-amber-900" },
  TAMPERED: { icon: ShieldX, title: "Failed verification", cls: "border-rose-200 bg-rose-50 text-rose-900" },
  NOT_FOUND: { icon: ShieldQuestion, title: "No such credential", cls: "border-slate-200 bg-slate-50 text-slate-800" },
} as const;

export function VerifyCredentialOrchestrator() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("id") ?? "";
  const [input, setInput] = useState(initial);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [checking, setChecking] = useState(Boolean(initial));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initial) return;
    let cancelled = false;
    credentialsApi
      .verify(initial)
      .then((r) => !cancelled && setResult(r))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Verification is unavailable right now."))
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [initial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = input.trim();
    if (!id) return;
    setResult(null);
    setError(null);
    setChecking(true);
    router.replace(`/credentials/verify?id=${encodeURIComponent(id)}`);
  };

  const look = result ? LOOK[result.status] : null;
  const Icon = look?.icon ?? ShieldCheck;

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-24 pt-28 sm:px-6">
      <div className="text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14142b] text-white shadow-lg">
          <ShieldCheck size={22} />
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-[#14142b] dark:text-white sm:text-4xl">Verify a credential</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          Enter the credential ID printed on an Arcade badge or certificate, e.g. <span className="font-mono font-bold">ARC-7KQ2-M9XD-4TPA</span>.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Credential ID</span>
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ARC-XXXX-XXXX-XXXX"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 font-mono text-sm font-bold uppercase tracking-wider text-slate-900 shadow-sm placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#2962D6] focus:outline-none focus:ring-2 focus:ring-[#2962D6]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <button
          type="submit"
          disabled={checking || !input.trim()}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#14142b] px-5 text-sm font-bold text-white hover:bg-[#23234a] disabled:opacity-50"
        >
          {checking ? <Loader2 size={16} className="animate-spin" /> : "Verify"}
        </button>
      </form>

      {error && <p className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

      {result && look && (
        <section className={cn("mt-8 rounded-3xl border p-5 sm:p-6", look.cls)} aria-live="polite">
          <div className="flex items-start gap-3">
            <Icon size={24} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-lg font-black">{look.title}</p>
              <p className="mt-1 text-sm opacity-80">{result.message}</p>
            </div>
          </div>

          {result.badgeClass && result.name && (
            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-white/80 p-4">
              <div className="w-20 shrink-0">
                <CredentialBadge
                  family={result.badgeClass.family.key}
                  level={result.badgeClass.tier.level as BadgeLevel}
                  title={result.name}
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

          {result.publicPage && result.status !== "NOT_FOUND" && (
            <Link
              href={credentialPath(result.credentialCode)}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#2962D6] hover:underline"
            >
              Open the full credential page <ArrowRight size={14} />
            </Link>
          )}
          {!result.publicPage && result.status !== "NOT_FOUND" && (
            <p className="mt-4 text-xs opacity-70">The holder keeps this credential off their public profile.</p>
          )}
        </section>
      )}
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</dt>
      <dd className="truncate font-bold">{children}</dd>
    </div>
  );
}
