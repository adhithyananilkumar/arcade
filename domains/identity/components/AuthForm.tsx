'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, Mail, User, CheckCircle2, ArrowLeft, XCircle } from 'lucide-react';
import { PebbleLoader } from './PebbleLoader';
import { AuthPeriodGear } from './AuthPeriodGear';
import './auth-fields.css';

export type AuthView = 'login' | 'signup' | 'forgot' | 'reset' | 'verify';

export interface AuthFormProps {
  mode: AuthView;
  loading: boolean;
  showSuccess: boolean;
  successKind?: 'signup' | 'forgot' | 'reset' | 'verify';
  globalError?: string;
  verifyStatus?: 'loading' | 'success' | 'error';
  onModeChange: (mode: AuthView) => void;
  onSubmit: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword?: string;
    otp?: string;
  }) => void;
  onGoogleLogin: () => void;
  hasToken?: boolean;
  onResendOtp?: (email: string) => Promise<void>;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          key={message}
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -2, height: 0 }}
          transition={{ duration: 0.22, ease: easeOut }}
          className="overflow-hidden px-1 pt-1.5 text-[12.5px] font-medium leading-snug text-red-500"
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

function InputField({
  label,
  type,
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  isPassword,
  showPwd,
  togglePwd,
  autoComplete,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  error?: string;
  isPassword?: boolean;
  showPwd?: boolean;
  togglePwd?: () => void;
  autoComplete?: string;
}) {
  return (
    <div className="flex w-full flex-col">
      <div
        className={`auth-field relative w-full rounded-2xl px-4 pb-2.5 pt-6 transition-[box-shadow] duration-200 ${
          error ? 'auth-field--error' : ''
        }`}
      >
        <label className="pointer-events-none absolute left-4 top-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent pr-9 text-[15px] font-semibold text-slate-900 outline-none placeholder:text-transparent"
        />
        {Icon && !isPassword && (
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={togglePwd}
            tabIndex={-1}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
          >
            {showPwd ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        )}
      </div>
      <FieldError message={error} />
    </div>
  );
}

function AuthHeading({ title }: { title: string }) {
  const reduce = useReducedMotion();

  return (
    <div className="relative mb-3 min-h-[2.7rem] sm:min-h-[3rem]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.h1
          key={title}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.34, ease: easeOut }}
          className="absolute inset-x-0 top-0 text-[1.9rem] font-bold leading-[1.2] tracking-tight text-[#14142b] sm:text-[2.25rem]"
        >
          {title}
          <AuthPeriodGear />
        </motion.h1>
      </AnimatePresence>
      {/* Invisible spacer so layout height stays stable while titles are absolute */}
      <h1
        className="invisible text-[1.9rem] font-bold leading-[1.2] tracking-tight sm:text-[2.25rem]"
        aria-hidden
      >
        {title}
        <span className="inline-block w-[0.72em]" />
      </h1>
    </div>
  );
}

function PrimaryButton({
  loading,
  children,
  disabled,
  reduce,
}: {
  loading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  reduce: boolean | null;
}) {
  return (
    <motion.button
      type="submit"
      disabled={loading || disabled}
      whileHover={reduce || loading ? undefined : { y: -1 }}
      whileTap={reduce || loading ? undefined : { scale: 0.985 }}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#12141C] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(18,20,28,0.14)] transition-colors hover:bg-[#232735] disabled:cursor-not-allowed disabled:opacity-80"
    >
      {loading ? <PebbleLoader tone="light" size="sm" /> : children}
    </motion.button>
  );
}

