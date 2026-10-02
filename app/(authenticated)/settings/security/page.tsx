'use client';

import { useEffect, useState } from 'react';
import { AuditLog, AuditService } from '@/infrastructure/monitoring/audit.service';
import { Session, SessionService } from '@/infrastructure/auth/session.service';
import { PasswordService, type PasswordChallenge, type PasswordStatus } from '@/infrastructure/auth/password.service';
import {
  Shield,
  Loader2,
  Clock,
  Monitor,
  Key,
  Building,
  Smartphone,
  Tablet,
  Lock,
  ShieldCheck,
  LogOut,
  ChevronDown,
  MapPin,
  MailCheck,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 2) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function DeviceIcon({ type }: { type: Session['deviceType'] }) {
  if (type === 'MOBILE') return <Smartphone size={18} />;
  if (type === 'TABLET') return <Tablet size={18} />;
  return <Monitor size={18} />;
}

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-surface text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60';

// ── Signed-in devices ─────────────────────────────────────────────────────────

function SessionsCard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [signingOutOthers, setSigningOutOthers] = useState(false);

  const load = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const data = await SessionService.getSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const revoke = async (s: Session) => {
    if (!confirm(`Sign out ${s.device}${s.location ? ` in ${s.location}` : ''}? It will be signed out immediately.`)) return;
    setBusyId(s.familyId);
    try {
      await SessionService.revokeSession(s.familyId);
      setSessions((prev) => prev.filter((x) => x.familyId !== s.familyId));
      toast.success('Device signed out');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not sign that device out'));
    } finally {
      setBusyId(null);
    }
  };

  const revokeOthers = async () => {
    if (!confirm('Sign out every other device? Only this one will stay signed in.')) return;
    setSigningOutOthers(true);
    try {
      const count = await SessionService.revokeOtherSessions();
      setSessions((prev) => prev.filter((x) => x.current));
      toast.success(count === 0 ? 'No other devices were signed in' : `Signed out ${count} other device${count === 1 ? '' : 's'}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not sign out other devices'));
    } finally {
      setSigningOutOthers(false);
    }
  };

  const others = sessions.filter((s) => !s.current).length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Monitor size={18} className="text-sky-500" /> Where you&apos;re signed in
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Locations are approximate, based on the network. Don&apos;t recognise a device? Sign it out and change your password.
          </p>
        </div>
        {others > 0 && (
          <button
            onClick={revokeOthers}
            disabled={signingOutOthers}
            className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {signingOutOthers ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
            Sign out all other devices
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-6 flex justify-center">
          <Loader2 className="animate-spin text-sky-500" size={24} />
        </div>
      ) : failed ? (
        <div className="flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-xs font-medium text-amber-800 dark:text-amber-300">
          Couldn&apos;t load your devices.
          <button onClick={load} className="font-bold underline">Try again</button>
        </div>
      ) : sessions.length === 0 ? (
        <p className="py-3 text-xs text-gray-500">No active sessions.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {sessions.map((s) => (
            <div key={s.familyId} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-xl ${s.current ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'}`}>
                  <DeviceIcon type={s.deviceType} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold text-gray-900">{s.device}</p>
                    {s.current && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                        THIS DEVICE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                    {s.location && (
                      <span className="inline-flex items-center gap-0.5">
                        <MapPin size={10} /> {s.location}
                      </span>
                    )}
                    {s.ipAddress && <span>IP {s.ipAddress}</span>}
                    <span className="text-slate-400">
                      {s.current ? 'Active now' : `Last active ${timeAgo(s.lastActiveAt)}`}
                      {s.signedInAt ? ` · signed in ${new Date(s.signedInAt).toLocaleDateString()}` : ''}
                    </span>
                  </p>
                </div>
              </div>

              {!s.current && (
                <button
                  onClick={() => revoke(s)}
                  disabled={busyId === s.familyId}
                  className="shrink-0 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <LogOut size={12} /> {busyId === s.familyId ? 'Signing out…' : 'Sign out'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Password ───────────────────────────────────────────────────────────────────

type PasswordStep = 'current' | 'code' | 'done';

function PasswordCard() {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<PasswordStatus | null>(null);
  const [step, setStep] = useState<PasswordStep>('current');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [challenge, setChallenge] = useState<PasswordChallenge | null>(null);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [signedOut, setSignedOut] = useState(0);

  useEffect(() => {
    PasswordService.status().then(setStatus).catch(() => setStatus(null));
  }, []);

  const hasPassword = status?.hasPassword ?? true;
  const verb = hasPassword ? 'Change' : 'Set';

  const reset = () => {
    setStep('current');
    setCurrentPassword('');
    setChallenge(null);
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const c = await PasswordService.start(hasPassword ? currentPassword : null);
      setChallenge(c);
      setStep('code');
      setCurrentPassword('');
      toast.success(`Code sent to ${c.sentTo}`);
    } catch (err) {
      setError(errorMessage(err, 'Could not send the code'));
    } finally {
      setBusy(false);
    }
  };

  const tooShort = newPassword.length > 0 && newPassword.length < 8;
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canConfirm = /^\d{6}$/.test(code.trim()) && newPassword.length >= 8 && newPassword === confirmPassword;

  const confirmChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || !canConfirm) return;
    setBusy(true);
    setError(null);
    try {
      const count = await PasswordService.confirm(challenge.challengeId, code.trim(), newPassword);
      setSignedOut(count);
      setStep('done');
      setStatus((s) => (s ? { ...s, hasPassword: true } : s));
      toast.success(`Password ${hasPassword ? 'changed' : 'set'}`);
    } catch (err) {
      setError(errorMessage(err, 'Could not update the password'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm space-y-4">
      <div
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between cursor-pointer select-none group"
      >
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Lock size={18} className="text-sky-500" /> {verb} password
          </h3>
          {status && !status.hasPassword && (
            <p className="text-xs text-gray-500 mt-0.5">
              You sign in with Google. Set a password to also sign in with your email.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          <span>{expanded ? 'Hide' : 'Open'}</span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden pt-3 border-t border-gray-100 space-y-4"
          >
            {/* Steps */}
            <ol className="flex flex-wrap gap-2 text-[11px] font-semibold">
              {(hasPassword ? ['Current password', 'Email code', 'New password'] : ['Email code', 'New password']).map((label, i) => {
                const active = hasPassword ? (step === 'current' ? i === 0 : step === 'code' ? i >= 1 && i <= 2 : false) : step !== 'done';
                const done = step === 'done' || (hasPassword && step === 'code' && i === 0);
                return (
                  <li
                    key={label}
                    className={`rounded-full px-2.5 py-1 ${done ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : active ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {i + 1}. {label}
                  </li>
                );
              })}
            </ol>

            {error && (
              <p className="rounded-xl bg-rose-50 dark:bg-rose-950/30 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:text-rose-300">{error}</p>
            )}

            {step === 'current' && (
              <form onSubmit={sendCode} className="space-y-4">
                {hasPassword ? (
                  <div className="max-w-sm">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={inputCls}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">
                    We&apos;ll email a code to {status?.email ?? 'your address'} to confirm it&apos;s you.
                  </p>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={busy || (hasPassword && !currentPassword)}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <MailCheck size={16} />}
                    {hasPassword ? 'Continue' : 'Email me a code'}
                  </button>
                </div>
              </form>
            )}

            {step === 'code' && challenge && (
              <form onSubmit={confirmChange} className="space-y-4">
                <p className="text-xs text-gray-600">
                  We emailed a 6-digit code to <b>{challenge.sentTo}</b>. It expires at{' '}
                  {new Date(challenge.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Code</label>
                    <input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      className={`${inputCls} font-mono tracking-[0.3em]`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">New password</label>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        className={`${inputCls} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={show ? 'Hide password' : 'Show password'}
                      >
                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {tooShort && <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">At least 8 characters.</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm new password</label>
                    <input
                      type={show ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className={inputCls}
                    />
                    {mismatch && <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">Doesn&apos;t match.</p>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700">
                      <ArrowLeft size={13} /> Start over
                    </button>
                    <button type="button" onClick={() => (hasPassword ? reset() : sendCode())} disabled={busy} className="text-sky-600 hover:underline disabled:opacity-50 dark:text-sky-400">
                      Didn&apos;t get it? Send a new code
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={busy || !canConfirm}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    {verb} password
                  </button>
                </div>
              </form>
            )}

            {step === 'done' && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-xs text-emerald-800 dark:text-emerald-300 flex flex-wrap items-center justify-between gap-2">
                <span>
                  Your password has been {hasPassword ? 'updated' : 'set'}.
                  {signedOut > 0 && ` ${signedOut} other device${signedOut === 1 ? ' was' : 's were'} signed out.`}
                </span>
                <button onClick={() => { reset(); setExpanded(false); }} className="font-bold underline">Done</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SecuritySettingsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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

  useEffect(() => {
    loadLogs(0);
  }, []);

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN') || action.includes('LOGOUT') || action.includes('SESSION')) return <Monitor size={16} />;
    if (action.includes('PASSWORD') || action.includes('AUTH')) return <Key size={16} />;
    if (action.includes('ORG') || action.includes('MEMBER')) return <Building size={16} />;
    return <Shield size={16} />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('FAILED') || action.includes('REVOKE')) return 'text-red-600 bg-red-100 dark:bg-red-950/50 dark:text-red-400';
    if (action.includes('SUCCESS') || action.includes('CREATE') || action.includes('CHANGED') || action.includes('SET')) return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400';
    return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400';
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SessionsCard />
      <PasswordCard />

      {/* Audit Logs Section */}
      <div className="rounded-2xl border border-gray-200 bg-surface shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-indigo-500" size={18} /> Security activity
          </h3>
          <span className="text-xs text-gray-500">Page {page + 1} of {totalPages === 0 ? 1 : totalPages}</span>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={28} />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="mx-auto text-gray-300 mb-3" size={40} />
            <h3 className="text-sm font-medium text-gray-900">No activity recorded yet</h3>
            <p className="text-xs text-gray-500 mt-1">Sign-ins, password changes and similar events will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {logs.map((log) => (
              <li key={log.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{log.details || `Performed on ${log.entityType}`}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={11} /> {new Date(log.createdAt).toLocaleString()}</span>
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex justify-between items-center">
            <button
              onClick={() => loadLogs(page - 1)}
              disabled={page === 0}
              className="rounded-lg border border-gray-200 bg-surface px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => loadLogs(page + 1)}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-gray-200 bg-surface px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
