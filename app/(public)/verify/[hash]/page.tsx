'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldX,
  Loader2,
  Award,
  Hash,
  Clock,
  User,
  BookOpen,
  Link2,
  CheckCircle2,
} from 'lucide-react';
import { CertificateService, VerificationResult } from '@/services/certificate.service';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorative dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg">

        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold italic text-sm shadow-lg shadow-indigo-500/40">
              A
            </div>
            <span className="text-xl font-extrabold tracking-widest text-white uppercase">Arcade</span>
          </div>
          <p className="text-sm text-indigo-300 font-medium tracking-widest uppercase">
            Blockchain Certificate Verification
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/40"
        >

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-5">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin"></div>
                <ShieldCheck className="h-8 w-8 text-indigo-300" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">Traversing Blockchain Ledger</p>
                <p className="text-indigo-300/70 text-sm mt-1">Computing SHA-256 block hash chain...</p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs text-xs text-indigo-300/50 font-mono">
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Status Banner */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`rounded-2xl p-5 flex items-center gap-4 ${
                  result?.isValid
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                {result?.isValid ? (
                  <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-7 w-7 text-green-400" strokeWidth={2} />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <ShieldX className="h-7 w-7 text-red-400" strokeWidth={2} />
                  </div>
                )}
                <div>
                  <h2 className={`text-lg font-extrabold ${result?.isValid ? 'text-green-300' : 'text-red-300'}`}>
                    {result?.isValid ? 'Verified Authentic' : 'Verification Failed'}
                  </h2>
                  <p className="text-sm text-white/60 mt-0.5">
                    {result?.isValid
                      ? 'Secured by Arcade Blockchain Ledger'
                      : result?.message}
                  </p>
                </div>
              </motion.div>

              {/* Certificate Details */}
              {result?.certificate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-3"
                >
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300/70 flex items-center gap-1.5">
                    <Award size={13} />
                    Certificate Details
                  </h3>

                  <div className="bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden divide-y divide-white/5">
                    <DetailRow icon={<User size={14} />} label="Participant" value={result.certificate.participantName} />
                    <DetailRow icon={<BookOpen size={14} />} label="Course" value={result.certificate.courseName} />
                    <DetailRow
                      icon={<Link2 size={14} />}
                      label="Course URL"
                      value={result.certificate.courseUrl}
                      isLink
                    />
                    <DetailRow
                      icon={<Clock size={14} />}
                      label="Issued On"
                      value={new Date(result.certificate.issuedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    />
                  </div>
                </motion.div>
              )}

              {/* Blockchain Ledger Info */}
              {result?.isValid && result.blockIndex !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-3"
                >
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300/70 flex items-center gap-1.5">
                    <Hash size={13} />
                    Ledger Metadata
                  </h3>

                  <div className="bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden divide-y divide-white/5">
                    <DetailRow label="Block Index" value={`#${result.blockIndex}`} mono />
                    <DetailRow
                      label="Block Hash"
                      value={`${result.blockHash?.slice(0, 18)}...${result.blockHash?.slice(-10)}`}
                      mono
                    />
                    <DetailRow
                      label="Previous Hash"
                      value={`${result.previousHash?.slice(0, 18)}...${result.previousHash?.slice(-10)}`}
                      mono
                    />
                    {result.timestamp && (
                      <DetailRow
                        label="Block Time"
                        value={new Date(result.timestamp).toLocaleString()}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-green-400 font-semibold bg-green-500/5 border border-green-500/10 rounded-xl px-3 py-2">
                    <CheckCircle2 size={14} />
                    Chain traversal completed — all block hashes verified intact.
                  </div>
                </motion.div>
              )}

              {/* Hash being verified */}
              <div className="text-center pt-2">
                <p className="text-[10px] text-white/25 font-mono break-all">{hash}</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-white/20 mt-6">
          Powered by Arcade · AJCE Learning Platform
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  isLink = false,
  mono = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      {icon && <span className="text-indigo-300/50 mt-0.5 shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-bold text-white/30">{label}</p>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm text-indigo-300 hover:text-indigo-200 underline truncate block transition-colors ${mono ? 'font-mono' : 'font-medium'}`}
          >
            {value}
          </a>
        ) : (
          <p className={`text-sm text-white/80 truncate ${mono ? 'font-mono text-indigo-200' : 'font-medium'}`}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
