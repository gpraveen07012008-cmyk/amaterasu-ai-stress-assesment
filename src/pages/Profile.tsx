import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Award,
  Trash2, 
  LogOut, 
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
  onRefreshUser: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, onRefreshUser }) => {
  const [privacyConsentView, setPrivacyConsentView] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    if (confirm('Reset prototype local storage to initial demo state?')) {
      localStorage.clear();
      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Account & Security Settings
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          User Profile & Privacy Controls
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Review your account information and anonymous peer persona.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300">
          Data reset successfully. Reloading application...
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        
        {/* Profile Card Top */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-indigo-500/20">
              <div className="w-full h-full bg-[#080D1A] rounded-[14px] flex items-center justify-center font-extrabold text-white text-xl">
                {user.name.charAt(0)}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">User ID: @{user.userId}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  Anonymous Persona: {user.anonymousId}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 rounded-xl text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Data Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Marital Status</span>
            <span className="font-bold text-white">{user.maritalStatus}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Sex</span>
            <span className="font-bold text-white">{user.sex}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Date of Birth</span>
            <span className="font-bold text-white">{user.dob}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Account Created</span>
            <span className="font-bold text-white">
              {new Date(user.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Privacy, Anonymity & Consent Architecture */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-white">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3>Privacy & Data Minimization Charter</h3>
          </div>
          <button
            onClick={() => setPrivacyConsentView(!privacyConsentView)}
            className="text-xs text-indigo-400 hover:underline font-semibold"
          >
            {privacyConsentView ? 'Collapse Policy' : 'View Full Policy'}
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          AMATERASU operates on strict zero-doxxing, zero-leak anonymity. Audio streams are processed locally via browser APIs or secure server proxy and are not sold or redistributed.
        </p>

        {privacyConsentView && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2 animate-in fade-in">
            <p><b>1. Non-Diagnostic Guardrails:</b> At no point does the system store or assign clinical DSM/ICD diagnosis codes.</p>
            <p><b>2. Peer Masking:</b> Peer participants only ever see dummy anonymized handles (e.g. {user.anonymousId}). Real phone numbers or IP addresses are never transmitted.</p>
            <p><b>3. Session Expiry:</b> Peer chat transcripts auto-conclude at 15 minutes to prevent obsessive ruminative loops.</p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500">Prototype Demo State Management</span>
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-500/30 rounded-xl font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Prototype Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
