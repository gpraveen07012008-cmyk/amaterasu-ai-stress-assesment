import React, { useState } from 'react';
import { 
  Award, 
  Star, 
  Sparkles, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  MessageSquare,
  Gift
} from 'lucide-react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface CreditsProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
  onRefreshUser: () => void;
}

export const Credits: React.FC<CreditsProps> = ({ user, onNavigate, onRefreshUser }) => {
  const [justClaimed, setJustClaimed] = useState(false);
  const isUnlocked = user.credits > 100;
  const progressPercent = Math.min(100, (user.credits / 100) * 100);

  const handleSimulateBonusCredits = () => {
    authService.addCredits(10);
    setJustClaimed(true);
    onRefreshUser();
    setTimeout(() => setJustClaimed(false), 2500);
  };

  const handleToggleFav = (anonymousId: string) => {
    authService.toggleFavouriteCaller(anonymousId);
    onRefreshUser();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Community Support Tier
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Support Credits & Milestone Rewards
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Earn credits by engaging in reflective assessments and submitting constructive peer conversation feedback.
        </p>
      </div>

      {/* Main Credit Gauge Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current Support Balance
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
                {user.credits}
              </span>
              <span className="text-xl font-bold text-slate-400 font-mono">/ 100 Credits</span>
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-md">
              {isUnlocked
                ? '🎉 Milestone Achieved! You have unlocked Favourite Previous Callers.'
                : `Earn ${Math.max(0, 101 - user.credits)} more credits to unlock the Favourite Previous Callers feature!`}
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-3 w-full md:w-auto">
            <button
              onClick={handleSimulateBonusCredits}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              <Gift className="w-4 h-4" />
              <span>Simulate Feedback (+10 Credits)</span>
            </button>
            {justClaimed && (
              <span className="text-xs text-amber-300 font-bold animate-in fade-in">
                +10 Credits added to your account!
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>0 Points</span>
            <span className="font-bold text-amber-400">{progressPercent.toFixed(0)}% Completed</span>
            <span>100 Points Milestone</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 rounded-full transition-all duration-700 shadow-md shadow-amber-500/40"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 100 Credit Reward: Favourite Previous Callers */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border transition-all ${
          isUnlocked
            ? 'bg-slate-900/90 border-amber-500/40 shadow-xl shadow-amber-500/10'
            : 'bg-slate-900/50 border-slate-800 opacity-90'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isUnlocked
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {isUnlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  100 Credits Milestone: Favourite Previous Callers
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                    isUnlocked
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isUnlocked ? 'UNLOCKED' : 'LOCKED AT 100 CREDITS'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Save supportive anonymous peers and request future anonymous voice/text sessions with them. Real names are never shown.
              </p>
            </div>
          </div>
        </div>

        {/* Favourited Callers List */}
        {isUnlocked ? (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Your Favourited Anonymous Peers:
            </h4>
            
            {(user.favouriteCallers && user.favouriteCallers.length > 0) ? (
              user.favouriteCallers.map((favId) => (
                <div
                  key={favId}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                      {favId.slice(-4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{favId}</span>
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Peer from previous completed session
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('communication')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Request Session</span>
                    </button>

                    <button
                      onClick={() => handleToggleFav(favId)}
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
                      title="Remove from favourites"
                    >
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
                You haven't favourited any anonymous peers yet. You can star callers directly from your Call History!
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
            <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p>
              Once you have more than 100 points by providing ratings and assessment feedback, you can star previous callers in your Call History to reconnect anonymously anytime they are active.
            </p>
          </div>
        )}
      </div>

      {/* Credit Earning Rules */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-sm font-bold text-white mb-3">How to Earn Support Credits:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">+10 Credits per Assessment Feedback</span>
            <p className="text-slate-400">Complete an AI voice assessment and submit how helpful the reflection was.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">+10 Credits per Peer Session Feedback</span>
            <p className="text-slate-400">Rate respectfulness and comfort after a 15-minute anonymous text or voice exchange.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
