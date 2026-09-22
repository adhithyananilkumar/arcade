'use client';

/**
 * Step 3 of the invite-gated channel creation flow (plan Frontend §2.3-4): once the user has a
 * validated token AND is authenticated (enforced by /channel-invite redirecting here only in that
 * case), collect the full applicant profile + channel details + (conditionally) organization
 * details, then submit via the extended `channelService.createChannelRequest`.
 *
 * Visual language is shared with /reach-us: the pastel atmospheric backdrop, the editorial serif
 * headings and the underlined form fields all come from that page so the two public forms read
 * as one system.
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Upload, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import '@/apps/public/landing.css';
import { channelService, ChannelApplicantInput, ChannelOrganizationInput } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { PebbleLoader } from '@/domains/identity';
import { AtmosphericBackground, fadeInUp } from '../invite-chrome';

/** Editorial label + field wrapper — mono uppercase label, blue required marker. */
function FormField({
  label,
  required,
  children,
  className = '',
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
        {label} {required && <span className="text-blue-600">*</span>}
      </label>
      {children}
    </div>
  );
}

/** Section heading with the hairline accent rule used on /reach-us. */
function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2.5 pb-5 border-b border-slate-200/70">
      <h2 className="text-2xl sm:text-3xl font-normal font-serif italic text-[#0B132B] tracking-tight leading-snug">
        {title}
      </h2>
      <span className="block h-0.5 w-10 bg-[#205ca8]/60 rounded-full" />
      <p className="text-sm text-slate-500 leading-relaxed pt-0.5">{description}</p>
    </div>
  );
}

const inputClass =
  'w-full py-3 bg-transparent border-b border-slate-300 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:border-[#205ca8] transition-colors';

const selectClass = `${inputClass} cursor-pointer`;

