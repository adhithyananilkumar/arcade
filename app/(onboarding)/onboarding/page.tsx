'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Camera, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, X, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiClient } from '@/lib/apiClient';

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
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Step 2: Personal Details
  const [firstName, setFirstName] = useState(user?.firstName || user?.fullName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.lastName || user?.fullName?.split(' ')[1] || '');
  const [mobileNumber, setMobileNumber] = useState('');
  const [gender, setGender] = useState(user?.gender || '');
  const [address, setAddress] = useState(user?.address || '');
  const [socialLink1, setSocialLink1] = useState(user?.socialLinks?.[0] || '');
  const [socialLink2, setSocialLink2] = useState(user?.socialLinks?.[1] || '');
  const [preferences, setPreferences] = useState<string[]>(user?.preferences || []);
  
  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
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
      // 1. Upload Avatar if selected
      let uploadedAvatarUrl = user?.avatarUrl;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const avatarRes = await apiClient.post('/users/me/avatar', formData, {
          headers: { 'Content-Type': undefined }
        });
        uploadedAvatarUrl = avatarRes.data.avatarUrl;
      }

      // 2. Submit Profile Data
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

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const isStep1Valid = username.length >= 3 && usernameStatus === 'available';
  const isStep2Valid = firstName.trim() !== '' && gender !== '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 flex">
          <motion.div 
            className="h-full bg-blue-600" 
            initial={{ width: '33%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              {step === 1 && "Let's set up your profile"}
              {step === 2 && "Tell us a bit about yourself"}
              {step === 3 && "What are your interests?"}
            </h1>
            <p className="text-slate-500">
              {step === 1 && "Choose a username and upload a picture so others can recognize you."}
              {step === 2 && "These details help us personalize your experience on Arcade."}
              {step === 3 && "Select the fields you are most interested in."}
            </p>
          </div>

          <div className="min-h-[360px] relative">
            <AnimatePresence mode="wait">
              
              {/* STEP 1 */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative group">
                      <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                        <AvatarImage src={getAvatarUrl(avatarUrl)} alt="Avatar" className="object-cover" referrerPolicy="no-referrer" />
                        <AvatarFallback className="bg-blue-50 text-blue-700 text-3xl font-bold">
                          {firstName ? firstName.charAt(0) : 'U'}
                          {lastName ? lastName.charAt(0) : ''}
                        </AvatarFallback>
                      </Avatar>
                      <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="text-white h-8 w-8" />
                      </label>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload} 
                      />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Upload a profile picture (Optional)</p>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Choose a unique username</label>
                    <div className="relative">
                      <Input 
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                        placeholder="e.g. anandhu"
                        className={`pr-10 ${usernameStatus === 'available' ? 'border-green-500 focus-visible:ring-green-500' : usernameStatus === 'taken' ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                        {usernameStatus === 'available' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {usernameStatus === 'taken' && <AlertCircle className="h-5 w-5 text-red-500" />}
                      </div>
                    </div>
                    
                    {usernameStatus === 'taken' && usernameSuggestions.length > 0 && (
                      <div className="text-sm">
                        <span className="text-red-500 font-medium">Username taken.</span>
                        <span className="text-slate-500 ml-2">Try:</span>
                        <div className="flex gap-2 mt-2">
                          {usernameSuggestions.map(s => (
                            <button 
                              key={s} 
                              onClick={() => setUsername(s)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-medium transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label htmlFor="step2-username" className="text-sm font-medium leading-none">Username</label>
                    <Input id="step2-username" value={username} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium leading-none">First Name</label>
                      <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium leading-none">Last Name</label>
                      <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="mobile" className="text-sm font-medium leading-none">Mobile Number (Optional)</label>
                    <Input id="mobile" type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="+1 234 567 8900" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Gender</label>
                    <select 
                      value={gender} 
                      onChange={e => setGender(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select your gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium leading-none">Address</label>
                    <Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Full Address" />
                  </div>

                  <div className="space-y-4 pt-2">
                    <label className="text-sm font-medium leading-none">Social Links (Optional)</label>
                    <Input value={socialLink1} onChange={e => setSocialLink1(e.target.value)} placeholder="LinkedIn URL" />
                    <Input value={socialLink2} onChange={e => setSocialLink2(e.target.value)} placeholder="GitHub URL" />
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="flex flex-wrap gap-3">
                    {PREFERENCE_OPTIONS.map(pref => {
                      const isSelected = preferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          onClick={() => togglePreference(pref)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            isSelected 
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600'
                          }`}
                        >
                          {pref}
                        </button>
                      );
                    })}
                    {preferences.filter(p => !PREFERENCE_OPTIONS.includes(p)).map(pref => (
                       <button
                       key={pref}
                       onClick={() => togglePreference(pref)}
                       className="px-4 py-2 rounded-xl text-sm font-medium transition-all bg-blue-600 text-white shadow-md shadow-blue-500/20 flex items-center gap-2"
                     >
                       {pref}
                       <X className="h-3 w-3 opacity-70" />
                     </button>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <label className="text-sm font-medium leading-none">Add another field</label>
                    <div className="flex gap-2">
                      <Input 
                        value={customPreference} 
                        onChange={e => setCustomPreference(e.target.value)}
                        placeholder="e.g. Artificial Intelligence"
                        onKeyDown={e => e.key === 'Enter' && addCustomPreference()}
                      />
                      <Button variant="outline" onClick={addCustomPreference} type="button">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-100">
            <Button 
              variant="ghost" 
              onClick={prevStep} 
              disabled={step === 1 || isSubmitting}
              className={step === 1 ? 'invisible' : ''}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            {step < 3 ? (
              <Button 
                onClick={nextStep} 
                disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <>Complete Profile <CheckCircle2 className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
