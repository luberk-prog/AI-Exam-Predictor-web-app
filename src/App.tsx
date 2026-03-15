import { useState, useEffect } from 'react';
import { auth, signInWithGoogle, logout, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from './types';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CourseAnalysis from './components/CourseAnalysis';
import ProfileModal from './components/ProfileModal';
import SampleAnalysisModal from './components/SampleAnalysisModal';
import LegalPage from './components/LegalPages';
import AboutPage from './components/AboutPage';
import AuthModal from './components/AuthModal';
import { Sun, Moon, LogOut, GraduationCap, User as UserIcon, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'analysis' | 'privacy' | 'terms' | 'about'>('landing');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setCurrentView('dashboard');
        
        // Sync user profile to Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot for real-time profile updates
        unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // Create initial profile if it doesn't exist
            const profile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              createdAt: new Date().toISOString(),
            };
            setDoc(userRef, profile);
          }
        });
      } else {
        setUser(null);
        setUserProfile(null);
        setCurrentView('landing');
        if (unsubscribeProfile) unsubscribeProfile();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const navigateToAnalysis = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView('analysis');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] dark:bg-[#0a0a0a] flex items-center justify-center transition-colors">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <GraduationCap className="w-12 h-12 text-[#5A5A40] dark:text-[#A0A080]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] dark:bg-[#0a0a0a] text-[#1a1a1a] dark:text-[#f5f5f5] font-serif transition-colors">
      {/* Navigation */}
      <nav className="border-b border-black/10 dark:border-white/10 px-4 md:px-6 py-4 flex justify-between items-center bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setCurrentView(user ? 'dashboard' : 'landing')}
        >
          <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-[#5A5A40] dark:text-[#A0A080]" />
          <span className="text-lg md:text-xl font-bold tracking-tight truncate max-w-[150px] md:max-w-none">AI Exam Predictor</span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
          </button>

          {user ? (
            <>
              <div 
                className="flex items-center gap-2 px-2 md:px-3 py-1 rounded-full border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                onClick={() => setIsProfileModalOpen(true)}
              >
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="" className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-3 h-3 md:w-4 md:h-4" />
                )}
                <span className="text-xs md:text-sm font-sans hidden sm:inline">{userProfile?.displayName?.split(' ')[0] || 'User'}</span>
                <Settings className="w-3 h-3 opacity-40" />
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                setAuthMode('signin');
                setIsAuthModalOpen(true);
              }}
              className="bg-[#5A5A40] dark:bg-[#A0A080] text-white dark:text-black px-4 md:px-6 py-2 rounded-full font-sans text-xs md:text-sm font-medium hover:opacity-90 transition-all shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LandingPage 
                onStart={() => {
                  setAuthMode('signup');
                  setIsAuthModalOpen(true);
                }} 
                onViewSample={() => setIsSampleModalOpen(true)}
              />
            </motion.div>
          )}

          {currentView === 'dashboard' && userProfile && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Dashboard userProfile={userProfile} onSelectCourse={navigateToAnalysis} />
            </motion.div>
          )}

          {currentView === 'analysis' && selectedCourseId && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CourseAnalysis 
                courseId={selectedCourseId} 
                onBack={() => setCurrentView('dashboard')} 
              />
            </motion.div>
          )}

          {(currentView === 'privacy' || currentView === 'terms') && (
            <motion.div
              key="legal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LegalPage 
                type={currentView} 
                onBack={() => setCurrentView(user ? 'dashboard' : 'landing')} 
              />
            </motion.div>
          )}

          {currentView === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AboutPage 
                onBack={() => setCurrentView(user ? 'dashboard' : 'landing')} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {userProfile && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={userProfile}
          onUpdate={(updated) => setUserProfile(updated)}
        />
      )}

      <SampleAnalysisModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      <footer className="border-t border-black/10 dark:border-white/10 py-8 md:py-12 px-4 md:px-6 mt-12 md:mt-20 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50 dark:text-white/60 text-center md:text-left">
            <GraduationCap className="w-5 h-5" />
            <span className="text-xs md:text-sm font-sans">© 2026 AI Exam Predictor. Built for GCTU Students.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-xs md:text-sm font-sans opacity-50 dark:text-white/60">
            <button onClick={() => setCurrentView('about')} className="hover:opacity-100 transition-opacity">About</button>
            <button onClick={() => setCurrentView('privacy')} className="hover:opacity-100 transition-opacity">Privacy Policy</button>
            <button onClick={() => setCurrentView('terms')} className="hover:opacity-100 transition-opacity">Terms of Service</button>
            <a href="mailto:support@aiexampredictor.com" className="hover:opacity-100 transition-opacity">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
