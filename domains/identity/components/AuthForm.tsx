'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, User, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  loading: boolean;
  showSuccess: boolean;
  globalError?: string;
  onModeChange: (mode: 'login' | 'signup') => void;
  onSubmit: (data: any) => void;
  onGoogleLogin: () => void;
}

const InputField = ({ label, type, placeholder, value, onChange, icon: Icon, error, isPassword, showPwd, togglePwd }: any) => (
  <div className="flex flex-col mb-4 w-full">
    <div className={`relative w-full rounded-2xl bg-slate-50 border-2 transition-all ${error ? 'border-red-400 shadow-[0_0_0_3px_rgba(248,113,113,0.1)]' : 'border-slate-100 focus-within:border-[#0080ff] focus-within:shadow-[0_0_0_3px_rgba(0,128,255,0.15)] focus-within:bg-white'} px-4 pt-6 pb-2`}>
      <label className="absolute top-2.5 left-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-[15px] font-semibold text-slate-900 placeholder-transparent pr-8"
      />
      {Icon && !isPassword && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={18} strokeWidth={2} />
        </div>
      )}
      {isPassword && (
        <button
          type="button"
          onClick={togglePwd}
          tabIndex={-1}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {showPwd ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
        </button>
      )}
    </div>
    {error && <span className="text-xs text-red-500 mt-1.5 ml-2 font-medium">{error}</span>}
  </div>
);

export default function AuthForm({ 
  mode, 
  loading, 
  showSuccess, 
  globalError, 
  onModeChange, 
  onSubmit, 
  onGoogleLogin 
}: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (mode === 'signup') {
      if (!/^[a-zA-Z\s]{2,50}$/.test(firstName)) {
        newErrors.firstName = "First Name must be 2-50 characters (letters only).";
      }
      if (!/^[a-zA-Z\s]{1,50}$/.test(lastName)) {
        newErrors.lastName = "Last Name must be 1-50 characters (letters only).";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Please enter a valid email address.";
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(password)) {
        newErrors.password = "Password must be 8+ chars with 1 uppercase, 1 lowercase, 1 number, 1 special char.";
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    } else {
      if (!email) {
        newErrors.email = "Email or Username is required.";
      }
      if (!password) {
        newErrors.password = "Password is required.";
      }
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({ email, password, firstName, lastName });
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <CheckCircle2 className="w-20 h-20 text-[#0080ff] mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Account created.</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          Your account has been successfully registered. Please log in to continue.
        </p>
        <div className="flex items-center gap-3 text-[#0080ff] font-semibold">
          <div className="w-5 h-5 border-2 border-[#0080ff] border-t-transparent rounded-full animate-spin" />
          Redirecting to login...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          {mode === 'signup' ? 'Start for free' : 'Welcome back'}
        </p>
        <h1 className="text-4xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-slate-900 tracking-tight leading-tight mb-4 whitespace-nowrap">
          {mode === 'signup' ? 'Create new account' : 'Log in to account'}
          <span className="text-[#0080ff]">.</span>
        </h1>
        
        <p className="text-slate-500 font-medium">
          {mode === 'signup' ? 'Already A Member? ' : 'Don\'t have an account? '}
          <button 
            type="button"
            onClick={() => onModeChange(mode === 'signup' ? 'login' : 'signup')}
            className="text-[#0080ff] hover:text-[#0066cc] font-bold transition-colors"
          >
            {mode === 'signup' ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        {globalError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-semibold">
            <ShieldAlert size={18} />
            {globalError}
          </div>
        )}

        {mode === 'signup' && (
          <div className="flex flex-col sm:flex-row sm:gap-4 w-full">
            <InputField 
              label="First name"
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e: any) => setFirstName(e.target.value)}
              icon={User}
              error={errors.firstName}
            />
            <InputField 
              label="Last name"
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e: any) => setLastName(e.target.value)}
              icon={User}
              error={errors.lastName}
            />
          </div>
        )}

        <InputField 
          label={mode === 'login' ? 'Email or Username' : 'Email'}
          type={mode === 'login' ? 'text' : 'email'}
          placeholder="Email address"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          icon={Mail}
          error={errors.email}
        />

        <InputField 
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          isPassword={true}
          showPwd={showPassword}
          togglePwd={() => setShowPassword(!showPassword)}
          error={errors.password}
        />

        {mode === 'signup' && (
          <InputField 
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e: any) => setConfirmPassword(e.target.value)}
            isPassword={true}
            showPwd={showConfirmPassword}
            togglePwd={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
          />
        )}

        {mode === 'login' && (
          <div className="flex justify-end mb-6 pr-2">
            <a href="/forgot-password" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
              Forgot password?
            </a>
          </div>
        )}

        <div className="flex flex-col gap-4 mt-6 w-full">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 px-8 rounded-full bg-[#0080ff] hover:bg-[#0066cc] text-white font-bold transition-all text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              mode === 'login' ? 'Log in' : 'Create account'
            )}
          </button>

          <div className="flex items-center gap-3 my-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex-1 border-b border-slate-200"></div>
            Or
            <div className="flex-1 border-b border-slate-200"></div>
          </div>
          
          <button 
            type="button" 
            onClick={onGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-8 rounded-full bg-white border-2 border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-200 font-bold transition-all text-sm active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </form>
    </div>
  );
}
