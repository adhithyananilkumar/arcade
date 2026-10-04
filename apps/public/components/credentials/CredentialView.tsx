"use client";

/**
 * Arcade Frontend Architecture
 * Layer: Apps (public)
 *
 * Unified Digital Credential Showcase:
 * Serves as the single, synchronized view component for both Badges and Certificates
 * across public pages, Copy Link, and Share Link targets.
 */

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Check, Copy, Download, Loader2, Share2, ArrowUpRight
} from "lucide-react";
import "@/apps/public/landing.css";
import {
  CredentialBadge,
  CertificateFace,
  LinkedInGlyph,
  credentialPath,
  credentialsApi,
  downloadBadgeImage,
  linkedInAddToProfileUrl,
  linkedInShareUrl,
  xShareUrl,
  type BadgeLevel,
  type BadgeTierInfo,
  type PublicBadge,
  type PublicCertificate,
} from "@/domains/credentials";

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export function CredentialView({
  data,
  tiers = [],
}: {
  data: PublicBadge | PublicCertificate;
  tiers?: BadgeTierInfo[];
}) {
  const isBadge = "badge" in data;
  const badge = isBadge ? data.badge : null;
  const cert = !isBadge ? data.certificate : null;
  const verification = data.verification;
  const valid = verification.status === "VALID";

  const credentialCode = isBadge ? badge!.credentialCode : cert!.credentialCode;
  const name = isBadge ? badge!.name : cert!.title;
  const recipientName = isBadge ? badge!.recipientName : cert!.recipientName;
  const recipientHandle = isBadge ? badge!.recipientHandle : cert!.recipientHandle;
  const issuerName = isBadge ? badge!.issuerName : cert!.issuerName;
  const issuedAt = isBadge ? badge!.issuedAt : (cert!.achievedAt || cert!.issuedAt);
  const criteria = isBadge ? badge!.criteria : cert!.criteria;

  const level = isBadge ? (badge!.badgeClass.tier.level as BadgeLevel) : null;
  const family = isBadge ? badge!.badgeClass.family.key : null;
  const tier = isBadge
    ? (tiers.find((t) => t.level === level) ?? badge!.badgeClass.tier)
    : null;

  const eyebrowText = isBadge ? `Level ${level}` : cert!.documentTitle;

  const [copied, setCopied] = useState<"id" | "link" | null>(null);
  const [downloading, setDownloading] = useState(false);

  const url =
    typeof window === "undefined"
      ? credentialPath(credentialCode)
      : `${window.location.origin}${credentialPath(credentialCode)}`;

  const copy = async (text: string, what: "id" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      toast.success(what === "id" ? "Credential ID copied" : "Credential link copied");
      setTimeout(() => setCopied(null), 1800);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const download = async () => {
    setDownloading(true);
    try {
      if (isBadge) {
        await downloadBadgeImage(
          family!,
          level!,
          name,
          `${name} - Arcade Level ${level} badge`,
          "png",
          badge!.issuerLogoUrl
        );
      } else {
        await credentialsApi.downloadPublicCertificate(cert!.credentialCode);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="landing-root relative min-h-screen w-full text-[#0f172a] font-sans py-8 sm:py-12 px-6 sm:px-12 lg:px-20 selection:bg-blue-100 selection:text-blue-900">
      
      {/* ATMOSPHERIC PASTEL BACKDROP (EXACT MATCH FOR REACH US PAGE) */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundColor: "#FAFBFD",
          backgroundImage: `
            radial-gradient(ellipse 70% 40% at 50% 0%, rgba(224, 236, 255, 0.25) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 10% 25%, rgba(233, 225, 254, 0.20) 0%, transparent 65%),
            radial-gradient(ellipse 60% 40% at 90% 75%, rgba(253, 232, 240, 0.18) 0%, transparent 65%),
            linear-gradient(
              180deg,
              #FAFBFD 0%,
              #F6F8FD 35%,
              #F8F6FD 70%,
              #FAF9FB 100%
            )
          `,
        }}
      />

      <div className="w-[84vw] max-w-[1200px] mx-auto space-y-8 sm:space-y-10">

        {/* HERO SHOWCASE */}
        <section className="relative space-y-8 sm:space-y-10">

          {/* Image Artwork Focal Point */}
          <div className="flex flex-col items-center justify-center pt-6 sm:pt-10 md:pt-12">
            {isBadge ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.03 }}
                className="relative w-44 sm:w-52 md:w-56 cursor-pointer drop-shadow-[0_15px_25px_rgba(0,0,0,0.08)]"
              >
                <CredentialBadge
                  family={family!}
                  level={level!}
                  title={name}
                  issuerLogoUrl={badge!.issuerLogoUrl}
                  revoked={!valid}
                  label={`${badge!.badgeClass.name} — ${name}`}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-3xl drop-shadow-[0_15px_25px_rgba(0,0,0,0.08)]"
              >
                <CertificateFace certificate={cert!} className="w-full" />
              </motion.div>
            )}
          </div>

          {/* Typography & Achievement Statement (Exact Reach Us Serif & Mono Style) */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            
            {/* Level / Document Eyebrow Text */}
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#205ca8] font-bold">
                {eyebrowText}
              </span>
            </div>

            {/* Course Title (Black/Deep Navy bold serif) */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] tracking-tight leading-[1.1] font-serif font-bold text-[#0B132B]">
              {name}
            </h1>

            {/* Recipient Honor Line (Serif Italic matching "Tell us what's on your mind.") */}
            <div className="pt-2 space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                CONFERRED UPON
              </p>
              <p className="text-3xl sm:text-4xl font-serif italic text-[#0B132B] tracking-tight leading-snug">
                {recipientHandle ? (
                  <Link href={`/${recipientHandle}`} className="hover:text-[#205ca8] transition-colors inline-flex items-center gap-1.5">
                    <span>{recipientName}</span>
                    <ArrowUpRight className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                  </Link>
                ) : (
                  recipientName
                )}
              </p>
            </div>
          </div>

          {/* Horizontal Spec Divider & Editorial Details */}
          <div className="pt-4 border-t border-b border-slate-200/70 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
              
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  ISSUED BY
                </p>
                <p className="text-base sm:text-lg font-bold text-[#0B132B] font-bricolage leading-snug">
                  {issuerName} <span className="text-xs font-normal text-slate-500 font-sans">via Arcade</span>
                </p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200/70 sm:pl-6">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  DATE OF ISSUANCE
                </p>
                <p className="text-base sm:text-lg font-bold text-[#0B132B] font-bricolage leading-snug">
                  {longDate(issuedAt)}
                </p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200/70 sm:pl-6">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  CREDENTIAL IDENTIFICATION
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <span className="font-mono text-sm font-bold text-[#0B132B]">
                    {credentialCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(credentialCode, "id")}
                    className="p-1 text-slate-400 hover:text-[#205ca8] transition-colors"
                    title="Copy Credential ID"
                  >
                    {copied === "id" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Reach Us Style Editorial Action Buttons */}
          {valid && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={linkedInAddToProfileUrl({ credentialCode, name, issuedAt, url })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0B132B] hover:bg-[#205ca8] text-white font-medium text-xs tracking-wide shadow-sm hover:shadow-md transition-all group"
              >
                <LinkedInGlyph size={14} />
                <span>Add to LinkedIn Profile</span>
                <span className="w-4 h-4 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-3 h-3 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </a>
              <a
                href={linkedInShareUrl(url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-300/80 bg-white/80 hover:border-[#205ca8] hover:text-[#205ca8] text-slate-700 font-medium text-xs transition-all shadow-sm"
              >
                <Share2 size={13} />
                <span>Share Post</span>
              </a>
              <a
                href={xShareUrl(
                  url,
                  isBadge
                    ? `I earned the Arcade Level ${level} badge for ${name}`
                    : `I earned the Arcade certification for ${name}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-300/80 bg-white/80 hover:border-[#205ca8] hover:text-[#205ca8] text-slate-700 font-medium text-xs transition-all shadow-sm"
              >
                <span>Post on X</span>
              </a>
              <button
                type="button"
                onClick={() => copy(url, "link")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-300/80 bg-white/80 hover:border-[#205ca8] hover:text-[#205ca8] text-slate-700 font-medium text-xs transition-all shadow-sm"
              >
                {copied === "link" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>Copy Link</span>
              </button>
              <button
                type="button"
                onClick={download}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-300/80 bg-white/80 hover:border-[#205ca8] hover:text-[#205ca8] text-slate-700 font-medium text-xs transition-all shadow-sm disabled:opacity-50"
              >
                {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                <span>{isBadge ? "Badge Image" : "Download PDF"}</span>
              </button>
            </div>
          )}

        </section>

        {/* Editorial Criteria & Disclaimer Section */}
        <footer className="pt-8 space-y-4 text-center max-w-2xl mx-auto">
          {criteria && (
            <div className="space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-200/70" />
                <div className="absolute bg-[#FAFBFD] px-4 text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  CRITERIA &amp; STANDARD
                </div>
              </div>

              <p className="text-lg font-serif italic text-slate-600 leading-relaxed pt-1">
                &ldquo;{criteria}&rdquo;
              </p>

              {isBadge && tier && (
                <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                  <span className="font-bold text-[#0B132B] font-bricolage">
                    Level {tier.level}
                  </span>
                  <span>·</span>
                  <span className="italic font-serif text-slate-500">{tier.meaning}</span>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-slate-400 font-sans leading-relaxed pt-2">
            This credential confirms course completion only and does not represent professional expertise or mastery of the subject.
          </p>
        </footer>

      </div>
    </main>
  );
}
