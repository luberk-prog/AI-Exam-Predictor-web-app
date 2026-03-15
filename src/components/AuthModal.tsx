import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { signInWithGoogle, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, auth } from '../firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-[#1C1C1C] rounded-[2rem] shadow-2xl overflow-hidden border border-black/5 dark:border-white/5"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors dark:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-10 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold dark:text-white">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-black/40 dark:text-white/40 font-sans">
              {mode === 'signin' 
                ? 'Sign in to continue your exam preparation.' 
                : 'Join thousands of students studying smarter.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 dark:text-white" />
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-black/5 dark:bg-white/5 border-none rounded-2xl py-4 pl-12 pr-4 font-sans text-sm focus:ring-2 focus:ring-[#5A5A40] transition-all dark:text-white"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 dark:text-white" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/5 dark:bg-white/5 border-none rounded-2xl py-4 pl-12 pr-4 font-sans text-sm focus:ring-2 focus:ring-[#5A5A40] transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 dark:text-white" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/5 dark:bg-white/5 border-none rounded-2xl py-4 pl-12 pr-4 font-sans text-sm focus:ring-2 focus:ring-[#5A5A40] transition-all dark:text-white"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-sans px-1">{error}</p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#1a1a1a] dark:bg-[#A8A878] text-white dark:text-black py-4 rounded-2xl font-sans font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/5 dark:border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-white dark:bg-[#1C1C1C] px-4 text-black/20 dark:text-white/20">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 py-4 rounded-2xl font-sans font-bold flex items-center justify-center gap-3 hover:bg-black/5 dark:hover:bg-white/10 transition-all dark:text-white"
          >
            <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
            Sign in with Google
          </button>

          <p className="text-center text-xs font-sans text-black/40 dark:text-white/40">
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-[#5A5A40] dark:text-[#A8A878] font-bold hover:underline"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
