import { useState, FormEvent } from 'react';
import { Mail, KeySquare, Check, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Page } from '../types';
import Input from './Input';
import Button from './Button';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

interface ForgotPasswordPageProps {
  onNavigate: (page: Page) => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function ForgotPasswordPage({ onNavigate, showToast }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      showToast('Please enter a valid email address first.', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setIsLoading(false);
      setIsSuccess(true);
      showToast('Reset email dispatched successfully!', 'success');
    } catch (error: any) {
      setIsLoading(false);
      showToast(error.message || 'Failed to send password reset email.', 'error');
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

        {!isSuccess ? (
          <>
            {/* Form State */}
            <div className="flex flex-col items-center justify-center text-center gap-1.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <KeySquare size={22} className="text-white" />
              </div>
              <div className="mt-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent tracking-tight">
                  Reset Password
                </h2>
                <p className="text-xs text-brand-text-secondary mt-1 max-w-[280px] mx-auto leading-relaxed">
                  Enter your email address below and we'll send you a password recovery link.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Registered Email"
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

              <Button type="submit" isLoading={isLoading} variant="gradient">
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          /* Success Card State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col items-center justify-center text-center gap-5 py-4"
          >
            <div className="w-16 h-16 rounded-full bg-brand-success/15 border border-brand-success/30 flex items-center justify-center text-brand-success shadow-lg shadow-brand-success/10">
              <Check size={32} />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Reset Link Sent!
              </h3>
              <p className="text-sm text-brand-text-secondary leading-relaxed max-w-[290px] mx-auto">
                We've delivered a secure password reset link to <span className="text-white font-medium">{email}</span>. Please check your inbox.
              </p>
            </div>

            <div className="bg-[#12141A]/50 border border-brand-border/30 rounded-xl p-3.5 text-xs text-brand-text-secondary leading-normal max-w-xs">
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </div>

            <Button
              onClick={() => setIsSuccess(false)}
              variant="outline"
              fullWidth={true}
              className="mt-2"
            >
              Resend Link
            </Button>
          </motion.div>
        )}

        {/* Universal Back to Login */}
        <div className="flex justify-center border-t border-brand-border/30 pt-4 mt-1">
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-2 text-sm text-brand-text-secondary hover:text-white transition-colors bg-transparent cursor-pointer font-medium"
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
