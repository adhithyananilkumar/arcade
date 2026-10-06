'use client';

/**
 * Step 3 of the invite-gated channel creation flow (plan Frontend §2.3-4): once the user has a
 * validated token AND is authenticated (enforced by /channel-invite redirecting here only in that
 * case), collect the full applicant profile + channel details + (conditionally) organization
 * details, then submit via the extended `channelService.createChannelRequest`.
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { ArrowUpRight, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { channelService, ChannelApplicantInput, ChannelOrganizationInput } from '@/domains/channels';
import { IssuerLogoPreview } from '@/domains/credentials';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { PebbleLoader } from '@/domains/identity/components/PebbleLoader';
import { PhoneInput } from '@/shared/design-system/ui/phone-input';
import { validateDateOfBirth, getTodayDateString, UNDER_AGE_ERROR_MESSAGE } from '@/shared/utils/dob';
import { cn } from '@/shared/utils/utils';
import { hasTransparentBackground, rasteriseSvg } from '@/shared/utils/image';
import '@/apps/public/landing.css';

// Subtle stagger reveal variants (shared editorial motion language — see /reach-us)
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: i * 0.07,
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
};

/** Same pastel atmospheric backdrop used across the public editorial pages (see /reach-us). */
function EditorialBackdrop() {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10"
      style={{
        backgroundColor: 'var(--theme-surface, #FAFBFD)',
        backgroundImage: `var(--theme-wash, 
          radial-gradient(ellipse 70% 40% at 50% 0%, rgba(224, 236, 255, 0.25) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 10% 25%, rgba(233, 225, 254, 0.20) 0%, transparent 65%),
          radial-gradient(ellipse 60% 40% at 90% 75%, rgba(253, 232, 240, 0.18) 0%, transparent 65%),
          linear-gradient(
            180deg,
            #FAFBFD 0%,
            #F6F8FD 35%,
            #F8F6FD 70%,
            #FAF9FB 100%
          )
        )`,
      }}
    />
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
        {label} {required && <span className="text-blue-600 dark:text-blue-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1.5 animate-in fade-in duration-150 dark:text-red-400">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/** Editorial section header: serif italic title, accent rule, hairline divider. */
function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="space-y-2.5 pb-5 border-b border-slate-200/70">
      <h2 className="text-2xl sm:text-3xl font-normal font-serif italic text-ink tracking-tight leading-snug">
        {title}
      </h2>
      <span className="block h-0.5 w-10 bg-[#205ca8]/60 rounded-full" />
      {hint && <p className="text-sm text-slate-500 leading-relaxed pt-0.5">{hint}</p>}
    </div>
  );
}

// Open editorial fields: underline only, no boxed card (matches /reach-us).
const inputClass =
  'w-full py-3 bg-transparent border-b border-slate-300 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:border-[#205ca8] transition-colors';

const selectClass = `${inputClass} cursor-pointer`;

const textareaClass =
  'w-full px-4 py-3 bg-surface/50 border border-slate-300/80 rounded-xl text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#205ca8]/15 focus:border-[#205ca8] transition-all resize-none';

const uploadClass =
  'flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-surface/50 px-4 py-3.5 cursor-pointer hover:border-[#205ca8] hover:bg-[#205ca8]/[0.04] transition-colors';

const emptyApplicant = {
  fullName: '',
  phoneNumber: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  nationality: '',
  address: '',
  city: '',
  state: '',
  country: '',
  pinCode: '',
  personalIdProofType: '',
  personalIdProofNumber: '',
};

const emptyOrganization = {
  organizationName: '',
  organizationType: '',
  organizationDescription: '',
  organizationWebsite: '',
  organizationEmail: '',
  organizationAddress: '',
  organizationRegistrationNumber: '',
  roleInOrganization: '',
  organizationProofNumber: '',
};

function ChannelInviteCreateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { user, status } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  // This page must never be reachable while signed out (someone bookmarking/sharing the URL,
  // or landing here before the app-wide auth bootstrap resolves) — bounce back through /sign
  // with the same redirect+email pattern /channel-invite uses.
  useEffect(() => {
    if (status !== 'unauthenticated') return;
    const params = new URLSearchParams({
      redirect: `/channel-invite/create${token ? `?token=${encodeURIComponent(token)}` : ''}`,
    });
    router.replace(`/sign?${params.toString()}`);
  }, [status, token, router]);

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isPersonal, setIsPersonal] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const [applicant, setApplicant] = useState(emptyApplicant);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [dobError, setDobError] = useState('');
  const [personalIdProofDocument, setPersonalIdProofDocument] = useState<File | null>(null);

  const [organization, setOrganization] = useState(emptyOrganization);
  const [organizationProofDocument, setOrganizationProofDocument] = useState<File | null>(null);

  const personalName = (
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email ||
    ''
  ).trim();

  useEffect(() => {
    if (!user) return;
    setApplicant((prev) => ({
      ...prev,
      fullName: prev.fullName || personalName,
      email: prev.email || user.email || '',
      phoneNumber: prev.phoneNumber || user.mobileNumber || '',
      gender: prev.gender || user.gender || '',
      address: prev.address || user.address || '',
    }));
    if (user.mobileNumber) {
      setIsPhoneValid(true);
    }
  }, [user, personalName]);

  const updateApplicant = (field: keyof typeof emptyApplicant, value: string) => {
    setApplicant((prev) => ({ ...prev, [field]: value }));
  };

  const updateOrganization = (field: keyof typeof emptyOrganization, value: string) => {
    setOrganization((prev) => ({ ...prev, [field]: value }));
  };

  // The icon is the organisation's logo on its badges and certificates: a PNG or SVG (rasterised to
  // PNG here, since certificates embed raster images only) with a transparent background.
  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = '';
    if (!picked) return;
    if (picked.type !== 'image/png' && picked.type !== 'image/svg+xml') {
      toast.error('Use a PNG or SVG with a transparent background.');
      return;
    }
    let file: File;
    try {
      file = picked.type === 'image/svg+xml' ? await rasteriseSvg(picked) : picked;
    } catch {
      toast.error('That SVG could not be read. Try exporting it again, or use a PNG.');
      return;
    }
    const url = URL.createObjectURL(file);
    if (!isPersonal && !(await hasTransparentBackground(url).catch(() => false))) {
      URL.revokeObjectURL(url);
      toast.error('This logo has a background. Upload a PNG or SVG with a transparent background.');
      return;
    }
    setIconFile(file);
    setIconPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Missing invitation token — please use the link from your invitation email or notification.');
      return;
    }

    const finalName = (isPersonal ? personalName : name).trim();
    if (finalName.length < 2) {
      toast.error(
        isPersonal
          ? 'Add your name to your profile first — a personal channel is named after you.'
          : 'Channel name must be at least 2 characters'
      );
      return;
    }

    const requiredApplicantFields: (keyof typeof emptyApplicant)[] = [
      'fullName',
      'phoneNumber',
      'email',
      'dateOfBirth',
      'gender',
      'nationality',
      'address',
      'city',
      'state',
      'country',
      'pinCode',
      'personalIdProofType',
      'personalIdProofNumber',
    ];
    for (const field of requiredApplicantFields) {
      if (!applicant[field].trim()) {
        toast.error('Please fill in all applicant details.');
        return;
      }
    }
    if (!isPhoneValid) {
      toast.error('Enter a valid phone number for the selected country.');
      return;
    }
    const dobValidation = validateDateOfBirth(applicant.dateOfBirth, 16, true);
    if (!dobValidation.isValid) {
      const msg = dobValidation.error || UNDER_AGE_ERROR_MESSAGE;
      setDobError(msg);
      toast.error(msg);
      return;
    }
    if (!personalIdProofDocument) {
      toast.error('Please upload your ID proof document.');
      return;
    }

    if (!isPersonal) {
      const requiredOrgFields: (keyof typeof emptyOrganization)[] = [
        'organizationName',
        'organizationType',
        'organizationDescription',
        'organizationEmail',
        'organizationAddress',
        'organizationRegistrationNumber',
        'roleInOrganization',
        'organizationProofNumber',
      ];
      for (const field of requiredOrgFields) {
        if (!organization[field].trim()) {
          toast.error('Please fill in all organization details.');
          return;
        }
      }
      if (!organizationProofDocument) {
        toast.error('Please upload the organization proof document.');
        return;
      }
    }

    const applicantInput: ChannelApplicantInput = {
      ...applicant,
      personalIdProofDocument: personalIdProofDocument || undefined,
    };

    const organizationInput: ChannelOrganizationInput | undefined = isPersonal
      ? undefined
      : {
          ...organization,
          organizationProofDocument: organizationProofDocument || undefined,
        };

    try {
      setIsLoading(true);
      await channelService.createChannelRequest(
        finalName,
        description.trim(),
        isPersonal,
        {
          invitationToken: token,
          purpose: purpose.trim(),
          applicant: applicantInput,
          organization: organizationInput,
        },
        iconFile || undefined
      );
      setSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit channel request');
    } finally {
      setIsLoading(false);
    }
  };

  if (status !== 'authenticated') {
    return (
      <div className="landing-root relative flex min-h-[calc(100vh-140px)] items-center justify-center">
        <EditorialBackdrop />
        <PebbleLoader label="Loading" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="landing-root min-h-[calc(100vh-140px)] flex flex-col justify-center relative text-ink font-sans pt-28 sm:pt-32 lg:pt-36 pb-16 lg:pb-20 px-6 sm:px-12 lg:px-20 selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-500/15 dark:selection:text-blue-200">
        <EditorialBackdrop />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[520px] mx-auto my-auto text-center flex flex-col items-center"
        >
          <h1 className="text-3xl sm:text-4xl font-normal font-serif italic text-ink tracking-tight leading-snug">
            Request Received.
          </h1>
          <span className="block h-0.5 w-10 bg-[#205ca8]/60 rounded-full mx-auto mt-4" />
          <p className="text-sm text-slate-600 leading-relaxed mt-5 max-w-sm">
            Thanks — your request is now pending approval. An administrator will review your
            applicant details and get back to you.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-9 relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-ink hover:bg-[#205ca8] text-on-ink font-medium text-sm tracking-wide shadow-sm hover:shadow-md transition-all duration-300 ease-out group"
          >
            <span>Go to Homepage</span>
            <span className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="landing-root min-h-[calc(100vh-140px)] relative text-ink font-sans pt-28 sm:pt-32 lg:pt-36 pb-16 lg:pb-20 px-6 sm:px-12 lg:px-20 selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-500/15 dark:selection:text-blue-200">
      <EditorialBackdrop />

      <div className="w-[84vw] max-w-[1400px] mx-auto w-full">
        {/* EDITORIAL TWO-COLUMN COMPOSITION (LEFT ~46% / RIGHT ~54%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* LEFT SIDE — STANDING INTRO, STICKY ALONGSIDE THE LONG FORM */}
          <div className="lg:col-span-5 -mt-4 lg:-mt-14 lg:sticky lg:top-32">
            <motion.h1
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate="visible"
              custom={0}
              variants={fadeInUp as any}
              className="text-4xl sm:text-5xl lg:text-[56px] tracking-tight text-ink leading-[1.08] font-serif whitespace-nowrap mb-8"
            >
              <span className="font-bold text-ink">Your</span>{' '}
              <span className="italic font-normal text-[#205ca8] dark:text-[#7cbaff]">channel.</span>
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate="visible"
              custom={2}
              variants={fadeInUp as any}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-[480px] font-normal mb-12"
            >
              You&apos;ve been invited to create a channel on Arcade. Fill in the details and
              we&apos;ll take it from there.
            </motion.p>

            <motion.span
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate="visible"
              custom={3}
              variants={fadeInUp as any}
              className="block h-px w-full max-w-xs bg-slate-200/80 mb-8"
            />

            <motion.div
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate="visible"
              custom={4}
              variants={fadeInUp as any}
              className="space-y-5"
            >
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                  Signed in as
                </p>
                <p className="text-base sm:text-lg font-bold text-ink font-bricolage leading-snug break-all">
                  {user?.email || personalName || '—'}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-snug pt-6 border-t border-slate-200/60">
                Every request is reviewed by an administrator before the channel goes live.
              </p>
            </motion.div>
          </div>

          {/* RIGHT SIDE — EDITORIAL FORM EXPERIENCE (~54%) */}
          <div className="lg:col-span-7 lg:pl-6">
            <motion.form
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate="visible"
              custom={2}
              variants={fadeInUp as any}
              onSubmit={handleSubmit}
              className="space-y-14"
            >
              {/* CHANNEL TYPE */}
              <section className="space-y-7">
                <SectionHeading
                  title="What kind of channel?"
                  hint="Personal channels are named after you. Organization channels need a few extra details."
                />
                <div className="flex flex-wrap gap-8">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      checked={isPersonal}
                      onChange={() => setIsPersonal(true)}
                      className="h-4 w-4 accent-[#205ca8] focus:outline-none"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-ink transition-colors">
                      Personal Channel
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      checked={!isPersonal}
                      onChange={() => {
                        setIsPersonal(false);
                        setName('');
                      }}
                      className="h-4 w-4 accent-[#205ca8] focus:outline-none"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-ink transition-colors">
                      Organization Channel
                    </span>
                  </label>
                </div>
              </section>

              {/* APPLICANT — ALWAYS SHOWN */}
              <section className="space-y-7">
                <SectionHeading
                  title="Tell us who you are."
                  hint="These details verify the person behind the channel."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                  <FormField label="Full Name" required>
                    <input type="text" className={inputClass} placeholder="e.g. Rahul Sharma" value={applicant.fullName} onChange={(e) => updateApplicant('fullName', e.target.value)} required />
                  </FormField>
                  <FormField label="Phone Number" required>
                    <PhoneInput
                      variant="underline"
                      value={applicant.phoneNumber}
                      required
                      onChange={(val, meta) => {
                        updateApplicant('phoneNumber', val);
                        setIsPhoneValid(meta.isValid);
                      }}
                      onValidate={(valid) => setIsPhoneValid(valid)}
                    />
                  </FormField>
                  <FormField label="Email Address" required>
                    <input type="email" className={inputClass} placeholder="rahul@example.com" value={applicant.email} onChange={(e) => updateApplicant('email', e.target.value)} required />
                  </FormField>
                  <FormField label="Date of Birth" required error={dobError}>
                    <input
                      type="date"
                      className={cn(inputClass, dobError && "border-red-500 text-red-900 focus:border-red-500 dark:text-red-200")}
                      value={applicant.dateOfBirth}
                      max={getTodayDateString()}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateApplicant('dateOfBirth', val);
                        if (val) {
                          const res = validateDateOfBirth(val, 16);
                          setDobError(res.error || '');
                        } else {
                          setDobError('');
                        }
                      }}
                      required
                    />
                  </FormField>
                  <FormField label="Gender" required>
                    <select className={selectClass} value={applicant.gender} onChange={(e) => updateApplicant('gender', e.target.value)} required>
                      <option value="" disabled className="text-slate-400">Select...</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                      <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    </select>
                  </FormField>
                  <FormField label="Nationality" required>
                    <input type="text" className={inputClass} placeholder="e.g. Indian" value={applicant.nationality} onChange={(e) => updateApplicant('nationality', e.target.value)} required />
                  </FormField>
                  <FormField label="Address" required>
                    <input type="text" className={inputClass} placeholder="Street address" value={applicant.address} onChange={(e) => updateApplicant('address', e.target.value)} required />
                  </FormField>
                  <FormField label="City" required>
                    <input type="text" className={inputClass} value={applicant.city} onChange={(e) => updateApplicant('city', e.target.value)} required />
                  </FormField>
                  <FormField label="State" required>
                    <input type="text" className={inputClass} value={applicant.state} onChange={(e) => updateApplicant('state', e.target.value)} required />
                  </FormField>
                  <FormField label="Country" required>
                    <input type="text" className={inputClass} value={applicant.country} onChange={(e) => updateApplicant('country', e.target.value)} required />
                  </FormField>
                  <FormField label="PIN / ZIP Code" required>
                    <input type="text" className={inputClass} value={applicant.pinCode} onChange={(e) => updateApplicant('pinCode', e.target.value)} required />
                  </FormField>
                  <FormField label="Personal ID Proof Type" required>
                    <select className={selectClass} value={applicant.personalIdProofType} onChange={(e) => updateApplicant('personalIdProofType', e.target.value)} required>
                      <option value="" disabled className="text-slate-400">Select...</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="AADHAAR">Aadhaar</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                      <option value="NATIONAL_ID">National ID</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </FormField>
                  <FormField label="Personal ID Proof Number" required>
                    <input type="text" className={inputClass} value={applicant.personalIdProofNumber} onChange={(e) => updateApplicant('personalIdProofNumber', e.target.value)} required />
                  </FormField>
                </div>

                <FormField label="Personal ID Proof Document" required>
                  <label className={uploadClass}>
                    <Upload size={18} className="text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-600">
                      {personalIdProofDocument ? personalIdProofDocument.name : 'Upload a scan/photo of your ID proof'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => setPersonalIdProofDocument(e.target.files?.[0] || null)}
                    />
                  </label>
                </FormField>
              </section>

              {/* CHANNEL — ALWAYS SHOWN */}
              <section className="space-y-7">
                <SectionHeading
                  title="Tell us about the channel."
                  hint="A name, a short description, and why you want it."
                />

                <div className="flex justify-center py-2">
                  <div className="relative group cursor-pointer">
                    <div className="h-24 w-24 overflow-hidden rounded-full border border-dashed border-slate-300 bg-surface/50 flex flex-col items-center justify-center transition-colors group-hover:border-[#205ca8] group-hover:bg-[#205ca8]/[0.04]">
                      {iconPreview ? (
                        <img src={iconPreview} alt="Icon preview" className="h-full w-full object-cover" />
                      ) : (
                        <>
                          <Upload size={22} className="text-slate-400 group-hover:text-[#205ca8] mb-1 transition-colors dark:group-hover:text-[#7cbaff]" />
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold group-hover:text-[#205ca8] transition-colors dark:group-hover:text-[#7cbaff]">
                            Icon
                          </span>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/png, image/svg+xml" onChange={handleIconChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>

                {/* An organisation's icon is printed on its certificates: show how. */}
                {!isPersonal && (
                  <div className="mx-auto max-w-lg space-y-2">
                    <IssuerLogoPreview logoSrc={iconPreview} organisationName={name} />
                    <p className="text-[11px] font-medium leading-relaxed text-slate-500">
                      This icon is your organisation's logo: it is printed on every badge and certificate your channel
                      issues. Use a square PNG or SVG with a transparent background. You can change it later
                      from the channel's settings.
                    </p>
                  </div>
                )}

                <FormField label="Channel Name" required>
                  <input
                    type="text"
                    value={isPersonal ? personalName : name}
                    onChange={(e) => !isPersonal && setName(e.target.value)}
                    readOnly={isPersonal}
                    maxLength={150}
                    className={`${inputClass} ${isPersonal ? 'text-slate-500 cursor-not-allowed' : ''}`}
                    placeholder="E.g., Tech Tutorials"
                    required
                  />
                </FormField>

                <FormField label="Description">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    className={`${textareaClass} min-h-[120px]`}
                    placeholder="What is your channel about?"
                  />
                </FormField>

                <FormField label="Purpose" required>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    className={`${textareaClass} min-h-[100px]`}
                    placeholder="Why do you want to create this channel?"
                    required
                  />
                </FormField>
              </section>

              {/* ORGANIZATION — ONLY WHEN ORGANIZATION IS SELECTED */}
              {!isPersonal && (
                <section className="space-y-7">
                  <SectionHeading
                    title="And the organization."
                    hint="Details of the organization the channel will represent."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                    <FormField label="Organization Name" required>
                      <input type="text" className={inputClass} value={organization.organizationName} onChange={(e) => updateOrganization('organizationName', e.target.value)} required />
                    </FormField>
                    <FormField label="Organization Type" required>
                      <input type="text" className={inputClass} placeholder="e.g. Nonprofit, Company, Educational" value={organization.organizationType} onChange={(e) => updateOrganization('organizationType', e.target.value)} required />
                    </FormField>
                    <FormField label="Organization Email" required>
                      <input type="email" className={inputClass} placeholder="contact@example.org" value={organization.organizationEmail} onChange={(e) => updateOrganization('organizationEmail', e.target.value)} required />
                    </FormField>
                    <FormField label="Organization Website">
                      <input type="url" className={inputClass} placeholder="https://" value={organization.organizationWebsite} onChange={(e) => updateOrganization('organizationWebsite', e.target.value)} />
                    </FormField>
                    <FormField label="Registration/Identification Number" required>
                      <input type="text" className={inputClass} value={organization.organizationRegistrationNumber} onChange={(e) => updateOrganization('organizationRegistrationNumber', e.target.value)} required />
                    </FormField>
                    <FormField label="Role in Organization" required>
                      <input type="text" className={inputClass} placeholder="e.g. Founder, Admin, Coordinator" value={organization.roleInOrganization} onChange={(e) => updateOrganization('roleInOrganization', e.target.value)} required />
                    </FormField>
                    <FormField label="Organization Proof/Identification Number" required>
                      <input type="text" className={inputClass} value={organization.organizationProofNumber} onChange={(e) => updateOrganization('organizationProofNumber', e.target.value)} required />
                    </FormField>
                  </div>

                  <FormField label="Organization Address" required>
                    <input type="text" className={inputClass} value={organization.organizationAddress} onChange={(e) => updateOrganization('organizationAddress', e.target.value)} required />
                  </FormField>

                  <FormField label="Organization Description" required>
                    <textarea
                      rows={4}
                      className={`${textareaClass} min-h-[120px]`}
                      placeholder="What does the organization do?"
                      value={organization.organizationDescription}
                      onChange={(e) => updateOrganization('organizationDescription', e.target.value)}
                      required
                    />
                  </FormField>

                  <FormField label="Organization Proof Document" required>
                    <label className={uploadClass}>
                      <Upload size={18} className="text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-600">
                        {organizationProofDocument ? organizationProofDocument.name : 'Upload organization proof document'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => setOrganizationProofDocument(e.target.files?.[0] || null)}
                      />
                    </label>
                  </FormField>
                </section>
              )}

              {/* SUBMIT */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || Boolean(dobError)}
                  className="relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-ink hover:bg-[#205ca8] text-on-ink font-medium text-sm tracking-wide shadow-sm hover:shadow-md transition-all duration-300 ease-out group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <PebbleLoader tone="light" size="sm" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Request</span>
                      <span className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                        <ArrowUpRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChannelInviteCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="landing-root relative flex min-h-[calc(100vh-140px)] items-center justify-center">
          <EditorialBackdrop />
          <PebbleLoader label="Loading" />
        </div>
      }
    >
      <ChannelInviteCreateContent />
    </Suspense>
  );
}
