import React, { useState } from 'react';
import { ArrowRight, Loader2, Plane, Map as MapIcon, UserPlus, LogIn, Moon, Sun, Mail } from 'lucide-react';
import { loginWithGoogle, loginWithMicrosoft, loginWithEmail, registerWithEmail } from '../services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  onGuestAccess: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onGuestAccess, darkMode, toggleTheme }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleProviderLogin = async (provider: 'google' | 'microsoft') => {
    setIsLoading(true);
    setError(null);
    try {
      let user;
      if (provider === 'google') {
        user = await loginWithGoogle();
      } else {
        user = await loginWithMicrosoft();
      }
      onLoginSuccess(user);
    } catch (error: any) {
      console.error("Login failed", error);
      
      // Parse meaningful error
      if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please add it in Firebase Console > Authentication > Settings.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('Provider is disabled. Enable it in Firebase Console.');
      } else {
        setError(error.message || "Unable to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError(null);
    try {
      let user;
      if (authMode === 'signup') {
        user = await registerWithEmail(email, password);
      } else {
        user = await loginWithEmail(email, password);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Email already registered. Try signing in.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* Left Side - Hero Visual */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071&auto=format&fit=crop" 
            alt="Taj Mahal India"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-xl px-12 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-8">
            <MapIcon size={14} className="text-teal-400" />
            <span>AI-Powered Travel Companion</span>
          </div>
          
          <h1 className="text-6xl font-bold leading-tight mb-6 tracking-tight">
            Journeys worth <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">remembering.</span>
          </h1>
          
          <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-md">
            Create personalized itineraries for India's most breathtaking destinations in seconds. Your smart guide awaits.
          </p>

          <div className="flex gap-4">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <img 
                  key={i} 
                  src={`https://randomuser.me/api/portraits/thumb/women/${i + 20}.jpg`} 
                  className="w-10 h-10 rounded-full border-2 border-slate-900" 
                  alt="User"
                />
              ))}
            </div>
            <div className="flex flex-col justify-center text-sm">
              <span className="font-bold text-white">10k+ Travelers</span>
              <span className="text-slate-400">exploring right now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-slate-950 relative">
        <div className="absolute top-8 right-8 flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-500 font-bold text-xl">
             <Plane className="transform -rotate-45" /> Yatra
          </div>
        </div>

        <div className="max-w-md w-full animate-in slide-in-from-right-8 duration-700">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {authMode === 'signin' 
                ? 'Enter your credentials to access your trips.' 
                : 'Sign up to start planning your dream vacation.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {/* Email/Pass Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="you@example.com"
                />
                <Mail className="absolute right-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : (authMode === 'signin' ? <LogIn size={18} /> : <UserPlus size={18} />)}
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-950 text-slate-400">or continue with</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Google */}
            <button
              onClick={() => handleProviderLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 p-4 rounded-2xl transition-all duration-200 shadow-sm disabled:opacity-70"
            >
               <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
               </svg>
               <span className="font-semibold">Continue with Google</span>
            </button>

            {/* Microsoft */}
            <button
              onClick={() => handleProviderLogin('microsoft')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-4 rounded-2xl transition-all duration-200 shadow-sm disabled:opacity-70"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 23 23">
                <path fill="#f25022" d="M1 1h10v10H1z"/>
                <path fill="#00a4ef" d="M1 12h10v10H1z"/>
                <path fill="#7fba00" d="M12 1h10v10H12z"/>
                <path fill="#ffb900" d="M12 12h10v10H12z"/>
              </svg>
              <span className="font-semibold">Continue with Microsoft</span>
            </button>
          </div>

          <div className="mt-8 text-center space-y-4">
             <button 
               onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
               className="text-brand-600 dark:text-brand-400 font-semibold hover:underline text-sm"
             >
               {authMode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
             </button>
             
             <div>
              <button 
                onClick={onGuestAccess}
                className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-200 text-sm flex items-center justify-center gap-1 mx-auto transition-colors"
              >
                Continue as Guest <ArrowRight size={14} />
              </button>
             </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};