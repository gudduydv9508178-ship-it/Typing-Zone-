import React, { useState } from 'react';
import { AuthUser } from '../types';
import { registerOrLoginUser } from '../utils/storage';
import { X, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'signup';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState<string>('');
  const [emailOrUsername, setEmailOrUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedInput = emailOrUsername.trim();
    if (!trimmedInput) {
      setError('Please enter your username or email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    const displayName = mode === 'signup' && name.trim() ? name.trim() : trimmedInput.split('@')[0];
    const email = trimmedInput.includes('@') ? trimmedInput : `${trimmedInput}@typingzone.com`;
    const userId = `user_${displayName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const user = registerOrLoginUser({
      id: userId,
      name: displayName,
      email,
      avatar: displayName.toLowerCase().includes('guddu') ? '🐼' : '🦊',
      provider: 'email',
    });

    onLoginSuccess(user);
    onClose();
  };

  const handleSocialLogin = (provider: 'google' | 'clever' | 'office365') => {
    let defaultName = 'Student';
    let defaultEmail = `student_${provider}@typingzone.com`;
    let avatar = '🐼';

    if (provider === 'google') {
      defaultName = 'Google Learner';
      defaultEmail = 'user@gmail.com';
      avatar = '🚀';
    } else if (provider === 'clever') {
      defaultName = 'Clever Student';
      defaultEmail = 'student@clever.com';
      avatar = '🎓';
    } else if (provider === 'office365') {
      defaultName = 'Office 365 User';
      defaultEmail = 'user@office365.com';
      avatar = '💻';
    }

    const userId = `${provider}_${Date.now()}`;
    const user = registerOrLoginUser({
      id: userId,
      name: defaultName,
      email: defaultEmail,
      avatar,
      provider,
    });

    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-[430px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 animate-in zoom-in-95 duration-150 text-slate-800">
        
        {/* Top Close Button (✕) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Card Title (Exact TypingClub: "Login Individual Edition") */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'login' ? 'Login Individual Edition' : 'Sign Up Individual Edition'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Welcome to <span className="font-bold text-blue-600">Typing Zone</span>
          </p>
        </div>

        {/* ============================================================== */}
        {/* THREE SOCIAL LOGIN BUTTONS AT TOP                             */}
        {/* 1. Sign in with Google                                         */}
        {/* 2. Sign in with Clever                                         */}
        {/* 3. Sign in with Office 365                                     */}
        {/* ============================================================== */}
        <div className="space-y-2.5 mb-5">
          
          {/* Sign in with Google */}
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/80 text-slate-700 text-sm font-semibold flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            {/* Google Colorful G Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.24C.45 8.14 0 9.99 0 12s.45 3.86 1.24 5.43l4.04-3.14z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.57l4.04 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Sign in with Clever */}
          <button
            type="button"
            onClick={() => handleSocialLogin('clever')}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/80 text-slate-700 text-sm font-semibold flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            {/* Clever Blue Logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="5" fill="#2F54EB" />
              <path
                d="M7 12 C 7 8.5 9.5 6 13 6 C 16.5 6 18.5 8.5 18 10.5 L 14.5 10.5 C 14.8 9.5 14 8.5 12.8 8.5 C 10.8 8.5 9.8 10 9.8 12 C 9.8 14 10.8 15.5 12.8 15.5 C 14 15.5 14.8 14.5 14.5 13.5 L 18 13.5 C 18.5 15.5 16.5 18 13 18 C 9.5 18 7 15.5 7 12 Z"
                fill="#FFFFFF"
              />
            </svg>
            <span>Sign in with Clever</span>
          </button>

          {/* Sign in with Office 365 */}
          <button
            type="button"
            onClick={() => handleSocialLogin('office365')}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/80 text-slate-700 text-sm font-semibold flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            {/* Microsoft 4-Color Squares Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
              <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
              <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
              <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
            </svg>
            <span>Sign in with Office 365</span>
          </button>

        </div>

        {/* "or" Divider */}
        <div className="relative flex items-center justify-center my-5">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
            or
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Username / Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Guddu Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all"
                  autoFocus
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your username or email"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all"
                required
                autoFocus={mode === 'login'}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('Demo password reminder: Any password will log you in!')}
                  className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/25 hover:shadow-lg transition-all cursor-pointer mt-2"
          >
            {mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        {/* Toggle between Login and Sign up */}
        <div className="mt-5 text-center text-xs text-slate-600 font-medium">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Log in
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
