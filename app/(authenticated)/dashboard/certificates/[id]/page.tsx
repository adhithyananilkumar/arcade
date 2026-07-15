'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  ShieldCheck,
  Loader2,
  Clock,
  Link2,
} from 'lucide-react';
import { toast } from 'sonner';
import domtoimage from 'dom-to-image-more';
import { jsPDF } from 'jspdf';
import { CertificateService, Certificate } from '@/services/certificate.service';
import CertificateTemplate from '@/components/certificates/CertificateTemplate';

function shortenHash(hash: string, head = 8, tail = 8): string {
  if (!hash) return '';
  if (hash.length <= head + tail + 3) return hash;
  return `${hash.slice(0, head)}...${hash.slice(-tail)}`;
}

function compactVerifyLink(link: string): string {
  try {
    const parsed = new URL(link);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || '';
    if (!last) return link;
    const short = shortenHash(last, 8, 8);
    return `${parsed.origin}/verify/${short}`;
  } catch {
    return link;
  }
}

export default function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
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

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!printRef.current || !certificate) return;

    setDownloading(true);
    const toastId = toast.loading('Rendering high-quality PDF...');

    try {
      const element = printRef.current;

      // dom-to-image-more supports modern CSS (oklch, lab, etc.) unlike html2canvas
      const dataUrl = await domtoimage.toPng(element, {
        width: 1122,
        height: 794,
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
      });

      // A4 landscape dimensions in mm (297 x 210)
      const pdfWidth = 297;
      const pdfHeight = 210;

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Calculate image dimensions to center it on the page with padding
      const padding = 10;
      const maxW = pdfWidth - padding * 2;
      const maxH = pdfHeight - padding * 2;

      // Certificate is 1122x794 — maintain aspect ratio
      const imgRatio = 1122 / 794;
      let imgW = maxW;
      let imgH = imgW / imgRatio;
      if (imgH > maxH) {
        imgH = maxH;
        imgW = imgH * imgRatio;
      }

      const xOffset = (pdfWidth - imgW) / 2;
      const yOffset = (pdfHeight - imgH) / 2;

      pdf.addImage(dataUrl, 'PNG', xOffset, yOffset, imgW, imgH);

      const filename = `Arcade_Certificate_${certificate.participantName.replace(/\s+/g, '_')}.pdf`;
      pdf.save(filename);

      toast.success('Certificate downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF. Please try again.', { id: toastId });
    } finally {
      setDownloading(false);
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
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-all disabled:opacity-70"
            >
              {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {downloading ? 'Rendering PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Certificate Info Bar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-wrap items-center gap-4">
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

        {/* Verification Link Card */}
        {(() => {
          const verifyLink = typeof window !== 'undefined'
            ? `${window.location.origin}/verify/${certificate.blockchainHash}`
            : `https://arcade.ajce.in/verify/${certificate.blockchainHash}`;
          const verifyLinkDisplay = compactVerifyLink(verifyLink);
          return (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={15} className="text-indigo-600" />
                <span className="text-sm font-bold text-indigo-800">Certificate Verification Link</span>
              </div>
              <p className="text-xs text-indigo-600/70 mb-3">
                Share this link to let anyone verify this certificate belongs to <strong>{certificate.participantName}</strong> and has not been tampered with.
              </p>
              <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-xl px-3 py-2">
                <Link2 size={13} className="text-indigo-400 shrink-0" />
                <code className="text-xs font-mono text-indigo-700 flex-1 truncate" title={verifyLink}>
                  {verifyLinkDisplay}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(verifyLink);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                  className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1 rounded-lg transition-all"
                >
                  {linkCopied ? '✓ Copied!' : 'Copy'}
                </button>
                <a
                  href={verifyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded-lg transition-all"
                >
                  Open ↗
                </a>
              </div>
            </div>
          );
        })()}

        {/* Certificate Preview */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-inner flex items-center justify-center">
          <div className="w-full max-w-[1040px] shadow-2xl shadow-indigo-100/50 rounded-lg overflow-hidden mx-auto">
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

      {/* Hidden container exclusively for PDF rendering (html2canvas) */}
      <div className="fixed left-[-9999px] top-[-9999px]">
        <div 
          id="certificate-print-area" 
          ref={printRef} 
          className="flex items-center justify-center bg-white w-[1122px] h-[794px]"
          style={{ width: '1122px', height: '794px' }} // Exact A4 landscape pixels at 96 DPI
        >
          <div className="w-[1080px]">
            <CertificateTemplate
              participantName={certificate.participantName}
              courseName={certificate.courseName}
              courseUrl={certificate.courseUrl}
              issuedAt={certificate.issuedAt}
              blockchainHash={certificate.blockchainHash}
              isPrintMode={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}
