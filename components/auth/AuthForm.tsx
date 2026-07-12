'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './AuthForm.module.css';
import { useAuthStore } from '@/store/auth.store';
import { AuthService } from '@/services/auth.service';

interface AuthFormProps {
  initialMode: 'login' | 'signup';
}

export default function AuthForm({ initialMode }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    // Optionally update the URL without refreshing
    router.replace(newMode === 'login' ? '/login' : '/register');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (mode === 'signup') {
      if (!/^[a-zA-Z\s]{2,50}$/.test(firstName)) {
        newErrors.firstName = "First Name must be 2-50 characters (letters only).";
      }
      if (!/^[a-zA-Z\s]{2,50}$/.test(lastName)) {
        newErrors.lastName = "Last Name must be 2-50 characters (letters only).";
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
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Please enter a valid email address.";
      }
      if (!password) {
        newErrors.password = "Password is required.";
      }
    }
    return newErrors;
  };

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { user, accessToken } = await AuthService.login({ email, password });
        setAuth(user, accessToken);
        
        const returnTo = searchParams.get('returnTo') || searchParams.get('callbackUrl');
        const safePath = returnTo?.startsWith('/') ? returnTo : '/dashboard';
        router.push(safePath);
      } else {
        await AuthService.register({ firstName, lastName, email, password });
        setShowSuccess(true);
      }
    } catch (err: any) {
      setErrors({ global: err.response?.data?.message || err.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', color: '#0056b3', marginBottom: '1rem' }}>✓</div>
        <h2 style={{ marginBottom: '1rem' }}>Registered Successfully!</h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>Your account has been created. Please log in to continue.</p>
        <button 
          className={styles.submitButton}
          onClick={() => {
            setShowSuccess(false);
            setMode('login');
            setPassword('');
            setConfirmPassword('');
            setFirstName('');
            setLastName('');
            setErrors({});
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {mode === 'login' ? 'Login Form' : 'Signup Form'}
      </h1>

      <div className={styles.toggleContainer}>
        <button
          className={`${styles.toggleButton} ${mode === 'login' ? styles.active : ''}`}
          onClick={() => handleModeChange('login')}
          type="button"
        >
          Login
        </button>
        <button
          className={`${styles.toggleButton} ${mode === 'signup' ? styles.active : ''}`}
          onClick={() => handleModeChange('signup')}
          type="button"
        >
          Signup
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {errors.global && <div style={{ color: 'red', textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>{errors.global}</div>}
        {mode === 'signup' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <input
                type="text"
                className={styles.input}
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {errors.firstName && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px', textAlign: 'left' }}>{errors.firstName}</div>}
            </div>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <input
                type="text"
                className={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.lastName && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px', textAlign: 'left' }}>{errors.lastName}</div>}
            </div>
          </div>
        )}
        
        <div className={styles.inputGroup}>
          <input
            type="email"
            className={styles.input}
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px', textAlign: 'left' }}>{errors.email}</div>}
        </div>



        <div className={styles.inputGroup}>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              className={styles.input}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff size={18} color="#666" /> : <FiEye size={18} color="#666" />}
            </button>
          </div>
          {errors.password && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px', textAlign: 'left' }}>{errors.password}</div>}
        </div>
        
        {mode === 'signup' && (
          <div className={styles.inputGroup}>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={styles.input}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button 
                type="button"
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <FiEyeOff size={18} color="#666" /> : <FiEye size={18} color="#666" />}
              </button>
            </div>
            {errors.confirmPassword && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px', textAlign: 'left' }}>{errors.confirmPassword}</div>}
          </div>
        )}

        {mode === 'login' && (
          <Link href="/forgot-password" className={styles.forgotPassword}>
            Forgot password?
          </Link>
        )}

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Signup')}
        </button>
      </form>

      <div className={styles.footer}>
        {mode === 'login' ? (
          <>
            Not a member?
            <Link href="/register" className={styles.footerLink} onClick={(e) => {
              e.preventDefault();
              handleModeChange('signup');
            }}>
              Signup now
            </Link>
          </>
        ) : (
          <>
            Already a member?
            <Link href="/login" className={styles.footerLink} onClick={(e) => {
              e.preventDefault();
              handleModeChange('login');
            }}>
              Login now
            </Link>
          </>
        )}
      </div>

      <div className={styles.divider}>OR</div>

      <button 
        type="button" 
        className={styles.googleButton}
        onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
      >
        <FcGoogle size={24} />
        Continue with Google
      </button>
    </div>
  );
}
