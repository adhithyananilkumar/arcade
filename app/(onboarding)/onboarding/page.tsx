'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Camera, CheckCircle2, AlertCircle, X, Plus, ChevronDown, User, Phone, MapPin, Link as LinkIcon, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiClient } from '@/lib/apiClient';
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

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
  const [socialLink1, setSocialLink1] = useState(user?.socialLinks?.[0] || '');
  const [socialLink2, setSocialLink2] = useState(user?.socialLinks?.[1] || '');
  const [preferences, setPreferences] = useState<string[]>(user?.preferences || []);
  
  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    if (url.startsWith('/api/v1/')) {
      return baseUrl.replace('/api/v1', '') + url;
    }
    if (!url.includes('/')) {
      return baseUrl + '/users/avatars/' + url;
    }
    return baseUrl + (url.startsWith('/') ? '' : '/') + url;
  };
  const [customPreference, setCustomPreference] = useState('');

  useEffect(() => {
    if (user?.onboardingCompleted) {
      router.push('/dashboard');
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
        const res = await apiClient.get(`/users/check-username?username=${username}`);
        if (res.data.available) {
          setUsernameStatus('available');
          setUsernameSuggestions([]);
        } else {
          setUsernameStatus('taken');
          setUsernameSuggestions(res.data.suggestions || []);
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
        const avatarRes = await apiClient.post('/users/me/avatar', formData, {
          headers: { 'Content-Type': undefined }
        });
        uploadedAvatarUrl = avatarRes.data.avatarUrl;
      }

      const socialLinks = [socialLink1, socialLink2].filter(link => link.trim() !== '');
      
      const payload = {
        firstName,
        lastName,
        avatarUrl: uploadedAvatarUrl,
        username,
        mobileNumber,
        gender,
        address,
        socialLinks,
        preferences,
        onboardingCompleted: true
      };

      const profileRes = await apiClient.put('/users/me', payload);
      updateUser(profileRes.data);
      router.push('/dashboard');
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

  return (
    <div className={`flex min-h-screen bg-white w-full overflow-hidden ${poppins.className}`}>
      
      {/* Left Column - Form Content */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 md:p-8 lg:p-12 relative z-20 bg-white h-screen overflow-hidden xl:pr-10">
        
        <div className="w-full max-w-[440px] relative z-10 w-full">
          
          <div className="relative">
            <div className="mb-6 text-center sm:text-left">
              <h1 className="text-3xl md:text-[34px] font-extrabold text-slate-900 tracking-[-0.03em] mb-2 leading-tight">
                {step === 1 && <>Choose username<span className="text-[#407BFF]">.</span></>}
                {step === 2 && <>Personal details<span className="text-[#407BFF]">.</span></>}
                {step === 3 && <>Connect socials<span className="text-[#407BFF]">.</span></>}
                {step === 4 && <>Your interests<span className="text-[#407BFF]">.</span></>}
              </h1>
              <p className="text-[#A5B3CA] font-medium text-[14px]">
                {step === 1 && "Start by setting up your public identity."}
                {step === 2 && "Tell us a little bit more about yourself."}
                {step === 3 && "Link your professional networks (optional)."}
                {step === 4 && "What topics are you most passionate about?"}
              </p>
            </div>
            <AnimatePresence mode="wait">
              
              {/* STEP 1 */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
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

                  <div className="relative flex flex-col justify-center bg-[#F7F9FB] rounded-[20px] px-5 py-2 h-[60px] border border-transparent focus-within:border-[#407BFF] transition-all cursor-text hover:bg-slate-100/50">
                    <label htmlFor="username" className="text-[11px] font-bold text-[#A5B3CA] mb-0.5 cursor-text tracking-wide">Username</label>
                    <input 
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      placeholder="e.g. anywhereuser"
                      className="bg-transparent border-none outline-none font-bold text-slate-900 w-full pr-10 p-0 text-[15px] placeholder:text-slate-300 placeholder:font-medium"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' ? <Loader2 className="h-5 w-5 animate-spin text-slate-300" /> : 
                       usernameStatus === 'available' ? <CheckCircle2 className="h-5 w-5 text-[#407BFF]" /> : 
                       usernameStatus === 'taken' ? <AlertCircle className="h-5 w-5 text-red-500" /> : 
                       <User className="h-5 w-5 text-[#A5B3CA]" />}
                    </div>
                  </div>
                  
                  {usernameStatus === 'taken' && usernameSuggestions.length > 0 && (
                    <div className="text-[13px] p-4 bg-red-50 rounded-[20px] mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-500 font-bold">Username is taken.</span>
                        <span className="text-slate-500 font-medium">Try one of these:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {usernameSuggestions.map(s => (
                          <button 
                            key={s} 
                            onClick={() => setUsername(s)}
                            className="px-4 py-2 bg-white text-slate-700 rounded-xl text-xs font-bold shadow-sm"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative flex flex-col justify-center bg-[#F7F9FB] rounded-[20px] px-5 py-2 h-[60px] border border-transparent focus-within:border-[#407BFF] transition-all cursor-text hover:bg-slate-100/50">
                      <label htmlFor="firstName" className="text-[11px] font-bold text-[#A5B3CA] mb-0.5 cursor-text tracking-wide capitalize">First name</label>
                      <input 
                        id="firstName" 
                        value={firstName} 
                        onChange={e => setFirstName(e.target.value)} 
                        className="bg-transparent border-none outline-none font-bold text-slate-900 w-full pr-10 p-0 text-[15px] placeholder:text-slate-300 placeholder:font-medium" 
                      />
                      <Briefcase className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A5B3CA] w-[18px] h-[18px]" />
                    </div>
                    <div className="relative flex flex-col justify-center bg-[#F7F9FB] rounded-[20px] px-5 py-2 h-[60px] border border-transparent focus-within:border-[#407BFF] transition-all cursor-text hover:bg-slate-100/50">
                      <label htmlFor="lastName" className="text-[11px] font-bold text-[#A5B3CA] mb-0.5 cursor-text tracking-wide capitalize">Last name</label>
                      <input 
                        id="lastName" 
                        value={lastName} 
                        onChange={e => setLastName(e.target.value)} 
                        className="bg-transparent border-none outline-none font-bold text-slate-900 w-full pr-10 p-0 text-[15px] placeholder:text-slate-300 placeholder:font-medium" 
                      />
                      <Briefcase className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A5B3CA] w-[18px] h-[18px]" />
                    </div>
                  </div>

                  <div className="relative flex flex-col justify-center bg-[#F7F9FB] rounded-[20px] px-5 py-2 h-[60px] border border-transparent focus-within:border-[#407BFF] transition-all cursor-text hover:bg-slate-100/50">
                    <label htmlFor="mobile" className="text-[11px] font-bold text-[#A5B3CA] mb-0.5 cursor-text tracking-wide capitalize">Mobile number</label>
                    <input 
                      id="mobile" 
                      type="tel" 
                      value={mobileNumber} 
                      onChange={e => setMobileNumber(e.target.value)} 
                      placeholder="+1 234 567 8900" 
                      className="bg-transparent border-none outline-none font-bold text-slate-900 w-full pr-10 p-0 text-[15px] placeholder:text-slate-300 placeholder:font-medium" 
                    />
                    <Phone className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A5B3CA] w-[18px] h-[18px]" />
                  </div>

                  <div className="relative">
                    <div className="relative flex flex-col justify-center bg-[#F7F9FB] rounded-[20px] px-5 py-2 h-[60px] border border-transparent focus-within:border-[#407BFF] transition-all cursor-pointer hover:bg-slate-100/50" onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}>
                      <label className="text-[11px] font-bold text-[#A5B3CA] mb-0.5 cursor-pointer tracking-wide capitalize">Gender</label>
                      <div className="flex w-full items-center justify-between outline-none">
                        <span className={`font-bold text-[15px] ${gender ? 'text-slate-900' : 'text-slate-300 font-medium'}`}>
                          {gender ? genderOptions.find(g => g.value === gender)?.label : 'Select gender'}
                        </span>
                      </div>
                      <ChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#A5B3CA] transition-transform duration-200 ${isGenderDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    
                    <AnimatePresence>
                      {isGenderDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-[calc(100%+8px)] left-0 w-full bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-[20px] overflow-hidden z-50 py-2 border border-slate-100"
                        >
                          {genderOptions.map(option => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setGender(option.value);
                                setIsGenderDropdownOpen(false);
                              }}
                              className={`w-full text-left px-5 py-3 text-[14px] font-semibold transition-colors hover:bg-[#F7F9FB] ${gender === option.value ? 'text-[#407BFF]' : 'text-slate-600'}`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative flex flex-col justify-center bg-[#F7F9FB] rounded-[20px] px-5 py-2 h-[60px] border border-transparent focus-within:border-[#407BFF] transition-all cursor-text hover:bg-slate-100/50">
                    <label htmlFor="address" className="text-[11px] font-bold text-[#A5B3CA] mb-0.5 cursor-text tracking-wide capitalize">Address</label>
                    <input 
                      id="address" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      placeholder="Full address" 
                      className="bg-transparent border-none outline-none font-bold text-slate-900 w-full pr-10 p-0 text-[15px] placeholder:text-slate-300 placeholder:font-medium" 
                    />
                    <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A5B3CA] w-[18px] h-[18px]" />
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className={`relative flex flex-col justify-center bg-[#F7F9FB] rounded-[20px] px-5 py-2 h-[60px] border transition-all cursor-text hover:bg-slate-100/50 ${socialLink1 && !isLinkedinValid ? 'border-red-400 focus-within:border-red-500' : 'border-transparent focus-within:border-[#407BFF]'}`}>
                    <label htmlFor="linkedin" className={`text-[11px] font-bold mb-0.5 cursor-text tracking-wide capitalize ${socialLink1 && !isLinkedinValid ? 'text-red-400' : 'text-[#A5B3CA]'}`}>LinkedIn URL</label>
                    <input 
                      id="linkedin"
                      value={socialLink1} 
                      onChange={e => setSocialLink1(e.target.value)} 
                      placeholder="Optional" 
                      className={`bg-transparent border-none outline-none font-bold w-full pr-10 p-0 text-[15px] placeholder:font-medium ${socialLink1 && !isLinkedinValid ? 'text-red-500 placeholder:text-red-300' : 'text-slate-900 placeholder:text-slate-300'}`} 
                    />
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="absolute right-5 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform z-10" title="Open LinkedIn to copy your link">
                      <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-[#0077b5] w-[20px] h-[20px]" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                  <div className={`relative flex flex-col justify-center bg-[#F7F9FB] rounded-[20px] px-5 py-2 h-[60px] border transition-all cursor-text hover:bg-slate-100/50 ${socialLink2 && !isGithubValid ? 'border-red-400 focus-within:border-red-500' : 'border-transparent focus-within:border-[#407BFF]'}`}>
                    <label htmlFor="github" className={`text-[11px] font-bold mb-0.5 cursor-text tracking-wide capitalize ${socialLink2 && !isGithubValid ? 'text-red-400' : 'text-[#A5B3CA]'}`}>GitHub URL</label>
                    <input 
                      id="github"
                      value={socialLink2} 
                      onChange={e => setSocialLink2(e.target.value)} 
                      placeholder="Optional" 
                      className={`bg-transparent border-none outline-none font-bold w-full pr-10 p-0 text-[15px] placeholder:font-medium ${socialLink2 && !isGithubValid ? 'text-red-500 placeholder:text-red-300' : 'text-slate-900 placeholder:text-slate-300'}`} 
                    />
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="absolute right-5 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform z-10" title="Open GitHub to copy your link">
                      <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-slate-800 w-[20px] h-[20px]" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                    </a>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
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
                              ? 'bg-[#407BFF] text-white shadow-[0_8px_16px_rgba(64,123,255,0.25)]' 
                              : 'bg-[#F7F9FB] text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          {pref}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <div className="flex gap-2">
                      <div className="relative flex flex-col justify-center bg-[#F7F9FB] rounded-[20px] px-5 py-2 h-[60px] border border-transparent focus-within:border-[#407BFF] transition-all cursor-text flex-1">
                        <label className="text-[11px] font-bold text-[#A5B3CA] mb-0.5 cursor-text tracking-wide capitalize">Add another field</label>
                        <input 
                          value={customPreference} 
                          onChange={e => setCustomPreference(e.target.value)}
                          placeholder="e.g. Artificial Intelligence"
                          onKeyDown={e => e.key === 'Enter' && addCustomPreference()}
                          className="bg-transparent border-none outline-none font-bold text-slate-900 w-full p-0 text-[15px] placeholder:text-slate-300 placeholder:font-medium"
                        />
                      </div>
                      <button onClick={addCustomPreference} type="button" className="h-[60px] w-[60px] flex items-center justify-center rounded-[20px] bg-[#F7F9FB] text-slate-400 hover:bg-slate-100 hover:text-[#407BFF] transition-all shrink-0">
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
                className={`h-[52px] px-8 rounded-[26px] font-bold text-[14px] bg-[#407BFF] hover:bg-blue-600 text-white shadow-[0_8px_20px_rgba(64,123,255,0.3)] transition-all duration-500 ease-out hover:-translate-y-0.5 active:translate-y-0 w-1/2 flex-1 ${(step === 1 && usernameStatus === 'taken') ? 'opacity-0 pointer-events-none scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}
              >
                {step === 3 && (!socialLink1.trim() && !socialLink2.trim()) ? 'Skip' : 'Continue'}
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                disabled={isSubmitting}
                className="h-[52px] px-8 rounded-[26px] font-bold text-[14px] bg-[#407BFF] hover:bg-blue-600 text-white shadow-[0_8px_20px_rgba(64,123,255,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0 w-1/2 flex-1"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <>Create account</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Background Animation */}
      <div className="hidden lg:block lg:w-[55%] relative h-screen bg-[#F7F9FB]">
        <div className="absolute inset-0 z-0">
          <img 
            src="/mountain_lake.png" 
            alt="Mountain Landscape" 
            className="w-full h-full object-cover" 
          />
        </div>
        
        {/* Wavy SVG overlay matched to screenshot's sweeping double curve */}
        <div className="absolute top-0 -left-1 h-full w-[35%] text-white z-10 pointer-events-none">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" style={{ filter: 'drop-shadow(15px 0px 15px rgba(0,0,0,0.04))' }}>
            {/* The solid white wave */}
            <path 
              d="M0,0 L70,0 C70,18 10,20 10,40 C10,60 60,55 60,75 C60,90 0,90 0,100 L0,100 Z" 
              fill="white" 
            />
            {/* The dotted offset line */}
            <path 
              d="M70,0 C70,18 10,20 10,40 C10,60 60,55 60,75 C60,90 0,90 0,100" 
              fill="none" 
              stroke="#A5B3CA" 
              strokeWidth="0.3" 
              strokeDasharray="1,1" 
              transform="translate(-2, 0)"
            />
          </svg>
        </div>

        {/* .AW Logo Bottom Right */}
        <div className="absolute bottom-10 right-10 z-20 flex items-center gap-1 opacity-90">
          <div className="w-[6px] h-[6px] rounded-full bg-white mt-4"></div>
          <div className="flex gap-[1px]">
            <div className="w-[4px] h-[24px] bg-white transform -skew-x-[20deg] rounded-sm"></div>
            <div className="w-[4px] h-[24px] bg-white transform -skew-x-[20deg] rounded-sm"></div>
            <div className="w-[4px] h-[24px] bg-white transform -skew-x-[20deg] rounded-sm ml-[2px]"></div>
            <div className="w-[4px] h-[24px] bg-white transform -skew-x-[20deg] rounded-sm"></div>
          </div>
        </div>

      </div>

    </div>
  );
}
