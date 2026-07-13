'use client';

import { useEffect, useState } from 'react';
import { AuditLog, AuditService } from '@/services/audit.service';
import { Shield, Loader2, ArrowLeft, Clock, Monitor, Key, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs(0);
  }, []);

  const loadLogs = async (pageNumber: number) => {
    setIsLoading(true);
    try {
      const data = await AuditService.getUserAuditLogs(pageNumber);
      setLogs(data.content);
      setTotalPages(data.totalPages);
      setPage(pageNumber);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN') || action.includes('SESSION')) return <Monitor size={16} />;
    if (action.includes('PASSWORD') || action.includes('AUTH')) return <Key size={16} />;
    if (action.includes('ORG') || action.includes('MEMBER')) return <Building size={16} />;
    return <Shield size={16} />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('FAILED') || action.includes('REVOKE')) return 'text-red-600 bg-red-100';
    if (action.includes('SUCCESS') || action.includes('CREATE')) return 'text-emerald-600 bg-emerald-100';
    return 'text-indigo-600 bg-indigo-100';
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Link href="/dashboard/settings" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 mb-3 transition-colors">
          <ArrowLeft size={16} /> Back to Settings
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Security & Audit Logs</h1>
        <p className="text-gray-500 mt-1">Review recent activity and security events on your account.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-indigo-500" /> Activity Timeline
          </h3>
          <span className="text-sm text-gray-500">Page {page + 1} of {totalPages === 0 ? 1 : totalPages}</span>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="mx-auto text-gray-300 mb-3" size={48} />
            <h3 className="text-lg font-medium text-gray-900">No activity recorded yet</h3>
            <p className="text-sm text-gray-500 mt-1">Security events will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {logs.map((log) => (
              <li key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{log.details || `Performed on ${log.entityType}`}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-medium">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(log.createdAt).toLocaleString()}</span>
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => loadLogs(page - 1)}
              disabled={page === 0}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => loadLogs(page + 1)}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
