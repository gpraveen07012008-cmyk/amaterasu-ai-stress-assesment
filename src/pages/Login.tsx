import React, { useState } from 'react';
import { Sun, ShieldCheck, ArrowRight, Lock, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [userId, setUserId] = useState('alex.rivera');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(async () => {
      const res = await authService.login(userId, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      }
      setLoading(false);
    }, 350);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-indigo-500/20 mb-3">
            <div className="w-full h-full bg-[#080D1A] rounded-[14px] flex items-center justify-center">
              <Sun className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AMATERASU</h1>
          <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold mt-1">
            AI Stress Assessment & Personalized Support
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
            A compassionate, non-clinical screening and anonymous peer support environment.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-purple-600" />

          <h2 className="text-lg font-bold text-white mb-1">Welcome back</h2>
          <p className="text-xs text-slate-400 mb-6">Enter your credentials to access your dashboard</p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">User ID</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. alex.rivera"
                  className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Demo notice: Default demo password is "Password123!"')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 bg-slate-900"
                />
                <span className="text-xs text-slate-300">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'LOGIN'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
              >
                CREATE ACCOUNT
              </button>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted • Private • Anonymous Peer Identities</span>
          </div>
        </div>
      </div>
    </div>
  );
};