const textareaClass =
  'w-full px-4 py-3 bg-white/50 border border-slate-300/80 rounded-xl text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#205ca8]/15 focus:border-[#205ca8] transition-all resize-none';

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
  const [personalIdProofDocument, setPersonalIdProofDocument] = useState<File | null>(null);

  const [organization, setOrganization] = useState(emptyOrganization);
  const [organizationProofDocument, setOrganizationProofDocument] = useState<File | null>(null);

  const personalName = (user?.fullName || user?.email || '').trim();

  const updateApplicant = (field: keyof typeof emptyApplicant, value: string) => {
    setApplicant((prev) => ({ ...prev, [field]: value }));
  };

  const updateOrganization = (field: keyof typeof emptyOrganization, value: string) => {
    setOrganization((prev) => ({ ...prev, [field]: value }));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
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
      <div className="landing-root min-h-[calc(100vh-140px)] flex items-center justify-center px-6">
        <AtmosphericBackground />
        <PebbleLoader label="Getting things ready" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="landing-root min-h-[calc(100vh-140px)] flex items-center justify-center relative text-[#0f172a] font-sans px-6 sm:px-12 lg:px-20 py-24">
        <AtmosphericBackground />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg space-y-4"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-normal font-serif italic text-[#0B132B]">Request Received.</h2>
          <p className="text-slate-600 text-sm max-w-md leading-relaxed">
            Thanks — your channel creation request is now pending approval. An administrator will
            review your applicant details and get back to you by email.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push('/')}
              className="text-xs font-mono uppercase tracking-wider text-[#205ca8] font-bold hover:underline"
            >
              ← Back to homepage
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="landing-root min-h-[calc(100vh-140px)] relative text-[#0f172a] font-sans pt-28 sm:pt-32 lg:pt-36 pb-16 lg:pb-20 px-6 sm:px-12 lg:px-20 selection:bg-blue-100 selection:text-blue-900">
      <AtmosphericBackground />

      <div className="w-[84vw] max-w-[1400px] mx-auto">
        {/* EDITORIAL TWO-COLUMN COMPOSITION (LEFT ~46% / RIGHT ~54%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT SIDE — INVITATION CONTEXT (~46%) */}
          <div className="lg:col-span-5 -mt-4 lg:-mt-14 lg:sticky lg:top-32">
            <motion.h1
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate="visible"
              custom={0}
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-[56px] tracking-tight text-[#0B132B] leading-[1.08] font-serif whitespace-nowrap mb-8"
            >
              <span className="font-bold text-[#0B132B]">You&apos;re</span>{' '}
              <span className="italic font-normal text-[#205ca8]">invited.</span>
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate="visible"
              custom={2}
              variants={fadeInUp}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-[480px] font-normal mb-12"
            >
              Someone at Arcade thinks your work belongs here. Fill in the details below and
              we&apos;ll take your channel through review.
            </motion.p>

            <motion.span
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate="visible"
              custom={3}
              variants={fadeInUp}
              className="block h-px w-full max-w-xs bg-slate-200/80 mb-8"
            />

            <motion.div
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate="visible"
              custom={4}
              variants={fadeInUp}
              className="space-y-7"
            >
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  Signed in as
                </p>
                <p className="text-base sm:text-lg font-bold text-[#0B132B] font-bricolage leading-snug">
                  {user?.fullName || user?.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  What happens next
                </p>
                <p className="text-sm text-slate-500 leading-relaxed max-w-[420px]">
                  Your request goes to an Arcade administrator for review. Keep an eye on your inbox
                  — we&apos;ll write to you either way.
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-snug pt-6 border-t border-slate-200/60">
                Everything you share here is used only to verify your identity.
              </p>
            </motion.div>
          </div>

          {/* RIGHT SIDE — EDITORIAL FORM EXPERIENCE (~54%) */}
          <div className="lg:col-span-7 lg:pl-6">
            <motion.form
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate="visible"
              custom={2}
              variants={fadeInUp}
              onSubmit={handleSubmit}
              className="space-y-14"
            >
              {/* ── CHANNEL TYPE ─────────────────────────────────────────── */}
              <section className="space-y-7">
                <SectionHeading
                  title="Tell us who this channel is for."
                  description="Personal channels carry your own name. Organization channels need a few extra proofs."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { personal: true, title: 'Personal Channel', blurb: 'Published under your own name.' },
                    { personal: false, title: 'Organization Channel', blurb: 'Published on behalf of a team.' },
                  ].map((option) => {
                    const active = isPersonal === option.personal;
                    return (
                      <button
                        key={option.title}
                        type="button"
                        onClick={() => {
                          setIsPersonal(option.personal);
                          if (!option.personal) setName('');
                        }}
                        className={`text-left px-5 py-4 rounded-xl border transition-all ${
                          active
                            ? 'border-[#205ca8] bg-white/70 shadow-sm'
                            : 'border-slate-300/80 bg-white/40 hover:border-slate-400'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border-[5px] transition-colors ${
                              active ? 'border-[#205ca8]' : 'border-slate-300'
                            }`}
                          />
                          <span className="text-sm font-semibold text-[#0B132B]">{option.title}</span>
                        </span>
                        <span className="block text-xs text-slate-500 mt-1.5 pl-6 leading-relaxed">
                          {option.blurb}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ── APPLICANT DETAILS ────────────────────────────────────── */}
              <section className="space-y-7">
                <SectionHeading
                  title="A little about you."
                  description="These details are used to verify the person behind the channel."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                  <FormField label="FULL NAME" required>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g. Rahul Sharma"
                      value={applicant.fullName}
                      onChange={(e) => updateApplicant('fullName', e.target.value)}
                      required
                    />
                  </FormField>
                  <FormField label="PHONE NUMBER" required>
                    <input
                      type="tel"
                      className={inputClass}
                      placeholder="+91 98765 43210"
                      value={applicant.phoneNumber}
                      onChange={(e) => updateApplicant('phoneNumber', e.target.value)}
                      required
                    />
                  </FormField>
                  <FormField label="EMAIL ADDRESS" required>
                    <input
                      type="email"
                      className={inputClass}
                      placeholder="rahul@example.com"
                      value={applicant.email}
                      onChange={(e) => updateApplicant('email', e.target.value)}
                      required
                    />
                  </FormField>
                  <FormField label="DATE OF BIRTH" required>
                    <input
                      type="date"
                      className={inputClass}
                      value={applicant.dateOfBirth}
                      onChange={(e) => updateApplicant('dateOfBirth', e.target.value)}
                      required
                    />
                  </FormField>
                  <FormField label="GENDER" required>
                    <select
                      className={selectClass}
                      value={applicant.gender}
                      onChange={(e) => updateApplicant('gender', e.target.value)}
                      required
                    >
                      <option value="" disabled className="text-slate-400">
                        Select...
                      </option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                      <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    </select>
                  </FormField>
                  <FormField label="NATIONALITY" required>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g. Indian"
                      value={applicant.nationality}
                      onChange={(e) => updateApplicant('nationality', e.target.value)}
                      required
                    />
                  </FormField>
                  <FormField label="ADDRESS" required className="sm:col-span-2">
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Street, area, landmark"
                      value={applicant.address}
                      onChange={(e) => updateApplicant('address', e.target.value)}
                      required
                    />
                  </FormField>
                  <FormField label="CITY" required>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g. Kottayam"
                      value={applicant.city}
                      onChange={(e) => updateApplicant('city', e.target.value)}
                      required
                    />
                  </FormField>
                  <FormField label="STATE" required>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g. Kerala"
                      value={applicant.state}
                      onChange={(e) => updateApplicant('state', e.target.value)}
                      required
                    />
                  </FormField>
                  <FormField label="COUNTRY" required>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g. India"
                      value={applicant.country}
                      onChange={(e) => updateApplicant('country', e.target.value)}
                      required
                    />
                  </FormField>
                  <FormField label="PIN / ZIP CODE" required>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="686518"
                      value={applicant.pinCode}
                      onChange={(e) => updateApplicant('pinCode', e.target.value)}
                      required
                    />
                  </FormField>
                  <FormField label="ID PROOF TYPE" required>
                    <select
                      className={selectClass}
                      value={applicant.personalIdProofType}
                      onChange={(e) => updateApplicant('personalIdProofType', e.target.value)}
                      required
                    >
                      <option value="" disabled className="text-slate-400">
                        Select...
                      </option>
                      <option value="PASSPORT">Passport</option>
                      <option value="AADHAAR">Aadhaar</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                      <option value="NATIONAL_ID">National ID</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </FormField>
                  <FormField label="ID PROOF NUMBER" required>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Document number"
                      value={applicant.personalIdProofNumber}
                      onChange={(e) => updateApplicant('personalIdProofNumber', e.target.value)}
                      required
                    />
                  </FormField>
                </div>

                <FormField label="ID PROOF DOCUMENT" required>
                  <label className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300/90 bg-white/50 px-4 py-3.5 cursor-pointer hover:border-[#205ca8] hover:bg-white/80 transition-all">
                    <Upload size={18} className="text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-600 truncate">
                      {personalIdProofDocument
                        ? personalIdProofDocument.name
                        : 'Upload a scan or photo of your ID proof'}
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

              {/* ── CHANNEL DETAILS ──────────────────────────────────────── */}
              <section className="space-y-7">
                <SectionHeading
                  title="Now, about the channel."
                  description="This is what people will see when they find you on Arcade."
                />

                <div className="flex items-center gap-5">
                  <div className="relative group cursor-pointer shrink-0">
                    <div className="h-20 w-20 overflow-hidden rounded-full border border-dashed border-slate-300 bg-white/50 flex flex-col items-center justify-center transition-colors group-hover:border-[#205ca8] group-hover:bg-white/80">
                      {iconPreview ? (
                        <img src={iconPreview} alt="Icon preview" className="h-full w-full object-cover" />
                      ) : (
                        <Upload size={20} className="text-slate-400 group-hover:text-[#205ca8] transition-colors" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                      CHANNEL ICON
                    </p>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                      Square image, at least 256×256. Optional — you can add one later.
                    </p>
                  </div>
                </div>

                <FormField label="CHANNEL NAME" required>
                  <input
                    type="text"
                    value={isPersonal ? personalName : name}
                    onChange={(e) => !isPersonal && setName(e.target.value)}
                    readOnly={isPersonal}
                    maxLength={150}
                    className={`${inputClass} ${isPersonal ? 'text-slate-500 cursor-not-allowed' : ''}`}
                    placeholder="e.g. Tech Tutorials"
                    required
                  />
                  {isPersonal && (
                    <p className="text-xs text-slate-400 leading-relaxed">
                      A personal channel is always named after you.
                    </p>
                  )}
                </FormField>

                <FormField label="DESCRIPTION">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    className={`${textareaClass} min-h-[120px]`}
                    placeholder="What is your channel about?"
                  />
                </FormField>

                <FormField label="PURPOSE" required>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    className={`${textareaClass} min-h-[120px]`}
                    placeholder="Why do you want to create this channel?"
                    required
                  />
                </FormField>
              </section>

              {/* ── ORGANIZATION DETAILS — only when Organization is selected ── */}
              {!isPersonal && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-7"
                >
                  <SectionHeading
                    title="And the organization."
                    description="We verify organizations before their channel goes live."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                    <FormField label="ORGANIZATION NAME" required>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="e.g. Arcade Labs"
                        value={organization.organizationName}
                        onChange={(e) => updateOrganization('organizationName', e.target.value)}
                        required
                      />
                    </FormField>
                    <FormField label="ORGANIZATION TYPE" required>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="Nonprofit, Company, Educational"
                        value={organization.organizationType}
                        onChange={(e) => updateOrganization('organizationType', e.target.value)}
                        required
                      />
                    </FormField>
                    <FormField label="ORGANIZATION EMAIL" required>
                      <input
                        type="email"
                        className={inputClass}
                        placeholder="hello@organization.com"
                        value={organization.organizationEmail}
                        onChange={(e) => updateOrganization('organizationEmail', e.target.value)}
                        required
                      />
                    </FormField>
                    <FormField label="ORGANIZATION WEBSITE">
                      <input
                        type="url"
                        className={inputClass}
                        placeholder="https://"
                        value={organization.organizationWebsite}
                        onChange={(e) => updateOrganization('organizationWebsite', e.target.value)}
                      />
                    </FormField>
                    <FormField label="REGISTRATION NUMBER" required>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="Registration / identification no."
                        value={organization.organizationRegistrationNumber}
                        onChange={(e) => updateOrganization('organizationRegistrationNumber', e.target.value)}
                        required
                      />
                    </FormField>
                    <FormField label="YOUR ROLE" required>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="Founder, Admin, Coordinator"
                        value={organization.roleInOrganization}
                        onChange={(e) => updateOrganization('roleInOrganization', e.target.value)}
                        required
                      />
                    </FormField>
                    <FormField label="PROOF NUMBER" required>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="Document number"
                        value={organization.organizationProofNumber}
                        onChange={(e) => updateOrganization('organizationProofNumber', e.target.value)}
                        required
                      />
                    </FormField>
                    <FormField label="ORGANIZATION ADDRESS" required>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="Street, city, country"
                        value={organization.organizationAddress}
                        onChange={(e) => updateOrganization('organizationAddress', e.target.value)}
                        required
                      />
                    </FormField>
                  </div>

                  <FormField label="ORGANIZATION DESCRIPTION" required>
                    <textarea
                      rows={4}
                      className={`${textareaClass} min-h-[120px]`}
                      placeholder="What does the organization do?"
                      value={organization.organizationDescription}
                      onChange={(e) => updateOrganization('organizationDescription', e.target.value)}
                      required
                    />
                  </FormField>

                  <FormField label="ORGANIZATION PROOF DOCUMENT" required>
                    <label className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300/90 bg-white/50 px-4 py-3.5 cursor-pointer hover:border-[#205ca8] hover:bg-white/80 transition-all">
                      <Upload size={18} className="text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-600 truncate">
                        {organizationProofDocument
                          ? organizationProofDocument.name
                          : 'Upload the organization proof document'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => setOrganizationProofDocument(e.target.files?.[0] || null)}
                      />
                    </label>
                  </FormField>
                </motion.section>
              )}

              {/* ── SUBMIT ───────────────────────────────────────────────── */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#0B132B] hover:bg-[#205ca8] text-white font-medium text-sm tracking-wide shadow-sm hover:shadow-md transition-all duration-300 ease-out group disabled:opacity-70 disabled:cursor-not-allowed"
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
        <div className="landing-root min-h-[calc(100vh-140px)] flex items-center justify-center px-6">
          <AtmosphericBackground />
          <PebbleLoader label="Loading" />
        </div>
      }
    >
      <ChannelInviteCreateContent />
    </Suspense>
  );
}
