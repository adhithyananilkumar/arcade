"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps (public)
 *
 * The public credential page, for badges (`ARC-…`) and certificates (`CERT-…`). Loads the credential
 * and its live verification from the server — the page never decides validity itself — and renders
 * it for a recruiter, an admissions officer, or anyone the holder sent the link to.
 * ------------------------------------------------------------------
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, SearchX } from "lucide-react";
import { ApiError } from "@/infrastructure/http/api";
import {
  credentialKindOf,
  credentialsApi,
  verifyPath,
  type BadgeTierInfo,
  type PublicBadge,
  type PublicCertificate,
} from "@/domains/credentials";
import { CredentialView } from "@/apps/public/components/credentials/CredentialView";
import { CertificateView } from "@/apps/public/components/credentials/CertificateView";

type State =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | { kind: "badge"; data: PublicBadge }
  | { kind: "certificate"; data: PublicCertificate };

export function CredentialOrchestrator({ code }: { code: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [tiers, setTiers] = useState<BadgeTierInfo[]>([]);
  const isCertificate = credentialKindOf(code) === "CERTIFICATE";

  useEffect(() => {
    let cancelled = false;
    const fail = (e: unknown) => {
      if (cancelled) return;
      if (e instanceof ApiError && e.status === 404) setState({ kind: "missing" });
      else setState({ kind: "error", message: e instanceof Error ? e.message : "Could not load this credential." });
    };
    if (isCertificate) {
      credentialsApi
        .publicCertificate(code)
        .then((data) => !cancelled && setState({ kind: "certificate", data }))
        .catch(fail);
    } else {
      credentialsApi
        .publicBadge(code)
        .then((data) => !cancelled && setState({ kind: "badge", data }))
        .catch(fail);
      credentialsApi
        .catalogue()
        .then((c) => !cancelled && setTiers(c.tiers))
        .catch(() => {
          // The level ladder is omitted.
        });
    }
    return () => {
      cancelled = true;
    };
  }, [code, isCertificate]);

  if (state.kind === "loading") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" />
      </main>
    );
  }

  if (state.kind === "badge") return <CredentialView data={state.data} tiers={tiers} />;
  if (state.kind === "certificate") return <CertificateView data={state.data} />;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 pt-24 text-center">
      <SearchX size={34} className="text-slate-300" />
      <h1 className="mt-4 text-2xl font-black tracking-tight text-ink">
        {state.kind === "missing" ? "No public credential here" : "Something went wrong"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {state.kind === "missing"
          ? "This credential ID does not exist, or its holder keeps it private. A private credential can still be checked by its ID."
          : state.message}
      </p>
      <Link href={verifyPath(code)} className="mt-6 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-on-ink hover:bg-[#23234a]">
        Verify this ID
      </Link>
    </main>
  );
}
