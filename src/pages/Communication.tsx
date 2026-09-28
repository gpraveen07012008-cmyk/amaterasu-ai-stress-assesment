import React, { useState } from 'react';
import { 
  MessageSquare, 
  PhoneCall, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Lock, 
  Heart,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, ConcernCategory, SupportRegion } from '../types';
import { ANONYMOUS_PEER_POOL, AnonymousPeer } from '../data/demoUsers';

interface CommunicationProps {
  user: UserProfile;
  onStartSession: (mode: 'text' | 'voice', peer: AnonymousPeer, genderPref: string, matchedConcern: string) => void;
  onCallUser: (callId: string) => void;
  callError?: string;
  onNavigate: (path: string) => void;
}

export const Communication: React.FC<CommunicationProps> = ({ user, onStartSession, onCallUser, callError, onNavigate }) => {
  const [selectedMode, setSelectedMode] = useState<'text' | 'voice'>('text');
  const [genderPref, setGenderPref] = useState<'Any' | 'Same gender' | 'Different gender'>('Any');
  const [matchByConcern, setMatchByConcern] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [matchedPeer, setMatchedPeer] = useState<AnonymousPeer | null>(null);
  const [targetCallId, setTargetCallId] = useState('');

  const myConcern = user.lastConcern || 'Academic pressure';

  const handleBeginMatch = () => {
    setIsMatching(true);
    setMatchedPeer(null);

    // Simulate safe matching algorithm based on criteria
    setTimeout(() => {
      let pool = [...ANONYMOUS_PEER_POOL];
      if (matchByConcern) {
        const concernMatches = pool.filter((p) => p.mainConcern === myConcern);
        if (concernMatches.length > 0) pool = concernMatches;
      }

      // Pick best candidate
      const matched = pool[Math.floor(Math.random() * pool.length)] || ANONYMOUS_PEER_POOL[0];
      setMatchedPeer(matched);
      setIsMatching(false);
    }, 1200);
  };

  const handleEnterRoom = () => {
    if (matchedPeer) {
      onStartSession(selectedMode, matchedPeer, genderPref, myConcern);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ORANGE Support Region Lounge
          </span>
          <span className="text-xs text-slate-400">• Anonymous Peer Exchange</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Anonymous Peer Communication
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Talk to a fellow student or peer experiencing similar pressures. Sessions are strictly anonymous, moderated, and capped at 15 minutes. <b>No video calls allowed.</b>
        </p>
      </div>

      {/* Identity Protection Assurance Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Your Masked Anonymous Persona
              </div>
              <div className="text-lg font-black text-indigo-300">
                {user.anonymousId}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Your real name ({user.name}), email, password, and personal records are permanently hidden.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center text-xs text-slate-300 bg-slate-950/70 px-3 py-2 rounded-xl border border-slate-800">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Strict 15:00 max duration</span>
          </div>
        </div>
      </div>

      {/* Matching Configuration Options */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-white">1. Select Communication Medium</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Text option */}
          <div
            onClick={() => setSelectedMode('text')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
              selectedMode === 'text'
                ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-600/20'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className={`p-3 rounded-xl ${selectedMode === 'text' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Anonymous Text Chat</div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time text messaging with automated safety moderation and auto 15-minute countdown.
              </p>
            </div>
          </div>

          {/* Voice option */}
          <div
            onClick={() => setSelectedMode('voice')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
              selectedMode === 'voice'
                ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-600/20'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className={`p-3 rounded-xl ${selectedMode === 'voice' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Anonymous Voice Call</div>
              <p className="text-xs text-slate-400 mt-1">
                Browser audio call with mute, speaker, end session, and report features. <b>Zero camera/video.</b>
              </p>
            </div>
          </div>
        </div>

        {selectedMode === 'voice' ? (
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Call by Dummy Call ID</h3>
            <p className="text-xs text-slate-400">Enter another user's Call ID. This is an app-only identity, not a telephone number.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={targetCallId}
                onChange={(event) => setTargetCallId(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && targetCallId.trim()) onCallUser(targetCallId);
                }}
                placeholder="User_123456"
                aria-label="User Dummy Call ID"
                className="flex-1 bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onCallUser(targetCallId)}
                disabled={!targetCallId.trim()}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Call User
              </button>
            </div>
            {callError && <p role="alert" className="text-xs text-rose-300">{callError}</p>}
          </div>
        ) : (
          <>
        {/* 2. Preferences */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">2. Matching Preferences</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Gender Matching Preference
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['Any', 'Same gender', 'Different gender'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setGenderPref(opt)}
                    className={`py-2 px-3 rounded-xl font-medium border text-center transition-all ${
                      genderPref === opt
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Note: Used strictly for pairing comfort. We never infer interests or traits from gender.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Shared Concern Focus
              </label>
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={matchByConcern}
                  onChange={(e) => setMatchByConcern(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-900"
                />
                <div className="text-xs">
                  <span className="text-slate-200 font-medium">Prioritize shared concern: </span>
                  <span className="text-amber-400 font-bold">{myConcern}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Pairs you with someone navigating similar themes without disclosing private assessment notes.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Match Trigger & Result */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          {!matchedPeer ? (
            <button
              onClick={handleBeginMatch}
              disabled={isMatching}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isMatching ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Searching for available peer...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>FIND ANONYMOUS PEER</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
                  {matchedPeer.anonymousId.slice(-4)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{matchedPeer.anonymousId}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-mono">Matched & Ready</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Shared concern category: <b className="text-slate-300">{matchedPeer.mainConcern}</b>
                  </div>
                </div>
              </div>

              <button
                onClick={handleEnterRoom}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>ENTER {selectedMode === 'text' ? 'TEXT CHAT' : 'VOICE CALL'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {/* Safety & Moderation Rules */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <b className="text-slate-200">Three-Tier Community Safety Moderation:</b>
          <p className="mt-1 leading-relaxed">
            All text and voice streams are checked for abusive language or personal contact requests.
            First violation triggers a <b>⚠️ Warning</b>; a second violation triggers <b>🔇 Temporary Mute</b>; a third violation automatically <b>❌ Ends the Session</b>.
          </p>
        </div>
      </div>
    </div>
  );
};
