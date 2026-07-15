'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldX,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { CertificateService, VerificationResult } from '@/services/certificate.service';
import CertificateTemplate from '@/components/certificates/CertificateTemplate';

function shortenHash(value: string, head = 8, tail = 8): string {
  if (!value) return '';
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

function compactVerifyLink(link: string): string {
  try {
    const parsed = new URL(link);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || '';
    if (!last) return link;
    return `${parsed.origin}/verify/${shortenHash(last, 8, 8)}`;
  } catch {
    return link;
  }
}

export default function VerifyCertificatePage() {
  const { hash } = useParams<{ hash: string }>();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const data = await CertificateService.verify(hash);
        setResult(data);
      } catch {
        setResult({
          isValid: false,
          message: 'Certificate not found or verification endpoint unreachable.',
          blockIndex: null,
          previousHash: null,
          blockHash: null,
          timestamp: null,
          certificate: null,
        });
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [hash]);

  const verifyUrl = typeof window !== 'undefined' ? window.location.href : '';
  const verifyUrlDisplay = verifyUrl ? compactVerifyLink(verifyUrl) : '';

  const formattedDate = result?.certificate?.issuedAt
    ? new Date(result.certificate.issuedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-[#f3f6fc] font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-extrabold italic text-sm shadow">
          A
        </div>
        <span className="text-lg font-extrabold tracking-widest text-indigo-900 uppercase">Arcade</span>
        <span className="ml-2 text-sm text-gray-400 font-medium">· Certificate Verification</span>
        <span className="ml-auto hidden sm:inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-mono text-indigo-700">
          Ref {shortenHash(hash as string, 8, 8)}
        </span>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
            <ShieldCheck className="h-8 w-8 text-indigo-400" />
          </div>
          <div className="text-center">
            <p className="text-gray-800 font-semibold text-lg">Traversing Blockchain Ledger</p>
            <p className="text-gray-500 text-sm mt-1">Computing SHA-256 block hash chain…</p>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-gray-400 font-mono">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              › Locating block by hash...
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              › Verifying data integrity...
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
              › Walking chain to genesis...
            </motion.p>
          </div>
        </div>
      ) : (
        <main className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ─── LEFT PANEL ─── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="w-full lg:w-[380px] shrink-0 space-y-4"
            >
              {/* Course About Card */}
              {result?.certificate && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Arcade / Institution brand strip */}
                  <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white font-extrabold italic text-sm">
                        A
                      </div>
                      <span className="text-white font-bold tracking-widest text-sm uppercase">Arcade</span>
                    </div>
                    <span className="text-indigo-200 text-xs font-medium">AJCE Learning Platform</span>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Course title */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Course</p>
                      <h2 className="text-xl font-extrabold text-gray-900 leading-snug">
                        {result.certificate.courseName}
                      </h2>
                      <p className="text-xs text-gray-400 mt-1 font-medium">Issued by Arcade · Amal Jyothi College of Engineering</p>
                    </div>

                    {/* Completion info */}
                    <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-base border border-indigo-100 shrink-0">
                        {result.certificate.participantName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        {result.isValid && (
                          <div className="flex items-center gap-1 text-[11px] text-green-600 font-bold mb-0.5">
                            <CheckCircle2 size={10} />
                            Completed
                          </div>
                        )}
                        <p className="font-bold text-gray-900 text-sm leading-tight">
                          {result.certificate.participantName}
                        </p>
                        {formattedDate && (
                          <p className="text-xs text-gray-400 mt-0.5">{formattedDate}</p>
                        )}
                      </div>
                    </div>

                    {/* About paragraph */}
                    <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      <span className="font-semibold text-gray-800">{result.certificate.participantName}</span>
                      {' '}has successfully completed the online course{' '}
                      <span className="font-semibold text-indigo-700">{result.certificate.courseName}</span>
                      {' '}and satisfied all completion requirements on the Arcade platform.
                    </p>

                    {/* Course URL */}
                    <a
                      href={result.certificate.courseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold border border-gray-200 rounded-full px-4 py-1.5 text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      View Course <ExternalLink size={13} />
                    </a>

                    {/* Credential info rows */}
                    <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                      {formattedDate && <InfoRow label="Issued" value={formattedDate} />}
                    </div>
                  </div>
                </div>
              )}

              {/* Verification status pill */}
              <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 border text-sm ${
                result?.isValid
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {result?.isValid
                  ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                  : <ShieldX className="w-4 h-4 shrink-0" />}
                <span className="font-semibold">
                  {result?.isValid ? 'Authentic Certificate' : 'Verification Failed'}
                </span>
                <span className="text-xs text-gray-500 font-normal ml-auto">
                  {result?.isValid ? 'Secured by Arcade ✓' : 'Invalid Signature'}
                </span>
              </div>
            </motion.div>

            {/* ─── RIGHT PANEL: Certificate Preview ─── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="flex-1 min-w-0"
            >
              {result?.certificate ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="w-full shadow-xl shadow-indigo-100/60 rounded-lg overflow-hidden">
                    <CertificateTemplate
                      participantName={result.certificate.participantName}
                      courseName={result.certificate.courseName}
                      courseUrl={result.certificate.courseUrl}
                      issuedAt={result.certificate.issuedAt}
                      blockchainHash={hash as string}
                    />
                  </div>

                  {/* Tamper-evidence notice */}
                  {result.isValid && (
                    <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                      <ShieldCheck size={14} className="text-green-500 shrink-0 mt-0.5" />
                      <p>
                        This certificate is immutably recorded on the Arcade Blockchain Ledger.
                        Any modification to the participant name, course, or URL will invalidate the cryptographic signature.
                        Verify at{' '}
                        <span className="text-indigo-600 font-mono" title={verifyUrl}>
                          {verifyUrlDisplay}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-red-100 p-10 shadow-sm flex flex-col items-center justify-center gap-4 text-center">
                  <ShieldX className="w-14 h-14 text-red-300" />
                  <div>
                    <p className="font-bold text-gray-800 text-lg">Certificate Not Found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      This blockchain hash does not correspond to any certificate in the Arcade ledger.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-8">
        Powered by Arcade · Amal Jyothi College of Engineering
      </footer>
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`text-gray-800 font-medium text-right ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}
