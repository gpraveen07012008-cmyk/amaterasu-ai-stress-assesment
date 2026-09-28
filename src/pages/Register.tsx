import React, { useState } from 'react';
import { Sun, ShieldCheck, ArrowRight, User, Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

interface RegisterProps {
  onRegisterSuccess: (user: UserProfile) => void;
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [maritalStatus, setMaritalStatus] = useState<UserProfile['maritalStatus']>('Single');
  const [sex, setSex] = useState<UserProfile['sex']>('Prefer not to say');
  const [dob, setDob] = useState('');
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consented) {
      setError('Please review and accept the Privacy and Non-Clinical Screening consent.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    const normalizedPhoneNumber = phoneNumber.trim();
    const phoneDigits = normalizedPhoneNumber.replace(/\D/g, '');
    if (!/^\+?[0-9\s().-]+$/.test(normalizedPhoneNumber) || phoneDigits.length < 7 || phoneDigits.length > 15) {
      setError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      const res = await authService.register({
        name,
        userId,
        password,
        email: normalizedEmail,
        phoneNumber: normalizedPhoneNumber,
        maritalStatus,
        sex,
        dob
      });

      if (res.success && res.user) {
        onRegisterSuccess(res.user);
      } else {
        setError(res.error || 'Failed to create account.');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-indigo-500/20 mb-2">
            <div className="w-full h-full bg-[#080D1A] rounded-[14px] flex items-center justify-center">
              <Sun className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">AMATERASU</h1>
          <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold mt-0.5">
            Create Your Account
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-purple-600" />

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Lee"
                    className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">User ID</label>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="jordan.lee"
                  className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email ID</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@example.com"
                  className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 555 123 4567"
                  className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Marital Status</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value as any)}
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gender</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Privacy & Consent Notice */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 mt-4">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="consentCheck"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                  className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-900"
                />
                <label htmlFor="consentCheck" className="text-xs text-slate-300 cursor-pointer">
                  I understand that AMATERASU is a prototype stress screening and support tool. It does <b>NOT</b> diagnose mental illnesses or provide medical prescriptions. My real identity will never be shared with peer callers.
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating Account...' : 'CREATE ACCOUNT'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
              >
                LOGIN
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
