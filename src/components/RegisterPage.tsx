import { useState, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Gift, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page } from '../types';
import Input from './Input';
import Button from './Button';
import PasswordStrength from './PasswordStrength';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, deleteUser, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface RegisterPageProps {
  onNavigate: (page: Page) => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function RegisterPage({ onNavigate, showToast }: RegisterPageProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Field validation states
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateUsername = (val: string) => {
    if (!val) {
      setUsernameError('Username is required');
      return false;
    }
    if (val.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }
    setUsernameError('');
    return true;
  };

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
    if (val.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (val: string) => {
    if (!val) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (val !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const generatedApiKey = 'ps_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 11);
        const nameFallback = userCredential.user.email?.split('@')[0] || 'User';
        const generatedReferral = nameFallback.substring(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

        await setDoc(userRef, {
          username: userCredential.user.displayName || nameFallback,
          email: userCredential.user.email,
          balance: 0.0,
          totalSpent: 0.0,
          totalOrders: 0,
          apiKey: generatedApiKey,
          role: 'user',
          status: 'active',
          referralCode: generatedReferral,
          createdAt: new Date().toISOString()
        });
        showToast('Account created successfully! Welcome to ProSMM.', 'success');
      } else {
        const userData = userSnap.data();
        if (userData.status === 'banned') {
          await auth.signOut();
          showToast('Your account is banned. Access denied.', 'error');
          setIsGoogleLoading(false);
          return;
        }
        showToast('Welcome back!', 'success');
      }

      setIsGoogleLoading(false);
      
      setTimeout(() => {
        onNavigate('login');
      }, 1000);
    } catch (error: any) {
      setIsGoogleLoading(false);
      showToast(error.message || 'Google authentication failed.', 'error');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isUserValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(confirmPassword);

    if (!agreedToTerms) {
      showToast('You must agree to the Terms of Service & Privacy Policy.', 'warning');
      return;
    }

    if (!isUserValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
      showToast('Please fix validation errors in red.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update auth profile with username
      try {
        await updateProfile(user, { displayName: username });
      } catch (err) {
        console.warn('Failed to update profile displayName', err);
      }

      // Generate unique API Key and referral code
      const generatedApiKey = 'ps_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 11);
      const generatedReferral = username.substring(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

      const isDefaultAdmin = email.toLowerCase() === 'cuahangtienloituanhue@gmail.com';

      // Create real Firestore user doc
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          username: username,
          email: email,
          balance: 0.0,
          totalSpent: 0.0,
          totalOrders: 0,
          apiKey: generatedApiKey,
          role: isDefaultAdmin ? 'admin' : 'user',
          status: 'active',
          referralCode: generatedReferral,
          createdAt: new Date().toISOString()
        });
      } catch (dbError: any) {
        // If DB creation fails, delete the auth user to avoid partial state
        await deleteUser(user).catch(() => {});
        throw new Error('Failed to initialize user database. ' + dbError.message);
      }

      setIsLoading(false);
      showToast('Account created successfully! Welcome to ProSMM.', 'success');
      
      setTimeout(() => {
        onNavigate('login');
      }, 1000);
    } catch (error: any) {
      setIsLoading(false);
      let errorMessage = error.message || 'Registration failed.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Please enable Email/Password Authentication in Firebase Console (Authentication -> Sign-in methods).';
      } else if (error.code === 'auth/network-request-failed' || errorMessage.includes('network-request-failed')) {
        errorMessage = 'Please check Firebase configuration. Enable Firebase in AI Studio Integrations tab.';
      } else if (error.message.includes('Missing or insufficient permissions') || error.message.includes('Failed to initialize')) {
        errorMessage = 'Failed to set up account permissions. Please contact an administrator.';
      }

      showToast(errorMessage, 'error');
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
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent" />

        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center gap-1.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-cyan/20">
            <User size={24} className="text-white" />
          </div>
          <div className="mt-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent tracking-tight">
              Create Account
            </h2>
            <p className="text-xs text-brand-text-secondary">
              Join the finest SMM reseller network in seconds
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <Input
            label="Username"
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (usernameError) validateUsername(e.target.value);
            }}
            onBlur={() => validateUsername(username)}
            icon={User}
            error={usernameError}
            required
          />

          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
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
          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword(e.target.value);
                if (confirmPassword) validateConfirmPassword(confirmPassword);
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
            {/* Live Password Strength meter */}
            <PasswordStrength password={password} />
          </div>

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmPasswordError) validateConfirmPassword(e.target.value);
            }}
            onBlur={() => validateConfirmPassword(confirmPassword)}
            icon={Lock}
            error={confirmPasswordError}
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {/* (Optional) Collapsible Referral code block */}
          <div className="border border-brand-border/40 rounded-xl overflow-hidden mt-1 bg-[#12141A]/50">
            <button
              type="button"
              onClick={() => setIsReferralOpen(!isReferralOpen)}
              className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-brand-text-secondary hover:text-white transition-colors select-none cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Gift size={14} className="text-brand-cyan" />
                <span>Do you have a referral code? (Optional)</span>
              </div>
              {isReferralOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <AnimatePresence>
              {isReferralOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-[#12141A] border-t border-brand-border/20">
                    <Input
                      label="Referral Code"
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2.5 text-xs font-medium text-brand-text-secondary hover:text-white transition-colors cursor-pointer select-none py-1.5 px-0.5 mt-1 leading-normal">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 shrink-0 rounded border-brand-border bg-[#12141A] text-brand-primary focus:ring-1 focus:ring-brand-primary accent-brand-primary mt-0.5"
            />
            <span>
              I agree to the{' '}
              <a href="#terms" onClick={(e) => e.preventDefault()} className="text-brand-cyan hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-brand-cyan hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>

          {/* Submit register */}
          <Button type="submit" isLoading={isLoading} variant="gradient" className="mt-2">
            Get Started
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
            Sign up with Google
          </Button>
        </form>

        {/* Go back */}
        <div className="text-center text-sm text-brand-text-secondary mt-1">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-brand-primary font-semibold hover:text-brand-primary/80 transition-colors ml-1 bg-transparent hover:underline cursor-pointer"
          >
            Login Here
          </button>
        </div>
      </div>
    </motion.div>
  );
}
