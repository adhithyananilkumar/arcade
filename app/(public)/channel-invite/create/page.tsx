'use client';

/**
 * Channel Invite & Creation Page
 * Matches the reference design with the white-framed dark hero,
 * and seamless full-white application workflow below.
 */

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2,
  Upload,
  CheckCircle2,
  Menu,
  ArrowDown,
  Sparkles,
  ShieldCheck,
  Building2,
  User,
  X,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import { channelService, ChannelApplicantInput, ChannelOrganizationInput } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { ParticleWaveBackground } from '@/components/landing/ParticleWaveBackground';
import Footer from '@/apps/public/components/landing/Footer';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

function FormField({ label, required, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
        <span>
          {label} {required && <span className="text-red-500">*</span>}
        </span>
        {hint && <span className="text-[11px] font-normal text-slate-500">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const lightInputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-xs transition-all duration-200 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

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

function LightbulbGraphic() {
  return (
    <div className="relative flex h-full w-full items-center justify-center select-none pointer-events-none">
      {/* Ambient glowing radial auras */}
      <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-yellow-400/25 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/20 blur-[120px] pointer-events-none" />

      <svg
        viewBox="0 0 500 700"
        className="h-full w-full max-h-[85vh] max-w-[580px] drop-shadow-[0_0_35px_rgba(255,234,0,0.35)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Ring */}
        <circle
          cx="250"
          cy="260"
          r="190"
          stroke="#ffffff"
          strokeWidth="2.5"
          className="opacity-95"
        />

        {/* Sunburst Rays around the ring */}
        <line x1="250" y1="50" x2="250" y2="20" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="175" y1="70" x2="155" y2="42" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="325" y1="70" x2="345" y2="42" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="110" y1="125" x2="85" y2="105" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="390" y1="125" x2="415" y2="105" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="68" y1="200" x2="40" y2="190" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="432" y1="200" x2="460" y2="190" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="68" y1="320" x2="40" y2="330" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="432" y1="320" x2="460" y2="330" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

        {/* Outer subtle glow filter */}
        <defs>
          <filter id="bulbGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="bulbYellowGrad" x1="250" y1="140" x2="250" y2="370" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF736" />
            <stop offset="70%" stopColor="#FFEE00" />
            <stop offset="100%" stopColor="#FFD000" />
          </linearGradient>
        </defs>

        {/* Illuminated Yellow Lightbulb Glass Body */}
        <path
          d="M 250 140 
             C 185 140, 160 190, 160 250 
             C 160 295, 190 330, 212 365 
             L 212 375 
             L 288 375 
             L 288 365 
             C 310 330, 340 295, 340 250 
             C 340 190, 315 140, 250 140 Z"
          fill="url(#bulbYellowGrad)"
          filter="url(#bulbGlow)"
          stroke="#FFEE00"
          strokeWidth="1.5"
        />

        {/* Inner Glass Highlights / Reflections */}
        <path
          d="M 185 180 C 172 205, 172 245, 185 270"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="opacity-70"
        />

        {/* Inner Glowing Filament */}
        <path
          d="M 225 320 L 235 250 L 244 280 L 250 245 L 256 280 L 265 250 L 275 320"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-90"
        />
        <circle cx="235" cy="250" r="3" fill="#ffffff" />
        <circle cx="265" cy="250" r="3" fill="#ffffff" />

        {/* Lightbulb Metallic Screw Base */}
        <rect x="216" y="376" width="68" height="9" rx="4.5" fill="#0E172A" stroke="#ffffff" strokeWidth="2.5" />
        <rect x="220" y="388" width="60" height="9" rx="4.5" fill="#0E172A" stroke="#ffffff" strokeWidth="2.5" />
        <rect x="225" y="400" width="50" height="9" rx="4.5" fill="#0E172A" stroke="#ffffff" strokeWidth="2.5" />
        <path d="M 233 411 C 233 420, 267 420, 267 411 Z" fill="#0E172A" stroke="#ffffff" strokeWidth="2.5" />

        {/* Long White Cord Line extending straight down */}
        <line
          x1="250"
          y1="418"
          x2="250"
          y2="700"
          stroke="#ffffff"
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
}

function ChannelInviteCreateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { user, status } = useAuthStore();

  const formSectionRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const [tokenInfo, setTokenInfo] = useState<{ email?: string; accountExists?: boolean; valid?: boolean } | null>(null);

  const personalName = (user?.fullName || user?.email || applicant.fullName || '').trim();

  // Validate token asynchronously without redirecting away unauthenticated users
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const result = await channelService.validateCreationInvitation(token);
        if (cancelled) return;
        setTokenInfo(result);
        if (result.email) {
          setApplicant((prev) => ({
            ...prev,
            email: prev.email || result.email || '',
          }));
        }
      } catch (err) {
        // Keep page accessible
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Compute sign-in URL with prefilled email & mode
  const signUrl = (() => {
    const createPath = `/channel-invite/create${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const params = new URLSearchParams({ redirect: createPath });
    if (tokenInfo?.email) params.set('email', tokenInfo.email);
    if (tokenInfo?.accountExists === false) params.set('mode', 'signup');
    return `/sign?${params.toString()}`;
  })();

  // Autofill user details if available
  useEffect(() => {
    if (user) {
      setApplicant((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || tokenInfo?.email || '',
      }));
    }
  }, [user, tokenInfo]);

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

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        scrollToForm();
        return;
      }
    }
    if (!personalIdProofDocument) {
      toast.error('Please upload your ID proof document.');
      scrollToForm();
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
          scrollToForm();
          return;
        }
      }
      if (!organizationProofDocument) {
        toast.error('Please upload the organization proof document.');
        scrollToForm();
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

    if (status !== 'authenticated') {
      toast.error('Please sign in or create an account to submit your channel creation request.');
      router.push(signUrl);
      return;
    }

    try {
      setIsLoading(true);
      await channelService.createChannelRequest(finalName, description.trim(), isPersonal, iconFile || undefined, {
        invitationToken: token,
        purpose: purpose.trim(),
        applicant: applicantInput,
        organization: organizationInput,
      });
      setSubmitted(true);
      toast.success('Channel request submitted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit channel request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-cyan-500 selection:text-black flex flex-col font-sans relative">
      {/* ------------------------------------------------------------- */}
      {/* 1. FIXED FLOATING NAVIGATION (Only Arcade & Buttons Float)    */}
      {/* ------------------------------------------------------------- */}
      <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 pointer-events-none flex justify-center px-4 sm:px-8 md:px-12">
        <div className="w-full max-w-[1720px] flex items-center justify-between px-2 sm:px-4">
          {/* Brand Logo - arcade. */}
          <Link href="/" className="pointer-events-auto flex items-center group pl-1">
            <img
              src="/arcade.svg"
              alt="arcade."
              className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-[1.03]"
            />
          </Link>

          {/* White Pill Navigation Buttons */}
          <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 md:gap-3.5">
            <nav className="hidden md:flex items-center gap-2.5 sm:gap-3 md:gap-3.5">
              <Link
                href="/"
                className="rounded-full bg-white px-6 py-2.5 md:px-7 md:py-2.5 text-xs sm:text-sm md:text-[15px] font-semibold text-slate-900 shadow-md shadow-black/10 border border-slate-200/80 transition-all duration-200 hover:bg-slate-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Home
              </Link>
              <Link
                href="/articles"
                className="rounded-full bg-white px-6 py-2.5 md:px-7 md:py-2.5 text-xs sm:text-sm md:text-[15px] font-semibold text-slate-900 shadow-md shadow-black/10 border border-slate-200/80 transition-all duration-200 hover:bg-slate-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Blog
              </Link>
              <Link
                href="/workshops"
                className="rounded-full bg-white px-6 py-2.5 md:px-7 md:py-2.5 text-xs sm:text-sm md:text-[15px] font-semibold text-slate-900 shadow-md shadow-black/10 border border-slate-200/80 transition-all duration-200 hover:bg-slate-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Projects
              </Link>
              <Link
                href="/reach-us"
                className="rounded-full bg-white px-6 py-2.5 md:px-7 md:py-2.5 text-xs sm:text-sm md:text-[15px] font-semibold text-slate-900 shadow-md shadow-black/10 border border-slate-200/80 transition-all duration-200 hover:bg-slate-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Contact Us
              </Link>
            </nav>

            {/* User Profile / Auth Pill Button */}
            {user ? (
              <div className="flex items-center gap-2.5 rounded-full bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 shadow-md shadow-black/10 border border-slate-200/80 transition-all">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 text-black text-xs font-black font-mono">
                  {(user.fullName || user.email || 'A')[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[140px] truncate">{user.fullName || user.email}</span>
              </div>
            ) : (
              <Link
                href={signUrl}
                className="rounded-full bg-white px-6 py-2.5 md:px-7 md:py-2.5 text-xs sm:text-sm md:text-[15px] font-semibold text-slate-900 shadow-md shadow-black/10 border border-slate-200/80 transition-all duration-200 hover:bg-slate-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {tokenInfo?.accountExists === false ? 'Create Account' : 'Sign In'}
              </Link>
            )}

            {/* Mobile Menu Pill Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center rounded-full bg-white p-2.5 px-3.5 text-slate-900 shadow-md shadow-black/10 border border-slate-200/80 transition-all duration-200 hover:bg-slate-50 hover:shadow-lg active:scale-[0.98] cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. TOP WHITE FRAME CONTAINER (Framing the Dark Hero Card)     */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full bg-white px-3 sm:px-5 md:px-7 lg:px-8 pt-[74px] sm:pt-[84px] md:pt-[92px] pb-3 sm:pb-5">
        {/* DARK HERO CARD */}
        <div className="w-full rounded-[22px] sm:rounded-[28px] md:rounded-[36px] overflow-hidden flex flex-col min-h-[calc(100vh-90px)] sm:min-h-[calc(100vh-104px)] md:min-h-[calc(100vh-112px)] relative bg-[#040817] text-white shadow-2xl pt-10 sm:pt-14">
          {/* Animated 3D Flowing Particle Wave Field (Canvas based, fluid 60fps) */}
          <ParticleWaveBackground className="opacity-85" />

          {/* Subtle atmospheric ambient glows behind hero content (Seamlessly blended, zero hard edges) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[80%] rounded-full bg-[radial-gradient(circle,rgba(14,116,244,0.08)_0%,rgba(2,13,32,0.03)_50%,transparent_75%)] blur-[100px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/[0.04] blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.04] blur-[150px] pointer-events-none" />

          {/* ----------------------------------------------------------- */}
          {/* HERO FOLD (1:1 with reference image)                        */}
          {/* ----------------------------------------------------------- */}
          <section
            ref={heroSectionRef}
            className="relative z-20 flex-1 flex flex-col justify-between px-6 sm:px-8 md:px-14 pb-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-6">
              {/* Left Column: Bold Typography & Action */}
              <div className="lg:col-span-6 xl:col-span-6 space-y-6 pt-4 lg:pt-0">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                  <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-[68px] font-extrabold tracking-tight text-white leading-[1.12]">
                    Your Idea &amp; <br />
                    Our Innovation <br />
                    <span className="text-white/95 font-medium">can change the game.</span>
                  </h1>

                  {/* Accent line under headline */}
                  <div className="w-16 h-[2.5px] bg-white/85 mt-4 rounded-full" />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
                  className="text-sm md:text-base text-slate-300/85 leading-relaxed max-w-lg font-light"
                >
                  New worlds offer us new challenges. The solutions to which, unveil that innovation is
                  inevitable, and perhaps, the only way to create a progressive world.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                  className="pt-2 flex flex-wrap items-center gap-4"
                >
                  {/* Outlined pill button matching reference */}
                  <button
                    onClick={scrollToForm}
                    className="rounded-full border border-white/70 px-8 py-3 text-xs md:text-sm font-semibold tracking-wider text-white hover:bg-white hover:text-slate-950 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-cyan-500/20 active:scale-95"
                  >
                    Show More
                  </button>

                  <button
                    onClick={scrollToForm}
                    className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3 text-xs md:text-sm font-semibold tracking-wider text-white hover:opacity-90 transition-all duration-300 cursor-pointer shadow-lg shadow-cyan-500/25 flex items-center gap-2 active:scale-95"
                  >
                    <Sparkles size={16} />
                    Accept &amp; Create Channel
                  </button>
                </motion.div>
              </div>

              {/* Right Column: Illuminated Lightbulb Graphic */}
              <div className="lg:col-span-6 xl:col-span-6 flex justify-center items-center relative min-h-[440px] md:min-h-[540px]">
                <LightbulbGraphic />
              </div>
            </div>

            {/* Invitation banner snippet (Bottom border of the hero card) */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Invitation Token Verified</span>
                <code className="px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 font-mono text-[11px]">
                  {token ? `${token.slice(0, 18)}...` : 'No token'}
                </code>
              </div>
              <button
                onClick={scrollToForm}
                className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                Complete Application Below <ArrowDown size={14} />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. FULL WHITE LOWER APPLICATION WORKFLOW SECTION              */}
      {/* ------------------------------------------------------------- */}
      <section
        ref={formSectionRef}
        className="w-full bg-white px-6 sm:px-10 md:px-16 py-16 sm:py-24 border-t border-slate-100"
      >
        <div className="max-w-4xl mx-auto space-y-10">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-10 text-center shadow-lg"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300">
                <CheckCircle2 size={44} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">Channel Request Submitted</h2>
              <p className="mt-3 text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                Congratulations! Your channel creation application has been received and is queued for
                administrative verification. You will be notified once reviewed.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link
                  href="/"
                  className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 transition-colors"
                >
                  Go to Homepage
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="text-center md:text-left space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
                  <ShieldCheck size={14} /> Invitation Gated Channel Creation
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                  Complete Your Channel Registration
                </h2>
                <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Provide the verified applicant information and channel specifications below to activate
                  your exclusive creator presence on the platform.
                </p>
              </div>

              {status !== 'authenticated' && (
                <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-cyan-50/90 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                        {tokenInfo?.accountExists === false ? 'Account Creation Required' : 'Authentication Required'}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {tokenInfo?.accountExists === false
                        ? 'Create an account to activate your channel'
                        : 'Sign in to claim and submit this channel'}
                    </h4>
                    <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                      {tokenInfo?.email ? (
                        <>
                          This invitation token is reserved for <strong className="text-slate-900 font-semibold">{tokenInfo.email}</strong>.
                          {' '}Please {tokenInfo.accountExists === false ? 'create an account' : 'sign in'} with this email to enable the submission of your channel application.
                        </>
                      ) : (
                        'You can preview the channel details below. To enable submission and link your verified identity, please sign in or create an account.'
                      )}
                    </p>
                  </div>

                  <Link
                    href={signUrl}
                    className="shrink-0 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 hover:scale-[1.02] transition-all cursor-pointer text-center"
                  >
                    {tokenInfo?.accountExists === false ? 'Create Account' : 'Sign In'}
                  </Link>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Channel Type Selector with Animated Sliding Capsule */}
                <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 md:p-8 space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Channel Classification</h3>
                      <p className="text-xs text-slate-500">Choose between individual creator or enterprise organization</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-200/70 text-slate-700 self-start sm:self-auto">
                      Step 1 of 3
                    </span>
                  </div>

                  {/* SLIDING PILL SELECTOR (Inspired by reference) */}
                  <div className="flex flex-col items-center sm:items-start pt-2">
                    <div className="relative inline-flex p-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-xl backdrop-blur-md w-full max-w-md">
                      {/* Personal Option */}
                      <button
                        type="button"
                        onClick={() => setIsPersonal(true)}
                        className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                          isPersonal ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isPersonal && (
                          <motion.div
                            layoutId="channelClassificationPill"
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 shadow-md shadow-purple-500/30"
                            transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <User size={16} />
                          Personal
                        </span>
                      </button>

                      {/* Organization Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsPersonal(false);
                          setName('');
                        }}
                        className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                          !isPersonal ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {!isPersonal && (
                          <motion.div
                            layoutId="channelClassificationPill"
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 shadow-md shadow-purple-500/30"
                            transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <Building2 size={16} />
                          Organization
                        </span>
                      </button>
                    </div>

                    {/* Contextual Information Card based on Selection */}
                    <motion.div
                      key={isPersonal ? 'personal-card' : 'org-card'}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-4 w-full rounded-2xl border border-slate-200 bg-white p-4.5 sm:p-5 shadow-sm"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`p-2.5 rounded-xl ${
                            isPersonal
                              ? 'bg-purple-50 text-purple-600 border border-purple-100'
                              : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                          }`}
                        >
                          {isPersonal ? <User size={20} /> : <Building2 size={20} />}
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            {isPersonal ? 'Personal Creator Channel' : 'Organization & Studio Channel'}
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                isPersonal
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}
                            >
                              {isPersonal ? 'Individual' : 'Enterprise'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {isPersonal
                              ? 'Directly tied to your verified profile identity. Ideal for independent authors, researchers, educators, and creators.'
                              : 'Designed for companies, registered brands, collectives, and academic institutions with multi-member governance.'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Channel Brand Identity */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Channel Profile &amp; Purpose</h3>
                      <p className="text-xs text-slate-500">Establish how your channel appears to audiences</p>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Step 2 of 3</span>
                  </div>

                  {/* Icon Uploader */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                    <div className="relative group cursor-pointer">
                      <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center transition-all group-hover:border-indigo-500 group-hover:bg-indigo-50/40">
                        {iconPreview ? (
                          <img src={iconPreview} alt="Channel Icon" className="h-full w-full object-cover" />
                        ) : (
                          <>
                            <Upload size={24} className="text-slate-400 group-hover:text-indigo-600 mb-1" />
                            <span className="text-[11px] text-slate-500 font-medium group-hover:text-indigo-600">
                              Upload Icon
                            </span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="text-sm font-semibold text-slate-900">Channel Avatar / Badge</div>
                      <div className="text-xs text-slate-500">
                        Square PNG, JPG or WebP. Recommended 512x512px.
                      </div>
                    </div>
                  </div>

                  <FormField
                    label="Channel Display Name"
                    required
                    hint={isPersonal ? 'Inherited from your verified user profile' : 'Organization or brand name'}
                  >
                    <input
                      type="text"
                      value={isPersonal ? personalName : name}
                      onChange={(e) => !isPersonal && setName(e.target.value)}
                      readOnly={isPersonal}
                      maxLength={150}
                      className={`${lightInputClass} ${isPersonal ? 'bg-slate-100 cursor-not-allowed text-slate-600' : ''}`}
                      placeholder="e.g. Apex Studio or Quantum Labs"
                      required
                    />
                  </FormField>

                  <FormField label="Channel Description">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      maxLength={2000}
                      className={`${lightInputClass} resize-none`}
                      placeholder="Summarize your channel's content, vision, and mission..."
                    />
                  </FormField>

                  <FormField label="Creation Purpose / Justification" required>
                    <textarea
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      rows={2}
                      maxLength={1000}
                      className={`${lightInputClass} resize-none`}
                      placeholder="Why do you wish to establish this channel on Arcade?"
                      required
                    />
                  </FormField>
                </div>

                {/* Applicant Identity Details */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Applicant Verification Details</h3>
                      <p className="text-xs text-slate-500">Personal information for KYC and compliance</p>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Step 3 of 3</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField label="Full Legal Name" required>
                      <input
                        type="text"
                        className={lightInputClass}
                        value={applicant.fullName}
                        onChange={(e) => updateApplicant('fullName', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Phone Number" required>
                      <input
                        type="tel"
                        className={lightInputClass}
                        placeholder="+1 555 000 0000"
                        value={applicant.phoneNumber}
                        onChange={(e) => updateApplicant('phoneNumber', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Email Address" required>
                      <input
                        type="email"
                        className={lightInputClass}
                        value={applicant.email}
                        onChange={(e) => updateApplicant('email', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Date of Birth" required>
                      <input
                        type="date"
                        className={lightInputClass}
                        value={applicant.dateOfBirth}
                        onChange={(e) => updateApplicant('dateOfBirth', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Gender" required>
                      <select
                        className={lightInputClass}
                        value={applicant.gender}
                        onChange={(e) => updateApplicant('gender', e.target.value)}
                        required
                      >
                        <option value="" className="text-slate-400">
                          Select gender...
                        </option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                      </select>
                    </FormField>

                    <FormField label="Nationality" required>
                      <input
                        type="text"
                        className={lightInputClass}
                        placeholder="e.g. American, Canadian, Indian"
                        value={applicant.nationality}
                        onChange={(e) => updateApplicant('nationality', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Residential Street Address" required>
                      <input
                        type="text"
                        className={lightInputClass}
                        value={applicant.address}
                        onChange={(e) => updateApplicant('address', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="City" required>
                      <input
                        type="text"
                        className={lightInputClass}
                        value={applicant.city}
                        onChange={(e) => updateApplicant('city', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="State / Province" required>
                      <input
                        type="text"
                        className={lightInputClass}
                        value={applicant.state}
                        onChange={(e) => updateApplicant('state', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Country" required>
                      <input
                        type="text"
                        className={lightInputClass}
                        value={applicant.country}
                        onChange={(e) => updateApplicant('country', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Postal / ZIP Code" required>
                      <input
                        type="text"
                        className={lightInputClass}
                        value={applicant.pinCode}
                        onChange={(e) => updateApplicant('pinCode', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Personal ID Proof Type" required>
                      <select
                        className={lightInputClass}
                        value={applicant.personalIdProofType}
                        onChange={(e) => updateApplicant('personalIdProofType', e.target.value)}
                        required
                      >
                        <option value="" className="text-slate-400">
                          Select proof type...
                        </option>
                        <option value="PASSPORT">Passport</option>
                        <option value="AADHAAR">Aadhaar</option>
                        <option value="DRIVING_LICENSE">Driving License</option>
                        <option value="NATIONAL_ID">National ID</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </FormField>

                    <FormField label="Personal ID Proof Number" required>
                      <input
                        type="text"
                        className={lightInputClass}
                        placeholder="Unique identification number"
                        value={applicant.personalIdProofNumber}
                        onChange={(e) => updateApplicant('personalIdProofNumber', e.target.value)}
                        required
                      />
                    </FormField>
                  </div>

                  <FormField label="Upload ID Document Proof" required>
                    <label className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/40 transition-colors">
                      <Upload size={20} className="text-indigo-600" />
                      <span className="text-sm text-slate-600">
                        {personalIdProofDocument
                          ? personalIdProofDocument.name
                          : 'Upload clear scan/photo of government-issued ID (PDF or Image)'}
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

                {/* Organization Details (Only if Organization chosen) */}
                {!isPersonal && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 space-y-6 shadow-sm"
                  >
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-bold text-slate-900">Organization &amp; Entity Information</h3>
                      <p className="text-xs text-slate-500">Corporate verification and registrar proofs</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField label="Organization Name" required>
                        <input
                          type="text"
                          className={lightInputClass}
                          value={organization.organizationName}
                          onChange={(e) => updateOrganization('organizationName', e.target.value)}
                          required
                        />
                      </FormField>

                      <FormField label="Organization Type" required>
                        <input
                          type="text"
                          className={lightInputClass}
                          placeholder="e.g. LLC, Non-profit, Educational Institute"
                          value={organization.organizationType}
                          onChange={(e) => updateOrganization('organizationType', e.target.value)}
                          required
                        />
                      </FormField>

                      <FormField label="Organization Official Email" required>
                        <input
                          type="email"
                          className={lightInputClass}
                          value={organization.organizationEmail}
                          onChange={(e) => updateOrganization('organizationEmail', e.target.value)}
                          required
                        />
                      </FormField>

                      <FormField label="Official Website">
                        <input
                          type="url"
                          className={lightInputClass}
                          placeholder="https://yourorganization.com"
                          value={organization.organizationWebsite}
                          onChange={(e) => updateOrganization('organizationWebsite', e.target.value)}
                        />
                      </FormField>

                      <FormField label="Registration / Tax ID" required>
                        <input
                          type="text"
                          className={lightInputClass}
                          value={organization.organizationRegistrationNumber}
                          onChange={(e) => updateOrganization('organizationRegistrationNumber', e.target.value)}
                          required
                        />
                      </FormField>

                      <FormField label="Applicant Role in Organization" required>
                        <input
                          type="text"
                          className={lightInputClass}
                          placeholder="e.g. Founder, CEO, Director"
                          value={organization.roleInOrganization}
                          onChange={(e) => updateOrganization('roleInOrganization', e.target.value)}
                          required
                        />
                      </FormField>

                      <FormField label="Organization Proof Number" required>
                        <input
                          type="text"
                          className={lightInputClass}
                          value={organization.organizationProofNumber}
                          onChange={(e) => updateOrganization('organizationProofNumber', e.target.value)}
                          required
                        />
                      </FormField>
                    </div>

                    <FormField label="Registered Business Address" required>
                      <input
                        type="text"
                        className={lightInputClass}
                        value={organization.organizationAddress}
                        onChange={(e) => updateOrganization('organizationAddress', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Organization Description" required>
                      <textarea
                        rows={3}
                        className={`${lightInputClass} resize-none`}
                        value={organization.organizationDescription}
                        onChange={(e) => updateOrganization('organizationDescription', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Organization Proof Document" required>
                      <label className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/40 transition-colors">
                        <Upload size={20} className="text-indigo-600" />
                        <span className="text-sm text-slate-600">
                          {organizationProofDocument
                            ? organizationProofDocument.name
                            : 'Upload Certificate of Incorporation or Business Registration proof'}
                        </span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => setOrganizationProofDocument(e.target.files?.[0] || null)}
                        />
                      </label>
                    </FormField>
                  </motion.div>
                )}

                {/* Submission Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <p className="text-xs text-slate-500 text-center sm:text-left">
                    By submitting, you agree to Arcade creator guidelines and verified token terms.
                  </p>
                  {status === 'authenticated' ? (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-10 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/20 transition-all duration-300 hover:opacity-95 hover:shadow-indigo-600/35 disabled:opacity-60 cursor-pointer active:scale-98"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Processing Application...
                        </>
                      ) : (
                        <>
                          Submit Channel Request
                          <ChevronRight size={18} />
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={signUrl}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 px-10 py-4 text-sm font-bold text-white shadow-xl shadow-purple-600/25 transition-all duration-300 hover:opacity-95 hover:scale-[1.02] cursor-pointer text-center"
                    >
                      {tokenInfo?.accountExists === false ? 'Create Account to Enable Creation' : 'Sign In to Enable Creation'}
                      <ChevronRight size={18} />
                    </Link>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. SITE FOOTER (Matching Homepage)                            */}
      {/* ------------------------------------------------------------- */}
      <Footer />

      {/* ------------------------------------------------------------- */}
      {/* 4. SLIDE-OUT MENU DRAWER                                      */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Link href="/" onClick={() => setMenuOpen(false)}>
                    <img
                      src="/arcade.svg"
                      alt="arcade."
                      className="h-8 w-auto object-contain"
                    />
                  </Link>
                  <button onClick={() => setMenuOpen(false)} className="text-slate-400 hover:text-white">
                    <X size={22} />
                  </button>
                </div>

                <nav className="flex flex-col gap-4 text-sm font-medium text-slate-300 pt-4">
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-cyan-400 transition-colors py-1"
                  >
                    Home
                  </Link>
                  <Link
                    href="/articles"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-cyan-400 transition-colors py-1"
                  >
                    Blog &amp; Articles
                  </Link>
                  <Link
                    href="/workshops"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-cyan-400 transition-colors py-1"
                  >
                    Projects &amp; Workshops
                  </Link>
                  <Link
                    href="/reach-us"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-cyan-400 transition-colors py-1"
                  >
                    Contact Us
                  </Link>
                </nav>
              </div>

              <div className="text-xs text-slate-500 border-t border-slate-900 pt-4">
                &copy; {new Date().getFullYear()} Arcade Inc. All rights reserved.
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChannelInviteCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-[#030712] text-white">
          <Loader2 className="animate-spin text-cyan-400" size={40} />
        </div>
      }
    >
      <ChannelInviteCreateContent />
    </Suspense>
  );
}
