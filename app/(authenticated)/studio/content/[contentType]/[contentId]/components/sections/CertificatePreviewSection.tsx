"use client";

import { Award, ShieldCheck, CheckCircle2, ExternalLink, QrCode } from "lucide-react";

export function CertificatePreviewSection() {
  return (
    <div className="rounded-[24px] border-[1.5px] border-emerald-400/80 bg-gradient-to-b from-emerald-50/40 via-white to-white p-6 sm:p-7 shadow-[4px_-4px_0px_0px_#A7F3D0] flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Award size={18} className="text-emerald-600" />
            Verified Digital Certificate & Auto-Issuance
          </h3>
          <p className="text-xs font-semibold text-slate-500">
            Graduates receive an officially verified digital certificate upon course completion
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 text-emerald-800 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider self-start sm:self-auto">
          <ShieldCheck size={13} className="text-emerald-600" /> Enabled
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Feature 1 */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl border border-emerald-200/80 bg-white shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900">
            <CheckCircle2 size={16} className="text-emerald-600" /> Auto-Issuance Engine
          </div>
          <p className="text-xs font-medium text-slate-500">
            Automatically issues verifiable digital PDF certificates when a student completes all modules and capstones.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl border border-emerald-200/80 bg-white shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900">
            <QrCode size={16} className="text-emerald-600" /> QR Verification Code
          </div>
          <p className="text-xs font-medium text-slate-500">
            Includes cryptographic verification hash code (`CERT-2026-XXXX`) for employer verification.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl border border-emerald-200/80 bg-white shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900">
            <ExternalLink size={16} className="text-emerald-600" /> LinkedIn Sharing
          </div>
          <p className="text-xs font-medium text-slate-500">
            Allows graduates to add verifiable achievement badges directly to their LinkedIn profile.
          </p>
        </div>
      </div>
    </div>
  );
}
