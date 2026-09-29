"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps (public)
 *
 * The public credential page. Loads the credential and its live verification from the server —
 * the page never decides validity itself — and renders it for a recruiter, an admissions officer,
 * or anyone the holder sent the link to.
 * ------------------------------------------------------------------
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, SearchX } from "lucide-react";
import { ApiError } from "@/infrastructure/http/api";
import { credentialsApi, type BadgeTierInfo, type PublicBadge } from "@/domains/credentials";
import { CredentialView } from "@/apps/public/components/credentials/CredentialView";

type State =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: PublicBadge };

export function CredentialOrchestrator({ code }: { code: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [tiers, setTiers] = useState<BadgeTierInfo[]>([]);

  useEffect(() => {
    let cancelled = false;
    credentialsApi
      .publicBadge(code)
      .then((data) => !cancelled && setState({ kind: "ready", data }))
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 404) setState({ kind: "missing" });
        else setState({ kind: "error", message: e instanceof Error ? e.message : "Could not load this credential." });
      });
    credentialsApi
      .catalogue()
      .then((c) => !cancelled && setTiers(c.tiers))
      .catch(() => {
        // The level ladder is omitted.
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (state.kind === "loading") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" />
      </main>
    );
  }

  if (state.kind !== "ready") {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 pt-24 text-center">
        <SearchX size={34} className="text-slate-300" />
        <h1 className="mt-4 text-2xl font-black tracking-tight text-[#14142b] dark:text-white">
          {state.kind === "missing" ? "No public credential here" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {state.kind === "missing"
            ? "This credential ID does not exist, or its holder keeps it private. A private credential can still be checked by its ID."
            : state.message}
        </p>
        <Link
          href={`/credentials/verify?id=${encodeURIComponent(code)}`}
          className="mt-6 rounded-xl bg-[#14142b] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#23234a]"
        >
          Verify this ID
        </Link>
      </main>
    );
  }

  return <CredentialView data={state.data} tiers={tiers} />;
}
