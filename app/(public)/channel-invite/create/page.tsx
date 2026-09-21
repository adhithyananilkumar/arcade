'use client';

/**
 * Step 3 of the invite-gated channel creation flow (plan Frontend §2.3-4): once the user has a
 * validated token AND is authenticated (enforced by /channel-invite redirecting here only in that
 * case), collect the full applicant profile + channel details + (conditionally) organization
 * details, then submit via the extended `channelService.createChannelRequest`.
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Upload, CheckCircle2, PlaySquare } from 'lucide-react';
import { toast } from 'sonner';
import { channelService, ChannelApplicantInput, ChannelOrganizationInput } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({ label, required, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all';

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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl shadow-indigo-100/50">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-emerald-50 p-4 text-emerald-500">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Channel Creation Request Submitted</h2>
          <p className="text-sm text-gray-500 mt-2">
            Thanks — your request is now pending approval. An administrator will review your
            applicant details and get back to you.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pb-16 pt-10">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-gray-900">
          <PlaySquare className="text-indigo-600" size={28} />
          Create Your Channel
        </h1>
        <p className="mt-2 text-gray-500">
          You&apos;ve been invited to create a channel on Arcade. Fill in the details below to
          submit your request for review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Channel type */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Channel Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={isPersonal}
                onChange={() => setIsPersonal(true)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Personal Channel</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!isPersonal}
                onChange={() => {
                  setIsPersonal(false);
                  setName('');
                }}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Organization Channel</span>
            </label>
          </div>
        </div>

        {/* Applicant section — always shown */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-gray-900">Applicant Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Full Name" required>
              <input type="text" className={inputClass} value={applicant.fullName} onChange={(e) => updateApplicant('fullName', e.target.value)} required />
            </FormField>
            <FormField label="Phone Number" required>
              <input type="tel" className={inputClass} value={applicant.phoneNumber} onChange={(e) => updateApplicant('phoneNumber', e.target.value)} required />
            </FormField>
            <FormField label="Email Address" required>
              <input type="email" className={inputClass} value={applicant.email} onChange={(e) => updateApplicant('email', e.target.value)} required />
            </FormField>
            <FormField label="Date of Birth" required>
              <input type="date" className={inputClass} value={applicant.dateOfBirth} onChange={(e) => updateApplicant('dateOfBirth', e.target.value)} required />
            </FormField>
            <FormField label="Gender" required>
              <select className={inputClass} value={applicant.gender} onChange={(e) => updateApplicant('gender', e.target.value)} required>
                <option value="">Select...</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </FormField>
            <FormField label="Nationality" required>
              <input type="text" className={inputClass} value={applicant.nationality} onChange={(e) => updateApplicant('nationality', e.target.value)} required />
            </FormField>
            <FormField label="Address" required>
              <input type="text" className={inputClass} value={applicant.address} onChange={(e) => updateApplicant('address', e.target.value)} required />
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
              <select className={inputClass} value={applicant.personalIdProofType} onChange={(e) => updateApplicant('personalIdProofType', e.target.value)} required>
                <option value="">Select...</option>
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
            <label className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
              <Upload size={18} className="text-gray-400" />
              <span className="text-sm text-gray-600">
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
        </div>

        {/* Channel section — always shown */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-gray-900">Channel Details</h2>

          <div className="flex justify-center">
            <div className="relative group cursor-pointer">
              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center transition-colors group-hover:border-indigo-400 group-hover:bg-indigo-50">
                {iconPreview ? (
                  <img src={iconPreview} alt="Icon preview" className="h-full w-full object-cover" />
                ) : (
                  <>
                    <Upload size={24} className="text-gray-400 group-hover:text-indigo-500 mb-1" />
                    <span className="text-xs text-gray-500 font-medium group-hover:text-indigo-600">Upload Icon</span>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleIconChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <FormField label="Channel Name" required>
            <input
              type="text"
              value={isPersonal ? personalName : name}
              onChange={(e) => !isPersonal && setName(e.target.value)}
              readOnly={isPersonal}
              maxLength={150}
              className={`${inputClass} ${isPersonal ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="E.g., Tech Tutorials"
              required
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={2000}
              className={`${inputClass} resize-none`}
              placeholder="What is your channel about?"
            />
          </FormField>

          <FormField label="Purpose" required>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={2}
              maxLength={1000}
              className={`${inputClass} resize-none`}
              placeholder="Why do you want to create this channel?"
              required
            />
          </FormField>
        </div>

        {/* Organization section — only when Organization is selected */}
        {!isPersonal && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Organization Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Organization Name" required>
                <input type="text" className={inputClass} value={organization.organizationName} onChange={(e) => updateOrganization('organizationName', e.target.value)} required />
              </FormField>
              <FormField label="Organization Type" required>
                <input type="text" className={inputClass} placeholder="e.g. Nonprofit, Company, Educational" value={organization.organizationType} onChange={(e) => updateOrganization('organizationType', e.target.value)} required />
              </FormField>
              <FormField label="Organization Email" required>
                <input type="email" className={inputClass} value={organization.organizationEmail} onChange={(e) => updateOrganization('organizationEmail', e.target.value)} required />
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
              <textarea rows={3} className={`${inputClass} resize-none`} value={organization.organizationDescription} onChange={(e) => updateOrganization('organizationDescription', e.target.value)} required />
            </FormField>
            <FormField label="Organization Proof Document" required>
              <label className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                <Upload size={18} className="text-gray-400" />
                <span className="text-sm text-gray-600">
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
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Channel Creation Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ChannelInviteCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      }
    >
      <ChannelInviteCreateContent />
    </Suspense>
  );
}
