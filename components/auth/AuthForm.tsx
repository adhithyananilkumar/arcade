'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './AuthForm.module.css';

interface AuthFormProps {
  initialMode: 'login' | 'signup';
}

export default function AuthForm({ initialMode }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    // Optionally update the URL without refreshing
    router.replace(newMode === 'login' ? '/login' : '/register');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (mode === 'signup') {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        newErrors.username = "Username must be 3-20 characters long (letters, numbers, underscores).";
      }
      if (!/^[a-zA-Z\s]{2,50}$/.test(fullName)) {
        newErrors.fullName = "Full Name must be 2-50 characters (letters and spaces only).";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Please enter a valid email address.";
      }
      if (!/^\+?[\d\s-]{10,15}$/.test(phoneNumber)) {
        newErrors.phoneNumber = "Please enter a valid phone number.";
      }
      if (!gender) {
        newErrors.gender = "Please select a gender.";
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
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login' 
        ? { email, password }
        : { username, fullName, email, phoneNumber, gender, password };

      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(mode === 'login' ? 'Invalid credentials' : 'Registration failed. Email might be in use.');
      }

      const data = await response.json();
      const token = data.token;
      
      if (mode === 'login') {
        // Store token securely
        localStorage.setItem('token', token);
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        // Show success dialog
        setShowSuccess(true);
      }
    } catch (err: any) {
      setErrors({ global: err.message });
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
            setUsername('');
            setFullName('');
            setPhoneNumber('');
            setGender('');
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
          <>
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={styles.input}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px', textAlign: 'left' }}>{errors.username}</div>}
            </div>
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px', textAlign: 'left' }}>{errors.fullName}</div>}
            </div>
          </>
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

        {mode === 'signup' && (
          <>
            <div className={styles.inputGroup}>
              <input
                type="tel"
                className={styles.input}
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              {errors.phoneNumber && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px', textAlign: 'left' }}>{errors.phoneNumber}</div>}
            </div>
            <div className={styles.inputGroup}>
              <select
                className={styles.input}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{ appearance: 'none', backgroundColor: 'transparent' }}
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.gender && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px', textAlign: 'left' }}>{errors.gender}</div>}
            </div>
          </>
        )}

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

      <button type="button" className={styles.googleButton}>
        <FcGoogle size={24} />
        Continue with Google
      </button>
    </div>
  );
}
