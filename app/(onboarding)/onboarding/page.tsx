'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/design-system/ui/button';
import { Input } from '@/shared/design-system/ui/input';
import { Loader2, Camera, CheckCircle2, AlertCircle, X, Plus, ChevronDown, User, Phone, MapPin, Link as LinkIcon, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/design-system/ui/avatar';
import { api } from '@/infrastructure/http/api';
import { AuthPageShell } from '@/apps/public/layout/AuthPageShell';
import '@/domains/identity/components/auth-fields.css';
import { PebbleLoader } from '@/domains/identity/components/PebbleLoader';
import { getAvatarUrl } from '@/shared/utils/avatar';

const PREFERENCE_OPTIONS = [
  'Computer Science',
  'Designing',
  'Marketing',
  'Finance',
  'Healthcare',
  'Education',
  'Engineering',
  'Business',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Step 1: Profile & Username
  const [username, setUsername] = useState(() => {
    const initial = user?.username || '';
    return initial.toLowerCase().replace(/[^a-z0-9]/g, '');
  });
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Step 2: Personal Details
  const [firstName, setFirstName] = useState(user?.firstName || user?.fullName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.lastName || user?.fullName?.split(' ')[1] || '');
  const [mobileNumber, setMobileNumber] = useState('');
  const [gender, setGender] = useState(user?.gender || '');
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];
  const [address, setAddress] = useState(user?.address || '');
  const [socialLink1, setSocialLink1] = useState(user?.linkedinUrl || user?.socialLinks?.[0] || '');
  const [socialLink2, setSocialLink2] = useState(user?.githubUrl || user?.socialLinks?.[1] || '');
  const [preferences, setPreferences] = useState<string[]>(user?.preferences || []);
  
  const [customPreference, setCustomPreference] = useState('');

  useEffect(() => {
    if (user?.onboardingCompleted) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const checkUsername = async () => {
      if (username.length < 3) {
        setUsernameStatus('idle');
        return;
      }
      setUsernameStatus('checking');
      try {
        const res = await api.get<{available: boolean, suggestions?: string[]}>(`/api/v1/users/check-username?username=${username}`);
        if (res.available) {
          setUsernameStatus('available');
          setUsernameSuggestions([]);
        } else {
          setUsernameStatus('taken');
          setUsernameSuggestions(res.suggestions || []);
        }
      } catch (error) {
        console.error('Error checking username', error);
        setUsernameStatus('idle');
      }
    };
    
    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const togglePreference = (pref: string) => {
    setPreferences(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const addCustomPreference = () => {
    if (customPreference.trim() && !preferences.includes(customPreference.trim())) {
      setPreferences(prev => [...prev, customPreference.trim()]);
      setCustomPreference('');
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      let uploadedAvatarUrl = user?.avatarUrl;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const avatarRes = await api.post<{avatarUrl: string}>('/api/v1/users/me/avatar', formData);
        uploadedAvatarUrl = avatarRes.avatarUrl;
      }

      const payload = {
        firstName,
        lastName,
        avatarUrl: uploadedAvatarUrl,
        username,
        mobileNumber,
        gender,
        address,
        linkedinUrl: socialLink1.trim() || undefined,
        githubUrl: socialLink2.trim() || undefined,
        preferences,
        onboardingCompleted: true
      };

      const profileRes = await api.put<any>('/api/v1/users/me', payload);
      updateUser(profileRes);
      router.push('/');
    } catch (error) {
      console.error('Failed to complete onboarding', error);
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const isStep1Valid = username.length >= 3 && usernameStatus === 'available';
  const isStep2Valid = firstName.trim() !== '' && lastName.trim() !== '' && gender !== '' && mobileNumber.trim() !== '';
  const isLinkedinValid = socialLink1.trim() === '' || /^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(socialLink1);
  const isGithubValid = socialLink2.trim() === '' || /^https?:\/\/(www\.)?github\.com\/.*$/.test(socialLink2);
  const isStep3Valid = isLinkedinValid && isGithubValid;

  const stepTitle =
    step === 1
      ? 'Choose a username'
      : step === 2
        ? 'Personal details'
        : step === 3
          ? 'Connect socials'
          : 'Your interests';

  const stepSubtitle =
    step === 1
      ? 'Set up your public identity on Arcade.'
      : step === 2
        ? 'A few details so we can personalize your experience.'
        : step === 3
          ? 'Link your professional networks (optional).'
          : 'Pick the topics you care about most.';

  return (
    <AuthPageShell>
      <div className="relative w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={`heading-${step}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-7 text-center sm:text-left"
          >
            <h1 className="mb-2 text-[1.85rem] font-bold leading-tight tracking-tight text-[#14142b] md:text-[2.1rem]">
              {stepTitle}
              <span className="bg-gradient-to-r from-[#4C6FFF] via-[#1DB876] to-[#9B5DE5] bg-clip-text text-transparent">
                .
              </span>
            </h1>
            <p className="text-[14px] font-medium text-slate-500">{stepSubtitle}</p>
          </motion.div>
        </AnimatePresence>

        <div className="relative">
            <AnimatePresence mode="wait">
              
              {/* STEP 1 */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-3"
                >
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="relative group">
                      <Avatar className="h-[88px] w-[88px] border-4 border-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                        <AvatarImage src={getAvatarUrl(avatarUrl)} alt="Avatar" className="object-cover" referrerPolicy="no-referrer" />
                        <AvatarFallback className="bg-slate-50 text-slate-400 text-3xl font-bold">
                          {firstName ? firstName.charAt(0) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="text-white h-7 w-7" />
                      </label>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload} 
                      />
                    </div>
                    <p className="text-[13px] text-slate-400 font-semibold mt-3">Upload a profile picture</p>
                  </div>

                  <div className={`auth-field relative flex h-[60px] cursor-text flex-col justify-center rounded-[20px] px-5 py-2 transition-all ${usernameStatus === 'taken' ? 'auth-field--error' : ''}`}>
                    <label htmlFor="username" className="mb-0.5 cursor-text text-[11px] font-bold tracking-wide text-[#A5B3CA]">Username</label>
                    <input 
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      placeholder="e.g. anywhereuser"
                      autoComplete="username"
                      className="w-full border-none bg-transparent p-0 pr-10 text-[15px] font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-300"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' ? <Loader2 className="h-5 w-5 animate-spin text-slate-300" /> : 
                       usernameStatus === 'available' ? <CheckCircle2 className="h-5 w-5 text-[#1DB876]" /> : 
                       usernameStatus === 'taken' ? <AlertCircle className="h-5 w-5 text-red-500" /> : 
                       <User className="h-5 w-5 text-[#A5B3CA]" />}
                    </div>
                  </div>

                  {usernameStatus === 'taken' && (
                    <div className="px-1 pt-1">
                      <p className="text-[12.5px] font-medium text-red-500">
                        That username is taken.
                        {usernameSuggestions.length > 0 ? ' Try one of these:' : ''}
                      </p>
                      {usernameSuggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {usernameSuggestions.map(s => (
                            <button 
                              key={s} 
                              type="button"
                              onClick={() => setUsername(s)}
                              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="auth-field relative flex h-[60px] cursor-text flex-col justify-center rounded-[20px] px-5 py-2">
                      <label htmlFor="firstName" className="mb-0.5 cursor-text text-[11px] font-bold tracking-wide text-[#A5B3CA] capitalize">First name</label>
                      <input 
                        id="firstName" 
                        value={firstName} 
                        onChange={e => setFirstName(e.target.value)}
                        autoComplete="given-name"
                        className="w-full border-none bg-transparent p-0 pr-10 text-[15px] font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-300" 
                      />
                      <Briefcase className="absolute right-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#A5B3CA]" />
                    </div>
                    <div className="auth-field relative flex h-[60px] cursor-text flex-col justify-center rounded-[20px] px-5 py-2">
                      <label htmlFor="lastName" className="mb-0.5 cursor-text text-[11px] font-bold tracking-wide text-[#A5B3CA] capitalize">Last name</label>
                      <input 
                        id="lastName" 
                        value={lastName} 
                        onChange={e => setLastName(e.target.value)}
                        autoComplete="family-name"
                        className="w-full border-none bg-transparent p-0 pr-10 text-[15px] font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-300" 
                      />
                      <Briefcase className="absolute right-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#A5B3CA]" />
                    </div>
                  </div>

                  <div className="auth-field relative flex h-[60px] cursor-text flex-col justify-center rounded-[20px] px-5 py-2">
                    <label htmlFor="mobile" className="mb-0.5 cursor-text text-[11px] font-bold tracking-wide text-[#A5B3CA] capitalize">Mobile number</label>
                    <input 
                      id="mobile" 
                      type="tel" 
                      value={mobileNumber} 
                      onChange={e => setMobileNumber(e.target.value.replace(/[^\d\s+-]/g, ''))} 
                      placeholder="+1 234 567 8900"
                      autoComplete="tel"
                      className="w-full border-none bg-transparent p-0 pr-10 text-[15px] font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-300" 
                    />
                    <Phone className="absolute right-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#A5B3CA]" />
                  </div>

                  <div className="w-full">
                    <button
                      type="button"
                      className="auth-field relative flex h-[60px] w-full cursor-pointer flex-col justify-center rounded-[20px] px-5 py-2 text-left"
                      onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                      aria-expanded={isGenderDropdownOpen}
                    >
                      <span className="mb-0.5 text-[11px] font-bold tracking-wide text-[#A5B3CA] capitalize">Gender</span>
                      <span className={`text-[15px] font-bold ${gender ? 'text-slate-900' : 'font-medium text-slate-300'}`}>
                        {gender ? genderOptions.find(g => g.value === gender)?.label : 'Select gender'}
                      </span>
                      <ChevronDown className={`absolute right-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#A5B3CA] transition-transform duration-300 ${isGenderDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <motion.div
                      initial={false}
                      animate={{
                        height: isGenderDropdownOpen ? 'auto' : 0,
                        opacity: isGenderDropdownOpen ? 1 : 0,
                      }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 overflow-hidden rounded-[20px] border border-slate-200/80 bg-white">
                        {genderOptions.map((option, idx) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setGender(option.value);
                              setIsGenderDropdownOpen(false);
                            }}
                            className={`w-full px-5 py-3.5 text-left text-[14px] font-semibold transition-colors hover:bg-slate-50 ${
                              gender === option.value ? 'bg-slate-50 text-[#4C6FFF]' : 'text-slate-600'
                            } ${idx !== genderOptions.length - 1 ? 'border-b border-slate-100' : ''}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  <div className="auth-field relative flex h-[60px] cursor-text flex-col justify-center rounded-[20px] px-5 py-2">
                    <label htmlFor="address" className="mb-0.5 cursor-text text-[11px] font-bold tracking-wide text-[#A5B3CA] capitalize">Address</label>
                    <input 
                      id="address" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      placeholder="Full address"
                      autoComplete="street-address"
                      className="w-full border-none bg-transparent p-0 pr-10 text-[15px] font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-300" 
                    />
                    <MapPin className="absolute right-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#A5B3CA]" />
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <div className={`auth-field relative flex h-[60px] cursor-text flex-col justify-center rounded-[20px] px-5 py-2 ${socialLink1 && !isLinkedinValid ? 'auth-field--error' : ''}`}>
                      <label htmlFor="linkedin" className={`mb-0.5 cursor-text text-[11px] font-bold tracking-wide capitalize ${socialLink1 && !isLinkedinValid ? 'text-red-400' : 'text-[#A5B3CA]'}`}>LinkedIn URL</label>
                      <input 
                        id="linkedin"
                        value={socialLink1} 
                        onChange={e => setSocialLink1(e.target.value)} 
                        placeholder="Optional" 
                        className="w-full border-none bg-transparent p-0 pr-10 text-[15px] font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-300" 
                      />
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="absolute right-5 top-1/2 z-10 -translate-y-1/2 transition-transform hover:scale-110" title="Open LinkedIn to copy your link">
                        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-[20px] w-[20px] text-[#0077b5]" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    </div>
                    {socialLink1 && !isLinkedinValid && (
                      <p className="px-1 pt-1 text-[12.5px] font-medium text-red-500">Enter a valid LinkedIn URL.</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className={`auth-field relative flex h-[60px] cursor-text flex-col justify-center rounded-[20px] px-5 py-2 ${socialLink2 && !isGithubValid ? 'auth-field--error' : ''}`}>
                      <label htmlFor="github" className={`mb-0.5 cursor-text text-[11px] font-bold tracking-wide capitalize ${socialLink2 && !isGithubValid ? 'text-red-400' : 'text-[#A5B3CA]'}`}>GitHub URL</label>
                      <input 
                        id="github"
                        value={socialLink2} 
                        onChange={e => setSocialLink2(e.target.value)} 
                        placeholder="Optional" 
                        className="w-full border-none bg-transparent p-0 pr-10 text-[15px] font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-300" 
                      />
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="absolute right-5 top-1/2 z-10 -translate-y-1/2 transition-transform hover:scale-110" title="Open GitHub to copy your link">
                        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-[20px] w-[20px] text-slate-800" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                      </a>
                    </div>
                    {socialLink2 && !isGithubValid && (
                      <p className="px-1 pt-1 text-[12.5px] font-medium text-red-500">Enter a valid GitHub URL.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  <div className="flex flex-wrap gap-3">
                    {[...PREFERENCE_OPTIONS, ...preferences.filter(p => !PREFERENCE_OPTIONS.includes(p))].map(pref => {
                      const isSelected = preferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          onClick={() => togglePreference(pref)}
                          className={`px-5 py-3 rounded-[24px] text-[14px] font-bold transition-all border border-transparent ${
                            isSelected 
                              ? 'bg-[#12141C] text-white shadow-[0_2px_10px_rgba(18,20,28,0.12)]' 
                              : 'bg-white/70 text-slate-500 hover:bg-white hover:text-slate-800 border border-slate-200/80'
                          }`}
                        >
                          {pref}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <div className="flex gap-2">
                      <div className="auth-field relative flex h-[60px] flex-1 cursor-text flex-col justify-center rounded-[20px] px-5 py-2">
                        <label className="mb-0.5 cursor-text text-[11px] font-bold tracking-wide text-[#A5B3CA] capitalize">Add another field</label>
                        <input 
                          value={customPreference} 
                          onChange={e => setCustomPreference(e.target.value)}
                          placeholder="e.g. Artificial Intelligence"
                          onKeyDown={e => e.key === 'Enter' && addCustomPreference()}
                          className="w-full border-none bg-transparent p-0 text-[15px] font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-300"
                        />
                      </div>
                      <button onClick={addCustomPreference} type="button" className="auth-field flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[20px] text-slate-400 transition-all hover:text-[#14142b]">
                        <Plus className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center gap-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={prevStep} 
              disabled={step === 1 || isSubmitting}
              className={`h-[52px] px-8 rounded-[26px] font-bold text-[14px] text-[#A5B3CA] bg-[#F7F9FB] hover:bg-slate-100 hover:text-slate-700 transition-all w-1/2 flex-1 ${step === 1 ? 'invisible' : ''}`}
            >
              Go back
            </Button>
            
            {step < 4 ? (
              <Button 
                onClick={nextStep} 
                disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || (step === 3 && !isStep3Valid)}
                className={`h-[52px] px-8 rounded-full font-semibold text-[14px] bg-[#12141C] hover:bg-[#232735] text-white shadow-[0_2px_10px_rgba(18,20,28,0.14)] transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 w-1/2 flex-1 ${(step === 1 && usernameStatus === 'taken') ? 'opacity-0 pointer-events-none scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}
              >
                {step === 3 && (!socialLink1.trim() && !socialLink2.trim()) ? 'Skip' : 'Continue'}
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                disabled={isSubmitting}
                className="h-[52px] px-8 rounded-full font-semibold text-[14px] bg-[#12141C] hover:bg-[#232735] text-white shadow-[0_2px_10px_rgba(18,20,28,0.14)] transition-all hover:-translate-y-0.5 active:translate-y-0 w-1/2 flex-1"
              >
                {isSubmitting ? (
                  <PebbleLoader tone="light" size="sm" />
                ) : (
                  <>Finish setup</>
                )}
              </Button>
            )}
          </div>
      </div>
    </AuthPageShell>
  );
}
