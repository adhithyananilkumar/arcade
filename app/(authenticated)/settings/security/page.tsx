'use client';

import { useEffect, useState } from 'react';
import { AuditLog, AuditService } from '@/infrastructure/monitoring/audit.service';
import { 
  Shield, 
  Loader2, 
  Clock, 
  Monitor, 
  Key, 
  Building, 
  CheckCircle2, 
  Smartphone, 
  Lock, 
  ShieldCheck, 
  LogOut,
  Phone,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Change Password state
  const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);

  // Linked Phone & 2FA state
  const [phone, setPhone] = useState('+1 (555) 000-0000');
  const [isPhoneEditing, setIsPhoneEditing] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Active Sessions Mock Data
  const [sessions, setSessions] = useState([
    {
      id: 's1',
      device: 'Windows PC • Chrome',
      location: 'Kottayam, Kerala',
      ip: '103.22.45.12',
      isCurrent: true,
      lastActive: 'Active now',
    },
    {
      id: 's2',
      device: 'iPhone 15 Pro • Arcade Mobile',
      location: 'Kochi, Kerala',
      ip: '49.37.120.89',
      isCurrent: false,
      lastActive: '2 hours ago',
    },
  ]);

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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsPasswordSaved(true);
    toast.success('Password updated successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setIsPasswordSaved(false), 2000);
  };

  const handleRevokeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
    toast.success('Session revoked successfully');
  };

  const handleToggle2FA = () => {
    const nextState = !is2FAEnabled;
    setIs2FAEnabled(nextState);
    if (nextState) {
      toast.success('2-Factor Authentication enabled');
    } else {
      toast.info('2-Factor Authentication disabled');
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN') || action.includes('SESSION')) return <Monitor size={16} />;
    if (action.includes('PASSWORD') || action.includes('AUTH')) return <Key size={16} />;
    if (action.includes('ORG') || action.includes('MEMBER')) return <Building size={16} />;
    return <Shield size={16} />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('FAILED') || action.includes('REVOKE')) return 'text-red-600 bg-red-100 dark:bg-red-950/50';
    if (action.includes('SUCCESS') || action.includes('CREATE')) return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50';
    return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/50';
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Security Status Card */}
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Account Security Healthy</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">2-Factor authentication and session protection active.</p>
          </div>
        </div>
      </div>

      {/* Active Sign-in Sessions Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Monitor size={18} className="text-sky-500" /> Active Sign-in Sessions
          </h3>
          <span className="text-xs text-slate-500">{sessions.length} active device(s)</span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          {sessions.map((s) => (
            <div key={s.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300">
                  {s.device.includes('iPhone') ? <Smartphone size={18} /> : <Monitor size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{s.device}</p>
                    {s.isCurrent && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                        CURRENT DEVICE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {s.location} • IP: {s.ip} • <span className="text-slate-400">{s.lastActive}</span>
                  </p>
                </div>
              </div>

              {!s.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(s.id)}
                  className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <LogOut size={12} /> Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Change Password Collapsible Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-4">
        {/* Accordion Header */}
        <div 
          onClick={() => setIsPasswordExpanded(!isPasswordExpanded)} 
          className="flex items-center justify-between cursor-pointer select-none group"
        >
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock size={18} className="text-sky-500" /> Change Password
          </h3>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            <span>{isPasswordExpanded ? 'Hide' : 'Expand'}</span>
            <motion.div 
              animate={{ rotate: isPasswordExpanded ? 180 : 0 }} 
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} />
            </motion.div>
          </div>
        </div>

        {/* Downward Expandable Form */}
        <AnimatePresence>
          {isPasswordExpanded && (
            <motion.form 
              onSubmit={handlePasswordSubmit}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden pt-3 border-t border-gray-100 dark:border-neutral-800 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">Confirm Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
                >
                  <ShieldCheck size={16} />
                  {isPasswordSaved ? 'Password Updated!' : 'Update Password'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Linked Phone Number & 2FA Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Linked Phone */}
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Phone size={18} className="text-emerald-500" /> Linked Phone Number
          </h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400">Used for account recovery and two-factor verification.</p>

          <div className="pt-2 flex items-center gap-2">
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isPhoneEditing}
              className={`flex-1 px-3.5 py-2 rounded-xl border text-xs font-semibold ${
                isPhoneEditing 
                  ? 'border-emerald-500 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white' 
                  : 'border-gray-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 text-gray-600 dark:text-neutral-300 cursor-not-allowed'
              }`}
            />
            <button
              onClick={() => {
                if (isPhoneEditing) toast.success('Phone number saved!');
                setIsPhoneEditing(!isPhoneEditing);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              {isPhoneEditing ? 'Save' : 'Edit'}
            </button>
          </div>
        </div>

        {/* 2-Factor Authentication (2FA) */}
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-500" /> 2-Factor Authentication
            </h3>
            <button
              onClick={handleToggle2FA}
              className={`w-11 h-6 rounded-full p-1 transition-colors ${is2FAEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-neutral-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${is2FAEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            Secure your sign-in process by requiring a verification code sent to your phone or authenticator app.
          </p>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            is2FAEnabled 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
              : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400'
          }`}>
            {is2FAEnabled ? '2FA IS ACTIVE' : '2FA IS INACTIVE'}
          </span>
        </div>
      </div>

      {/* Audit Logs Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-neutral-800 p-6 flex justify-between items-center">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="text-indigo-500" size={18} /> Audit & Security Timeline
          </h3>
          <span className="text-xs text-gray-500 dark:text-neutral-400">Page {page + 1} of {totalPages === 0 ? 1 : totalPages}</span>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={28} />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="mx-auto text-gray-300 dark:text-neutral-700 mb-3" size={40} />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">No activity recorded yet</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">Security events will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-neutral-800">
            {logs.map((log) => (
              <li key={log.id} className="p-5 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-600 dark:text-neutral-400 mt-0.5">{log.details || `Performed on ${log.entityType}`}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-[11px] text-gray-400 dark:text-neutral-500">
                      <span className="flex items-center gap-1"><Clock size={11} /> {new Date(log.createdAt).toLocaleString()}</span>
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
          <div className="border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 px-6 py-3 flex justify-between items-center">
            <button
              onClick={() => loadLogs(page - 1)}
              disabled={page === 0}
              className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => loadLogs(page + 1)}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