export default function AuthForm({
  mode,
  loading,
  showSuccess,
  successKind = 'signup',
  globalError,
  verifyStatus,
  onModeChange,
  onSubmit,
  onGoogleLogin,
  hasToken,
  onResendOtp,
}: AuthFormProps) {
  const reduce = useReducedMotion();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dismissedGlobal, setDismissedGlobal] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (globalError) setDismissedGlobal(false);
  }, [globalError]);

  const handleModeChange = (next: AuthView) => {
    setErrors({});
    setDismissedGlobal(true);
    onModeChange(next);
  };

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (mode === 'signup') {
      if (!/^[a-zA-Z\s]{2,50}$/.test(firstName)) {
        next.firstName = 'First name must be 2–50 letters.';
      }
      if (!/^[a-zA-Z\s]{1,50}$/.test(lastName)) {
        next.lastName = 'Last name must be 1–50 letters.';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        next.email = 'Enter a valid email address.';
      }
      if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(
          password,
        )
      ) {
        next.password =
          'Use 8+ characters with upper, lower, number, and a special character.';
      }
      if (password !== confirmPassword) {
        next.confirmPassword = 'Passwords do not match.';
      }
    } else if (mode === 'login') {
      if (!email) next.email = 'Email or username is required.';
      if (!password) next.password = 'Password is required.';
    } else if (mode === 'forgot') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        next.email = 'Enter a valid email address.';
      }
    } else if (mode === 'reset') {
      if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(
          password,
        )
      ) {
        next.password =
          'Use 8+ characters with upper, lower, number, and a special character.';
      }
      if (password !== confirmPassword) {
        next.confirmPassword = 'Passwords do not match.';
      }
    } else if (mode === 'verify') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        next.email = 'Enter a valid email address.';
      }
      if (!/^\d{6}$/.test(otp)) {
        next.otp = 'Verification code must be exactly 6 digits.';
      }
    }
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({ email, password, firstName, lastName, confirmPassword, otp });
  };

  const activeGlobal = globalError && !dismissedGlobal ? globalError : undefined;
  const passwordError =
    errors.password ||
    (mode === 'login' && activeGlobal ? activeGlobal : undefined) ||
    (mode === 'reset' && activeGlobal ? activeGlobal : undefined);
  const emailError =
    errors.email ||
    ((mode === 'signup' || mode === 'forgot') && activeGlobal ? activeGlobal : undefined);

  const heading =
    mode === 'signup'
      ? 'Create your account'
      : mode === 'forgot'
        ? 'Reset your password'
        : mode === 'reset'
          ? 'Choose a new password'
          : mode === 'verify'
            ? 'Verify your email'
            : 'Sign in to Arcade';

  const subtitle =
    mode === 'signup' ? (
      <>
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => handleModeChange('login')}
          className="font-semibold text-[#4C6FFF] transition-colors hover:text-[#3a5ae6]"
        >
          Sign in
        </button>
      </>
    ) : mode === 'login' ? (
      <>
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={() => handleModeChange('signup')}
          className="font-semibold text-[#4C6FFF] transition-colors hover:text-[#3a5ae6]"
        >
          Create one
        </button>
      </>
    ) : mode === 'forgot' ? (
      <>We&apos;ll email you a link to set a new password.</>
    ) : mode === 'reset' ? (
      <>Enter a strong password for your Arcade account.</>
    ) : (
      <>Confirming your email address…</>
    );

  if (showSuccess) {
    const copy =
      successKind === 'forgot'
        ? {
            title: 'Check your email',
            body: `If an account exists for ${email || 'that address'}, we sent a reset link.`,
          }
        : successKind === 'reset'
          ? {
              title: 'Password updated',
              body: 'You can sign in with your new password.',
            }
          : successKind === 'verify'
            ? {
                title: 'Email verified',
                body: 'Your email is confirmed. You can sign in now.',
              }
            : {
                title: 'Account created',
                body: 'Please verify your email address to continue.',
              };

    return (
      <motion.div
        className="flex flex-col items-center py-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: easeOut }}
      >
        <CheckCircle2 className="mb-5 h-14 w-14 text-[#1DB876]" strokeWidth={1.75} />
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-[#14142b]">
          {copy.title}
          <AuthPeriodGear />
        </h2>
        <p className="mb-8 max-w-sm text-[15px] font-medium text-slate-500">{copy.body}</p>
        {successKind === 'signup' || successKind === 'verify' || successKind === 'reset' ? (
          successKind === 'signup' ? (
            <PebbleLoader label="Redirecting" />
          ) : (
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className="rounded-full bg-[#12141C] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#232735]"
            >
              Sign in
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={() => handleModeChange('login')}
            className="text-sm font-semibold text-[#4C6FFF] hover:text-[#3a5ae6]"
          >
            Back to sign in
          </button>
        )}
      </motion.div>
    );
  }

  if (mode === 'verify' && hasToken) {
    return (
      <motion.div
        className="w-full text-center sm:text-left"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeOut }}
      >
        <AuthHeading title="Verify your email" />
        <div className="mt-10 flex flex-col items-center sm:items-start">
          {verifyStatus === 'loading' && <PebbleLoader label="Confirming your email" />}
          {verifyStatus === 'success' && (
            <>
              <CheckCircle2 className="mb-4 h-14 w-14 text-[#1DB876]" strokeWidth={1.75} />
              <p className="mb-6 text-[15px] font-medium text-slate-500">
                Your email is verified. You can sign in now.
              </p>
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="rounded-full bg-[#12141C] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#232735]"
              >
                Sign in
              </button>
            </>
          )}
          {verifyStatus === 'error' && (
            <>
              <XCircle className="mb-4 h-14 w-14 text-red-500" strokeWidth={1.75} />
              <p className="mb-2 text-[15px] font-medium text-slate-700">
                Verification failed
              </p>
              <p className="mb-6 text-[13px] font-medium text-red-500">
                {globalError || 'This link is invalid or expired.'}
              </p>
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="text-sm font-semibold text-[#4C6FFF] hover:text-[#3a5ae6]"
              >
                Back to sign in
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: easeOut }}
    >
      <div className="mb-8 text-center sm:text-left">
          {(mode === 'forgot' || mode === 'reset' || mode === 'verify') && (
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-[#14142b]"
            >
              <ArrowLeft size={16} /> Back to sign in
            </button>
          )}

          <AuthHeading title={heading} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: easeOut }}
              className="text-[15px] font-medium text-slate-500"
            >
              {subtitle}
            </motion.p>
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="w-full" noValidate>
          <div className="space-y-3.5">
            <AnimatePresence initial={false} mode="sync">
              {mode === 'signup' && (
                <motion.div
                  key="names"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: easeOut }}
                  className="overflow-hidden"
                >
                  <div className="flex w-full flex-col gap-3.5 sm:flex-row sm:gap-3">
                    <InputField
                      label="First name"
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      icon={User}
                      error={errors.firstName}
                      autoComplete="given-name"
                    />
                    <InputField
                      label="Last name"
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      icon={User}
                      error={errors.lastName}
                      autoComplete="family-name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {(mode === 'login' || mode === 'signup' || mode === 'forgot' || mode === 'verify') && (
              <InputField
                label={mode === 'login' ? 'Email or username' : 'Email'}
                type={mode === 'login' ? 'text' : 'email'}
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setDismissedGlobal(true);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                icon={Mail}
                error={emailError}
                autoComplete={mode === 'login' ? 'username' : 'email'}
              />
            )}

            {mode === 'verify' && (
              <div className="flex w-full flex-col">
                <InputField
                  label="Verification Code (OTP)"
                  type="text"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(val);
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
                  }}
                  icon={CheckCircle2}
                  error={errors.otp}
                  autoComplete="one-time-code"
                />
                <div className="mt-2.5 flex justify-end pr-1">
                  {resendSuccess ? (
                    <span className="text-xs font-semibold text-green-600">
                      Verification code resent!
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={resending || !email}
                      onClick={async () => {
                        if (!email) return;
                        setResending(true);
                        try {
                          if (onResendOtp) {
                            await onResendOtp(email);
                            setResendSuccess(true);
                            setTimeout(() => setResendSuccess(false), 5000);
                          }
                        } catch (err) {
                          // Error handled by parent
                        } finally {
                          setResending(false);
                        }
                      }}
                      className="text-xs font-bold text-[#4C6FFF] hover:text-[#3a5ae6] disabled:opacity-50 transition-colors"
                    >
                      {resending ? 'Resending...' : 'Resend verification code'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
              <div>
                <InputField
                  label={mode === 'reset' ? 'New password' : 'Password'}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setDismissedGlobal(true);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  isPassword
                  showPwd={showPassword}
                  togglePwd={() => setShowPassword(!showPassword)}
                  error={passwordError}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                {mode === 'login' && (
                  <div className="mt-1.5 flex justify-end pr-1">
                    <button
                      type="button"
                      onClick={() => handleModeChange('forgot')}
                      className="text-sm font-semibold text-slate-500 transition-colors hover:text-[#14142b]"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            )}

            <AnimatePresence initial={false} mode="sync">
              {(mode === 'signup' || mode === 'reset') && (
                <motion.div
                  key="confirm"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: easeOut }}
                  className="overflow-hidden"
                >
                  <InputField
                    label="Confirm password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    isPassword
                    showPwd={showConfirmPassword}
                    togglePwd={() => setShowConfirmPassword(!showConfirmPassword)}
                    error={errors.confirmPassword}
                    autoComplete="new-password"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex w-full flex-col gap-3">
            <PrimaryButton loading={loading} reduce={reduce}>
              {mode === 'login'
                ? 'Sign in'
                : mode === 'signup'
                  ? 'Create account'
                  : mode === 'forgot'
                    ? 'Send reset link'
                    : mode === 'verify'
                      ? 'Verify code'
                      : 'Update password'}
            </PrimaryButton>

            {(mode === 'login' || mode === 'signup') && (
              <>
                <div className="my-1 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  <div className="h-px flex-1 bg-slate-200/90" />
                  Or
                  <div className="h-px flex-1 bg-slate-200/90" />
                </div>

                <motion.button
                  type="button"
                  onClick={onGoogleLogin}
                  whileHover={reduce ? undefined : { y: -1 }}
                  whileTap={reduce ? undefined : { scale: 0.985 }}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-[#14142b] transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </motion.button>
              </>
            )}
          </div>
        </form>
    </motion.div>
  );
}
