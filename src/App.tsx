/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Page, Toast } from './types';
import BackgroundEffect from './components/BackgroundEffect';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import DashboardView from './components/DashboardView';
import ToastContainer from './components/Toast';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { seedDatabaseIfEmpty } from './lib/seeds';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page | 'dashboard'>('login');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  // Helper to show custom dynamic toasts
  const showToast = useCallback((message: string, type: Toast['type']) => {
    const newToast: Toast = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real-time Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Double check status field in Firestore database
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.status === 'banned') {
              await signOut(auth);
              setUserEmail(null);
              setCurrentPage('login');
              showToast('This account has been banned. Access denied.', 'error');
              return;
            }
            
            if (userData.role === 'admin' || user.email === 'cuahangtienloituanhue@gmail.com') {
              // Run seeding for admin to make sure everything is instantiated
              seedDatabaseIfEmpty();
            }
          }
          setUserEmail(user.email);
          setCurrentPage('dashboard');
        } catch (e) {
          console.error("Auth listener error syncing Firestore status", e);
          setUserEmail(user.email);
          setCurrentPage('dashboard');
        }
      } else {
        setUserEmail(null);
        setCurrentPage('login');
      }
    });

    return () => unsubscribe();
  }, [showToast]);

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setTimeout(() => {
      setCurrentPage('dashboard');
    }, 500);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserEmail(null);
      setCurrentPage('login');
      showToast('Signed out successfully.', 'info');
    } catch (error: any) {
      showToast(error.message || 'Failed to sign out.', 'error');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Background Animated Atmosphere */}
      <BackgroundEffect />

      {/* Main Container */}
      <div className="w-full relative z-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentPage === 'dashboard' && userEmail ? (
            <DashboardView
              key="dashboard"
              email={userEmail}
              onLogout={handleLogout}
              showToast={showToast}
            />
          ) : (
            <motion.div
              key="auth-split-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-[1024px] bg-[#12141A]/70 backdrop-blur-lg border border-brand-border/60 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col lg:flex-row min-h-[640px] relative"
            >
              {/* Marketing Panel (Left Side of split view) */}
              <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-12 relative z-10 border-b lg:border-b-0 lg:border-r border-brand-border/40 bg-gradient-to-b from-[#12141A]/95 to-[#0A0B0F]/95 select-none shrink-0">
                <div className="flex flex-col gap-8">
                  {/* Logo block */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center shadow-md shadow-[#6C63FF]/20">
                      <svg
                        className="w-6 h-6 text-white"
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
                    <span className="text-2xl font-extrabold tracking-tight text-white">
                      ProSMM
                    </span>
                  </div>

                  {/* Headline Block */}
                  <div className="flex flex-col gap-3">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white">
                      Scale Your <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C63FF] to-[#00D4FF]">
                        Social Influence
                      </span>
                    </h1>
                    <p className="text-brand-text-secondary text-sm md:text-base leading-relaxed max-w-sm">
                      The professional SMM Panel reseller hub. Enjoy rapid automated delivery, state-of-the-art server APIs, and dedicated priority support.
                    </p>
                  </div>
                </div>

                {/* Statistics & Platform Network Indicators */}
                <div className="flex flex-col gap-6 mt-8 lg:mt-0">
                  {/* Platform Quick Badges */}
                  <div className="flex flex-wrap gap-2">
                    {['Instagram', 'TikTok', 'YouTube', 'Telegram'].map((plat) => (
                      <span
                        key={plat}
                        className="text-[10px] uppercase font-bold tracking-widest text-[#00D4FF] bg-[#00D4FF]/8 px-2.5 py-1 rounded-full border border-[#00D4FF]/15 flex items-center gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#00D4FF] animate-pulse" />
                        {plat}
                      </span>
                    ))}
                  </div>

                  {/* Feature Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1A1D26]/40 p-3.5 rounded-2xl border border-brand-border/40 hover:border-brand-primary/25 transition-colors">
                      <div className="text-[#00D4FF] font-bold text-lg md:text-xl tracking-tight">
                        1.2M+
                      </div>
                      <div className="text-brand-text-secondary text-[10px] font-bold uppercase tracking-wider mt-0.5">
                        Orders Fulfilled
                      </div>
                    </div>
                    <div className="bg-[#1A1D26]/40 p-3.5 rounded-2xl border border-brand-border/40 hover:border-[#00C896]/25 transition-colors">
                      <div className="text-[#00C896] font-bold text-lg md:text-xl tracking-tight">
                        99.9%
                      </div>
                      <div className="text-brand-text-secondary text-[10px] font-bold uppercase tracking-wider mt-0.5">
                        API Availability
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Interactive Panel (Right Side of split view) */}
              <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-6 lg:p-8 relative z-10 bg-[#1A1D26]/10 backdrop-blur-sm">
                <div className="w-full">
                  <AnimatePresence mode="wait">
                    {currentPage === 'login' && (
                      <LoginPage
                        onNavigate={setCurrentPage}
                        showToast={showToast}
                        onLoginSuccess={handleLoginSuccess}
                      />
                    )}

                    {currentPage === 'register' && (
                      <RegisterPage
                        onNavigate={setCurrentPage}
                        showToast={showToast}
                      />
                    )}

                    {currentPage === 'forgot-password' && (
                      <ForgotPasswordPage
                        onNavigate={setCurrentPage}
                        showToast={showToast}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Notifications Hub */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

