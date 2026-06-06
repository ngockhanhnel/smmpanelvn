import { useState, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { Page } from '../types';
import Input from './Input';
import Button from './Button';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface LoginPageProps {
  onNavigate: (page: Page) => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onLoginSuccess: (email: string) => void;
}

export default function LoginPage({ onNavigate, showToast, onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      const saved = localStorage.getItem('prosmm_remember_me');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    try {
      localStorage.setItem('prosmm_remember_me', checked ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to save rememberMe to local storage', e);
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Form errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError('Email is required');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Password is required');
      return false;
    }
    if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Initialize or get user doc
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: userCredential.user.email,
          createdAt: new Date().toISOString(),
          status: 'active',
          role: 'user',
          balance: 0,
        });
      } else {
        const userData = userSnap.data();
        if (userData.status === 'banned') {
          await auth.signOut();
          showToast('Your account is banned. Access denied.', 'error');
          setIsGoogleLoading(false);
          return;
        }
      }

      setIsGoogleLoading(false);
      showToast('Welcome back! Redirecting...', 'success');
      onLoginSuccess(userCredential.user.email || '');
    } catch (error: any) {
      setIsGoogleLoading(false);
      showToast(error.message || 'Google authentication failed.', 'error');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      showToast('Please correct form errors.', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Firestore to check status
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.status === 'banned') {
          await auth.signOut();
          showToast('Your account is banned. Access denied.', 'error');
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
      showToast('Welcome back! Redirecting...', 'success');
      onLoginSuccess(email);
    } catch (error: any) {
      setIsLoading(false);
      let errorMsg = error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : error.message || 'Authentication failed.';

      if (error.code === 'auth/network-request-failed' || errorMsg.includes('network-request-failed')) {
        errorMsg = 'Please check Firebase configuration. Enable Firebase in AI Studio Integrations tab.';
      }

      showToast(errorMsg, 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md px-4 py-8 relative z-10 mx-auto"
    >
      <div className="bg-[#1A1D26]/90 backdrop-blur-lg border border-brand-border/60 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />

        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="mt-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent tracking-tight">
              ProSMM <span className="bg-gradient-to-r from-brand-primary to-brand-cyan bg-clip-text text-transparent">Panel</span>
            </h1>
            <p className="text-xs font-semibold text-brand-cyan tracking-widest uppercase mt-0.5">
              The #1 SMM Panel Platform
            </p>
          </div>
        </div>

        {/* Demo Quick login removed to enforce real authentication */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) validateEmail(e.target.value);
            }}
            onBlur={() => validateEmail(email)}
            icon={Mail}
            error={emailError}
            required
          />

          {/* Password */}
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) validatePassword(e.target.value);
            }}
            onBlur={() => validatePassword(password)}
            icon={Lock}
            error={passwordError}
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {/* Options: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs font-medium select-none px-0.5">
            <label className="flex items-center gap-2 text-brand-text-secondary hover:text-white transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => handleRememberMeChange(e.target.checked)}
                className="w-4 h-4 rounded border-brand-border bg-[#12141A] text-brand-primary focus:ring-1 focus:ring-brand-primary accent-brand-primary"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-brand-cyan hover:text-[#00D4FF]/80 transition-colors bg-transparent hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <Button type="submit" isLoading={isLoading} variant="gradient">
            Sign In
          </Button>

          {/* Google Sign-in */}
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleGoogleSignIn} 
            isLoading={isGoogleLoading}
            className="mt-1"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" fillRule="evenodd" d="M12.012 21.054a8.96 8.96 0 0 1-5.719-2.073A8.995 8.995 0 0 1 3.03 12.56a9 9 0 0 1 12.38-7.905l-2.091 2.227a6.002 6.002 0 0 0-8.252 5.093 5.992 5.992 0 0 0 2.225 4.5 5.96 5.96 0 0 0 4.144 1.346c2.81-.137 5.006-2.093 5.378-4.821H12.01v-3.001h8.56c.106.604.143 1.229.083 1.86a8.932 8.932 0 0 1-2.916 5.753 8.97 8.97 0 0 1-5.725 2.443Z" clipRule="evenodd"/>
            </svg>
            Sign in with Google
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-1">
          <div className="absolute inset-x-0 h-px bg-brand-border/40" />
          <span className="relative z-10 bg-[#1A1D26] px-3.5 text-xs font-semibold text-brand-text-secondary uppercase tracking-widest">
            or
          </span>
        </div>

        {/* Switch to Register */}
        <div className="text-center text-sm text-brand-text-secondary">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-brand-primary font-semibold hover:text-brand-primary/80 transition-colors ml-1 bg-transparent hover:underline cursor-pointer"
          >
            Register Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
