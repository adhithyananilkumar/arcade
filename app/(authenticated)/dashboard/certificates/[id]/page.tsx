'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  Shield,
  Hash,
  Clock,
  Link2,
} from 'lucide-react';
import { toast } from 'sonner';
import { CertificateService, Certificate, VerificationResult } from '@/services/certificate.service';
import CertificateTemplate from '@/components/certificates/CertificateTemplate';

export default function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await CertificateService.getById(id);
        setCertificate(data);
      } catch (err) {
        console.error(err);
        toast.error('Certificate not found');
        router.push('/dashboard/certificates');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, router]);

  const handlePrint = () => {
    window.print();
  };

  const handleVerify = async () => {
    if (!certificate) return;
    setShowVerifyModal(true);
    setVerifying(true);
    setVerifyResult(null);
    try {
      const result = await CertificateService.verify(certificate.blockchainHash);
      setVerifyResult(result);
    } catch {
      setVerifyResult({
        isValid: false,
        message: 'Failed to reach verification endpoint.',
        blockIndex: null,
        previousHash: null,
        blockHash: null,
        timestamp: null,
        certificate: null,
      });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!certificate) return null;

  return (
    <>
      {/* Print-only styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; }
          #certificate-print-area,
          #certificate-print-area * { visibility: visible !important; }
          #certificate-print-area {
            position: fixed !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 20px !important;
            background: white !important;
          }
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}} />

      <div className="space-y-6 max-w-5xl mx-auto print:hidden">
        {/* Back + Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/dashboard/certificates"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Ledger
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleVerify}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-all"
            >
              <ShieldCheck size={16} />
              Verify on Blockchain
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-all"
            >
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Certificate Info Bar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Hash size={14} className="text-gray-400" />
            <span className="text-gray-500 font-medium">Block Hash:</span>
            <code className="text-xs font-mono bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-indigo-800 select-all">
              {certificate.blockchainHash.slice(0, 16)}...{certificate.blockchainHash.slice(-8)}
            </code>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-gray-400" />
            <span className="text-gray-500 font-medium">Issued:</span>
            <span className="text-gray-800 font-semibold">
              {new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link2 size={14} className="text-gray-400" />
            <a href={certificate.courseUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">
              Course Link
            </a>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-inner flex items-center justify-center">
          <div className="w-full shadow-2xl shadow-indigo-100/50 rounded-lg overflow-hidden">
            <CertificateTemplate
              participantName={certificate.participantName}
              courseName={certificate.courseName}
              courseUrl={certificate.courseUrl}
              issuedAt={certificate.issuedAt}
              blockchainHash={certificate.blockchainHash}
            />
          </div>
        </div>
      </div>

      {/* Printable Area (hidden on screen, visible on print) */}
      <div id="certificate-print-area" ref={printRef} className="hidden print:block w-full">
        <CertificateTemplate
          participantName={certificate.participantName}
          courseName={certificate.courseName}
          courseUrl={certificate.courseUrl}
          issuedAt={certificate.issuedAt}
          blockchainHash={certificate.blockchainHash}
          isPrintMode={true}
        />
      </div>

      {/* Blockchain Verification Modal */}
      <AnimatePresence>
        {showVerifyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !verifying && setShowVerifyModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVerifyModal(false)}
                disabled={verifying}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-5">
                {/* Status Icon */}
                <div className="flex justify-center">
                  {verifying ? (
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin"></div>
                      <Shield className="h-8 w-8 text-indigo-600" />
                    </div>
                  ) : verifyResult?.isValid ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center"
                    >
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="w-20 h-20 rounded-full bg-red-50 border-4 border-red-200 flex items-center justify-center"
                    >
                      <XCircle className="h-10 w-10 text-red-500" />
                    </motion.div>
                  )}
                </div>

                {/* Title & Message */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {verifying
                      ? 'Traversing Blockchain Ledger...'
                      : verifyResult?.isValid
                      ? 'Certificate Verified ✓'
                      : 'Verification Failed'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {verifying
                      ? 'Computing SHA-256 block hashes and walking the chain...'
                      : verifyResult?.message}
                  </p>
                </div>

                {/* Details Grid */}
                {!verifying && verifyResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-left space-y-2 bg-gray-50 rounded-2xl p-4 border border-gray-150"
                  >
                    {verifyResult.blockIndex !== null && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-semibold">Block Index</span>
                        <span className="text-gray-800 font-mono">#{verifyResult.blockIndex}</span>
                      </div>
                    )}
                    {verifyResult.timestamp && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-semibold">Block Time</span>
                        <span className="text-gray-800">{new Date(verifyResult.timestamp).toLocaleString()}</span>
                      </div>
                    )}
                    {verifyResult.blockHash && (
                      <div className="flex justify-between text-xs gap-3">
                        <span className="text-gray-500 font-semibold shrink-0">Block Hash</span>
                        <span className="font-mono text-indigo-700 truncate">{verifyResult.blockHash.slice(0, 20)}...</span>
                      </div>
                    )}
                    {verifyResult.previousHash && (
                      <div className="flex justify-between text-xs gap-3">
                        <span className="text-gray-500 font-semibold shrink-0">Prev. Hash</span>
                        <span className="font-mono text-gray-600 truncate">{verifyResult.previousHash.slice(0, 20)}...</span>
                      </div>
                    )}
                    <div className="pt-1 border-t border-gray-150 mt-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className={`w-2 h-2 rounded-full ${verifyResult.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`font-bold ${verifyResult.isValid ? 'text-green-700' : 'text-red-600'}`}>
                          {verifyResult.isValid ? 'Chain Integrity: VALID' : 'Chain Integrity: INVALID'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!verifying && (
                  <button
                    onClick={() => setShowVerifyModal(false)}
                    className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
