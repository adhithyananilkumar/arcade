'use client';

import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { SessionService } = await import('@/infrastructure/auth/session.service');
      const data = await SessionService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (familyId: string) => {
    if (!confirm('Are you sure you want to revoke this session? It will be logged out immediately.')) return;
    
    setRevokingId(familyId);
    try {
      const { SessionService } = await import('@/infrastructure/auth/session.service');
      await SessionService.revokeSession(familyId);
      setSessions(sessions.filter(s => s.familyId !== familyId));
    } catch (err) {
      alert('Failed to revoke session');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <motion.div 
      className="max-w-4xl space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Active Sessions</h1>
          <p className="text-gray-500 mt-1">Manage and revoke active login sessions for your account.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {sessions.map((session, i) => (
              <li key={session.familyId} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      Session (IP: {session.ipAddress || 'Unknown'})
                      {i === 0 && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Current</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Started {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRevoke(session.familyId)}
                  disabled={revokingId === session.familyId}
                  className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 transition-colors"
                >
                  {revokingId === session.familyId ? 'Revoking...' : 'Revoke'}
                </button>
              </li>
            ))}
            
            {sessions.length === 0 && (
              <div className="p-12 text-center text-gray-500 text-sm">No active sessions found.</div>
            )}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
