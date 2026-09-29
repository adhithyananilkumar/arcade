'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import {
  UserService,
  NICKNAME_MAX_LENGTH,
  formatNicknameInput,
  nicknameError,
  nicknameLength,
} from '@/domains/identity';
import {
  HandleField,
  HandleAppealForm,
  HandleAppealList,
  HandleService,
  type HandleAppeal,
} from '@/domains/profiles';
import { useIsContentStaff } from '../../components/useIsContentStaff';
import { PhoneInput } from '@/shared/design-system/ui/phone-input';
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
  Award,
  FileText,
  AtSign,
  ExternalLink,
  Sparkles,
  Globe,
  Eye,
  Smile,
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
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [gender, setGender] = useState(user?.gender || '');
  const [address, setAddress] = useState(user?.address || '');

  const [specialitiesInput, setSpecialitiesInput] = useState(user?.specialities?.join(', ') || '');
  const [experienceInput, setExperienceInput] = useState(
    user?.experienceYears != null ? String(user.experienceYears) : ''
  );
  const [bioInput, setBioInput] = useState(user?.bio || '');
  const [headlineInput, setHeadlineInput] = useState(user?.headline || '');
  const [locationInput, setLocationInput] = useState(user?.location || '');
  const [togglingActivity, setTogglingActivity] = useState(false);
  const [appeals, setAppeals] = useState<HandleAppeal[]>([]);
  const [appealsLoading, setAppealsLoading] = useState(true);
  const [appealFor, setAppealFor] = useState<string | null>(null);

  const handle = user?.username ?? null;
  const showLearnerActivity = user?.showLearnerActivity ?? true;

  const loadAppeals = useCallback(async () => {
    setAppealsLoading(true);
    try {
      setAppeals(await HandleService.myAppeals());
    } catch {
      setAppeals([]);
    } finally {
      setAppealsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppeals();
  }, [loadAppeals]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setNickname(user.nickname || '');
      setMobileNumber(user.mobileNumber || '');
      setGender(user.gender || '');
      setAddress(user.address || '');
      setSpecialitiesInput(user.specialities?.join(', ') || '');
      setExperienceInput(user.experienceYears != null ? String(user.experienceYears) : '');
      setBioInput(user.bio || '');
      setHeadlineInput(user.headline || '');
      setLocationInput(user.location || '');
    }
  }, [user]);

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

  const handleSaveInstructorField = async (field: 'specialities' | 'experience' | 'bio') => {
    if (!user) return;
    setSaving(true);
    try {
      const nameParts = (user.fullName || '').split(' ');
      const fName = user.firstName || nameParts[0] || 'User';
      const lName = user.lastName || nameParts.slice(1).join(' ') || '';

      if (field === 'specialities') {
        const specList = specialitiesInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const updated = await UserService.updateInstructorProfile(fName, lName, {
          specialities: specList,
          experienceYears: user.experienceYears ?? undefined,
          staffOnboardingCompleted: true,
        });
        updateUser(updated);
        toast.success('Specialities updated');
      } else if (field === 'experience') {
        const expNum = experienceInput.trim() === '' ? undefined : Number(experienceInput);
        if (expNum !== undefined && (!Number.isInteger(expNum) || expNum < 0 || expNum > 80)) {
          toast.error('Experience must be a whole number between 0 and 80');
          setSaving(false);
          return;
        }
        const updated = await UserService.updateInstructorProfile(fName, lName, {
          specialities: user.specialities ?? undefined,
          experienceYears: expNum,
          staffOnboardingCompleted: true,
        });
        updateUser(updated);
        toast.success('Experience updated');
      } else if (field === 'bio') {
        const updated = await UserService.updateProfile(
          user.firstName || '',
          user.lastName || '',
          bioInput.trim(),
          user.linkedinUrl,
          user.username,
          user.mobileNumber,
          user.gender,
          user.address,
          user.githubUrl
        );
        updateUser(updated);
        toast.success('Bio updated');
      }
      setEditingField(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : `Failed to update ${field}`;
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNickname = async () => {
    if (!user) return;
    const issue = nicknameError(nickname);
    if (issue) {
      toast.error(issue);
      return;
    }
    setSaving(true);
    try {
      const updated = await UserService.updateNickname(
        user.firstName ?? '',
        user.lastName ?? '',
        nickname.trim()
      );
      updateUser(updated);
      setEditingField(null);
      toast.success('Nickname updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update your nickname.');
    } finally {
      setSaving(false);
    }
  };

  const claimHandle = async (newHandle: string) => {
    const result = await HandleService.claimForMe(newHandle);
    updateUser({ username: result.handle });
    setEditingField(null);
    toast.success(`Your profile is now at /${result.handle}`);
  };

  const handleSavePresentationField = async (field: 'headline' | 'location') => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await UserService.updateProfilePresentation(
        user.firstName ?? '',
        user.lastName ?? '',
        field === 'headline'
          ? { headline: headlineInput.trim() }
          : { location: locationInput.trim() }
      );
      updateUser(updated);
      setEditingField(null);
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Could not update ${field}.`
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleLearnerActivity = async () => {
    if (!user) return;
    const next = !(user.showLearnerActivity ?? true);
    setTogglingActivity(true);
    try {
      const updated = await UserService.updateProfilePresentation(
        user.firstName ?? '',
        user.lastName ?? '',
        { showLearnerActivity: next }
      );
      updateUser(updated);
      toast.success(
        next
          ? 'Learning activity is now shown on your profile'
          : 'Learning activity is now hidden from your profile'
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not update that setting.'
      );
    } finally {
      setTogglingActivity(false);
    }
  };

  const fileAppeal = async (input: { justification: string; evidenceUrl?: string }) => {
    if (!appealFor) return;
    await HandleService.fileAppeal({ handle: appealFor, ...input });
    setAppealFor(null);
    toast.success('Appeal filed. An Arcade administrator will review it.');
    loadAppeals();
  };

  const withdrawAppeal = async (appealId: string) => {
    try {
      await HandleService.withdrawAppeal(appealId);
      toast.success('Appeal withdrawn');
      loadAppeals();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not withdraw that appeal.'
      );
    }
  };

  const cancelEdit = () => {
    // Revert local draft state back to the last-saved values.
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setNickname(user?.nickname || '');
    setMobileNumber(user?.mobileNumber || '');
    setGender(user?.gender || '');
    setAddress(user?.address || '');
    setSpecialitiesInput(user?.specialities?.join(', ') || '');
    setExperienceInput(user?.experienceYears != null ? String(user.experienceYears) : '');
    setBioInput(user?.bio || '');
    setHeadlineInput(user?.headline || '');
    setLocationInput(user?.location || '');
    setEditingField(null);
  };

  const renderSaveCancelButtons = (field: string, onSave?: () => void) => (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={onSave || (() => handleSaveField(field))}
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
      className="space-y-1 pb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* 1. Personal Information */}
      <div>
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

        {/* Nickname — private: only its owner ever sees it (greeting + nav pill) */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <Smile size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Nickname</h3>
              {editingField === 'nickname' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(formatNicknameInput(e.target.value))}
                      placeholder="e.g. Dr. Rubin"
                      autoComplete="nickname"
                      className="w-full px-2 py-1 pr-10 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold tabular-nums text-slate-400">
                      {nicknameLength(nickname.trim())}/{NICKNAME_MAX_LENGTH}
                    </span>
                  </div>
                  {renderSaveCancelButtons('Nickname', handleSaveNickname)}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                  {user?.nickname || 'Not set'} <span className="text-slate-400">· only you see this</span>
                </p>
              )}
            </div>
          </div>
          {editingField !== 'nickname' && (
            <button onClick={() => setEditingField('nickname')} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
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
                <div className="flex items-center gap-1.5 mt-1 w-full">
                  <div className="flex-1 min-w-0">
                    <PhoneInput
                      variant="compact"
                      value={mobileNumber}
                      onChange={(val, meta) => {
                        setMobileNumber(val);
                        setIsPhoneValid(meta.isValid);
                      }}
                      onValidate={(valid) => setIsPhoneValid(valid)}
                    />
                  </div>
                  {renderSaveCancelButtons("Phone", () => {
                    if (mobileNumber && !isPhoneValid) {
                      toast.error('Enter a valid phone number for the selected country.');
                      return;
                    }
                    handleSaveField("Phone");
                  })}
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
    </div>

      {/* 2. Instructor profile — individual field sections matching Name/Phone/Gender/Address */}
      {isContentStaff && (
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-neutral-800/60">
          <div className="py-2.5 px-3 mb-1">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
              Instructor profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Shown next to your name on the courses you publish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {/* Specialities */}
            <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-slate-400 dark:text-neutral-400 shrink-0">
                  <Award size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Specialities</h3>
                  {editingField === 'specialities' ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        value={specialitiesInput}
                        onChange={(e) => setSpecialitiesInput(e.target.value)}
                        placeholder="e.g. React, Cloud Architecture"
                        className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                      {renderSaveCancelButtons("Specialities", () => handleSaveInstructorField('specialities'))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate" title={user?.specialities?.join(', ')}>
                      {user?.specialities?.length ? user.specialities.join(', ') : 'Not set'}
                    </p>
                  )}
                </div>
              </div>
              {editingField !== 'specialities' && (
                <button
                  onClick={() => setEditingField('specialities')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  title="Edit Specialities"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>

            {/* Experience */}
            <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-slate-400 dark:text-neutral-400 shrink-0">
                  <Briefcase size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Experience</h3>
                  {editingField === 'experience' ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="number"
                        min="0"
                        max="80"
                        value={experienceInput}
                        onChange={(e) => setExperienceInput(e.target.value)}
                        placeholder="Years of experience"
                        className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                      {renderSaveCancelButtons("Experience", () => handleSaveInstructorField('experience'))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                      {user?.experienceYears != null
                        ? `${user.experienceYears} ${user.experienceYears === 1 ? 'year' : 'years'}`
                        : 'Not set'}
                    </p>
                  )}
                </div>
              </div>
              {editingField !== 'experience' && (
                <button
                  onClick={() => setEditingField('experience')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  title="Edit Experience"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>

            {/* Bio */}
            <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3 md:col-span-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-slate-400 dark:text-neutral-400 shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Bio</h3>
                  {editingField === 'bio' ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        maxLength={250}
                        value={bioInput}
                        onChange={(e) => setBioInput(e.target.value)}
                        placeholder="Short intro for learners (max 250 chars)"
                        className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                      {renderSaveCancelButtons("Bio", () => handleSaveInstructorField('bio'))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate" title={user?.bio}>
                      {user?.bio || 'Not set'}
                    </p>
                  )}
                </div>
              </div>
              {editingField !== 'bio' && (
                <button
                  onClick={() => setEditingField('bio')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  title="Edit Bio"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Public Profile */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-neutral-800/60">
        <div className="py-2.5 px-3 mb-1 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
              Public profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Information that appears publicly on your profile page.
            </p>
          </div>
          {handle && (
            <Link
              href={`/${handle}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 transition-colors"
              title="View your public profile"
            >
              <span>View profile</span>
              <ExternalLink size={12} />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          {/* Handle */}
          <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-start justify-between gap-3 md:col-span-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="text-slate-400 dark:text-neutral-400 shrink-0 mt-0.5">
                <AtSign size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Handle</h3>
                {editingField === 'handle' ? (
                  <div className="mt-2 space-y-2">
                    <HandleField
                      currentHandle={handle}
                      onClaim={claimHandle}
                      onAppeal={(contested) => setAppealFor(contested)}
                      label=""
                      description="Unique username across Arcade. Changing it updates your public profile URL."
                    />
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={cancelEdit}
                        className="text-xs text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                    {handle ? `@${handle}` : 'Not set'}
                  </p>
                )}
              </div>
            </div>
            {editingField !== 'handle' && (
              <button
                onClick={() => setEditingField('handle')}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                title="Edit Handle"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>

          {appealFor && (
            <div className="md:col-span-2 pt-2">
              <HandleAppealForm
                handle={appealFor}
                onSubmit={fileAppeal}
                onCancel={() => setAppealFor(null)}
              />
            </div>
          )}

          {/* Headline */}
          <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="text-slate-400 dark:text-neutral-400 shrink-0">
                <Sparkles size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Headline</h3>
                {editingField === 'headline' ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="text"
                      maxLength={160}
                      value={headlineInput}
                      onChange={(e) => setHeadlineInput(e.target.value)}
                      placeholder="e.g. Systems engineer, teaching distributed systems"
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {renderSaveCancelButtons("Headline", () => handleSavePresentationField('headline'))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate" title={user?.headline}>
                    {user?.headline || 'Not set'}
                  </p>
                )}
              </div>
            </div>
            {editingField !== 'headline' && (
              <button
                onClick={() => setEditingField('headline')}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                title="Edit Headline"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>

          {/* Public Location */}
          <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="text-slate-400 dark:text-neutral-400 shrink-0">
                <Globe size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Location</h3>
                {editingField === 'location' ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="text"
                      maxLength={120}
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="e.g. Kerala, India"
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {renderSaveCancelButtons("Location", () => handleSavePresentationField('location'))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate" title={user?.location}>
                    {user?.location || 'Not set'}
                  </p>
                )}
              </div>
            </div>
            {editingField !== 'location' && (
              <button
                onClick={() => setEditingField('location')}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                title="Edit Location"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>

          {/* Show Learning Activity on Profile */}
          <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3 md:col-span-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="text-slate-400 dark:text-neutral-400 shrink-0">
                <Eye size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Show learning activity on profile</h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                  Display certificates and course progress on your public profile.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showLearnerActivity}
              onClick={toggleLearnerActivity}
              disabled={togglingActivity}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                showLearnerActivity
                  ? 'bg-sky-600 dark:bg-sky-500'
                  : 'bg-slate-200 dark:bg-neutral-700'
              }`}
            >
              <span className="sr-only">Toggle learning activity</span>
              <span
                className={`inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow transition-transform ${
                  showLearnerActivity ? 'translate-x-6' : 'translate-x-1'
                }`}
              >
                {togglingActivity ? (
                  <Loader2 size={10} className="animate-spin text-slate-400" />
                ) : null}
              </span>
            </button>
          </div>

          {/* Handle Appeals */}
          {appeals.length > 0 && (
            <div className="md:col-span-2 pt-2">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">Handle appeals</h4>
              <HandleAppealList appeals={appeals} onWithdraw={withdrawAppeal} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
