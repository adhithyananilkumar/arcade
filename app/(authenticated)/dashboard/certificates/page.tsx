'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Plus, Search, Eye, ShieldCheck, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CertificateService, Certificate } from '@/services/certificate.service';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await CertificateService.getAll();
        setCertificates(data);
      } catch (err) {
        console.error('Failed to load certificates', err);
        toast.error('Failed to load certificates from ledger');
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.participantName.toLowerCase().includes(search.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Award className="text-indigo-600 h-7 w-7" />
            Certificates Ledger
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate, list, and verify cryptographically signed, blockchain-backed student certificates.
          </p>
        </div>

        <Link
          href="/dashboard/certificates/generate"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-200"
        >
          <Plus size={16} />
          Issue Certificate
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 rounded-2xl bg-white border border-gray-150 p-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by participant name or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Main Table Content */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm text-gray-500 font-medium">Loading ledger entries...</p>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-indigo-50 p-4 text-indigo-600 mb-4">
              <Award className="h-10 w-10 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Certificates Found</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              {search 
                ? "We couldn't find any certificates matching your search filters."
                : "No certificates have been issued yet. Start by generating a blockchain-backed certificate."}
            </p>
            {!search && (
              <Link
                href="/dashboard/certificates/generate"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Issue your first certificate <ArrowRight size={14} />
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-600">
              <thead className="bg-gray-50/75 border-b border-gray-150 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th scope="col" className="px-6 py-4">Participant</th>
                  <th scope="col" className="px-6 py-4">Course Details</th>
                  <th scope="col" className="px-6 py-4">Issue Date</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                <AnimatePresence>
                  {filteredCertificates.map((cert) => (
                    <motion.tr
                      key={cert.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 transition-colors duration-150"
                    >
                      {/* Participant Name */}
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {cert.participantName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{cert.participantName}</p>
                            <p className="text-[11px] text-gray-500">Verified learner</p>
                          </div>
                        </div>
                      </td>

                      {/* Course Info */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{cert.courseName}</p>
                          <a
                            href={cert.courseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            Course Link
                          </a>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{new Date(cert.issuedAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={`/dashboard/certificates/${cert.id}`}
                            className="p-1.5 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300 transition-all duration-150 flex items-center gap-1 text-xs font-semibold"
                            title="View Certificate Details & Print"
                          >
                            <Eye size={14} />
                            View
                          </Link>
                          <Link
                            href={`/verify/${cert.blockchainHash}`}
                            className="p-1.5 rounded-xl border border-indigo-100 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 hover:text-indigo-800 transition-all duration-150 flex items-center gap-1 text-xs font-semibold"
                            title="Verify Cryptographic Authenticity"
                          >
                            <ShieldCheck size={14} />
                            Verify
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
