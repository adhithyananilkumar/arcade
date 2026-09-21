'use client';

import { useState } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from '@/domains/identity';
import { useIsContentStaff } from '../../components/useIsContentStaff';
import { OPEN_STAFF_ONBOARDING_EVENT } from '../../components/StaffOnboardingModal';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  User,
  Copy,
  Check,
  Edit2,
  X,
  Loader2,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Personal info settings. Every field here has a real backend source
 * (User/ProfileResponse — see domains/identity/api/user.service.ts) and saves through the same
 * PUT /api/v1/users/me endpoint the profile editor uses. No KYC/Aadhaar/proctoring content
 * belongs on this page — that domain is out of scope for the learner profile/settings surface
 * entirely (see LEARNER_IDENTITY_DOMAIN.md).
 */
export default function PersonalInfoPage() {
  const { user, updateUser } = useAuthStore();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [address, setAddress] = useState(user?.address || '');

  const userEmail = user?.email || '';

  // Students have no instructor profile, so the section is hidden from them entirely rather
  // than shown empty. `null` means the check is still running.
  const isContentStaff = useIsContentStaff();

  const handleCopyEmail = () => {
    if (!userEmail) return;
    navigator.clipboard.writeText(userEmail);
    setCopiedEmail(true);
    toast.success('Email copied to clipboard!');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSaveField = async (field: string) => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await UserService.updateProfile(
        firstName,
        lastName,
        user.bio,
        user.linkedinUrl,
        user.username,
        mobileNumber,
        gender,
        address,
        user.githubUrl
      );
      updateUser(updated);
      setEditingField(null);
      toast.success(`${field} updated`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : `Failed to update ${field.toLowerCase()}`;
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    // Revert local draft state back to the last-saved values.
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setMobileNumber(user?.mobileNumber || '');
    setGender(user?.gender || '');
    setAddress(user?.address || '');
    setEditingField(null);
  };

  const renderSaveCancelButtons = (field: string) => (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={() => handleSaveField(field)}
        disabled={saving}
        className="p-1 text-emerald-600 dark:text-emerald-400 disabled:opacity-50"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
      </button>
      <button onClick={cancelEdit} disabled={saving} className="p-1 text-slate-400 disabled:opacity-50">
        <X size={14} />
      </button>
    </div>
  );

  return (
    <motion.div
      className="space-y-1 pb-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        {/* Name */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Name</h3>
              {editingField === 'name' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  {renderSaveCancelButtons("Name")}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                  {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Not set'}
                </p>
              )}
            </div>
          </div>
          {editingField !== 'name' && (
            <button onClick={() => setEditingField('name')} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {/* Email (read-only — not editable from the ordinary profile editor) */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate">Email</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate" title={userEmail}>
                {userEmail || 'Not set'}
              </p>
            </div>
          </div>
          {userEmail && (
            <button
              onClick={handleCopyEmail}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              title="Copy Email"
            >
              {copiedEmail ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          )}
        </div>

        {/* Phone */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <Phone size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Phone</h3>
              {editingField === 'phone' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Mobile number"
                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  {renderSaveCancelButtons("Phone")}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                  {user?.mobileNumber || 'Not set'}
                </p>
              )}
            </div>
          </div>
          {editingField !== 'phone' && (
            <button onClick={() => setEditingField('phone')} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {/* Gender */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Gender</h3>
              {editingField === 'gender' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                  {renderSaveCancelButtons("Gender")}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                  {user?.gender || 'Not set'}
                </p>
              )}
            </div>
          </div>
          {editingField !== 'gender' && (
            <button onClick={() => setEditingField('gender')} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {/* Address — the backend has exactly one address field, not separate home/work/other. */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3 md:col-span-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <MapPin size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Address</h3>
              {editingField === 'address' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={address}
                    placeholder="Enter address"
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  {renderSaveCancelButtons("Address")}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                  {user?.address || 'Not set'}
                </p>
              )}
            </div>
          </div>
          {editingField !== 'address' && (
            <button onClick={() => setEditingField('address')} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <Edit2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Instructor profile — edited in the same dialog that greets new instructors, so there
          is one form for it rather than two that can drift apart. */}
      {isContentStaff && (
        <div className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-neutral-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 shrink-0 text-slate-400">
                <Briefcase size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Instructor profile
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-neutral-400">
                  Shown next to your name on the courses you publish.
                </p>

                <dl className="mt-3 flex flex-col gap-1.5 text-xs">
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-slate-400 dark:text-neutral-500">Specialities</dt>
                    <dd className="truncate text-slate-600 dark:text-neutral-300">
                      {user?.specialities?.length ? user.specialities.join(', ') : 'Not set'}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-slate-400 dark:text-neutral-500">Experience</dt>
                    <dd className="text-slate-600 dark:text-neutral-300">
                      {user?.experienceYears != null
                        ? `${user.experienceYears} ${user.experienceYears === 1 ? 'year' : 'years'}`
                        : 'Not set'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <button
              onClick={() => window.dispatchEvent(new Event(OPEN_STAFF_ONBOARDING_EVENT))}
              className="shrink-0 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-sky-700"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
