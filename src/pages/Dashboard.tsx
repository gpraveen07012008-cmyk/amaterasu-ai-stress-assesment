import React from 'react';
import { 
  Sparkles, 
  Mic, 
  HeartPulse, 
  MessageSquare, 
  History, 
  Award, 
  PhoneCall, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  Activity,
  Sun
} from 'lucide-react';
import { UserProfile, SupportRegion } from '../types';
import { RegionBadge } from '../components/RegionBadge';

interface DashboardProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
  onTriggerDemo: (region: SupportRegion) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onTriggerDemo }) => {
  const currentSvi = user.lastSvi ?? 56;
  const currentRegion = user.lastRegion ?? 'ORANGE';
  const lastConcern = user.lastConcern ?? 'Academic pressure';

  const cards = [
    {
      title: 'AI Voice Assistant',
      desc: 'Conduct a natural 5-question emotional assessment via speech or text.',
      icon: Mic,
      gradient: 'from-indigo-600/20 to-purple-600/20',
      border: 'border-indigo-500/30',
      badge: 'Main Feature',
      actionText: 'Start Session',
      path: 'assessment'
    },
    {
      title: 'My Latest Assessment',
      desc: `SVI: ${currentSvi} / 100 • Priority: ${currentRegion} • Primary Concern: ${lastConcern}.`,
      icon: HeartPulse,
      gradient: 'from-amber-600/20 to-rose-600/20',
      border: 'border-amber-500/30',
      badge: 'Screening',
      actionText: 'View Analysis',
      path: 'analysis'
    },
    {
      title: 'Personalized Support',
      desc: 'Actionable calming exercises, 4-7-8 breathing, and task breakdown strategies.',
      icon: Sun,
      gradient: 'from-emerald-600/20 to-teal-600/20',
      border: 'border-emerald-500/30',
      badge: 'Intervention',
      actionText: 'Open Care Plan',
      path: 'personalized-support'
    },
    {
      title: 'Peer Communication',
      desc: 'Connect with an anonymous peer via moderated 15-minute voice or text.',
      icon: MessageSquare,
      gradient: 'from-purple-600/20 to-indigo-600/20',
      border: 'border-purple-500/30',
      badge: 'ORANGE Priority',
      actionText: 'Enter Lounge',
      path: 'communication'
    },
    {
      title: 'Call & Session History',
      desc: 'Review past peer conversations, ratings, and favourited anonymous callers.',
      icon: History,
      gradient: 'from-slate-700/20 to-slate-800/20',
      border: 'border-slate-700',
      badge: 'History',
      actionText: 'View Logs',
      path: 'call-history'
    },
    {
      title: 'Credits & Rewards',
      desc: `${user.credits} / 100 points earned. Reach 100 to unlock Favourite Previous Callers!`,
      icon: Award,
      gradient: 'from-amber-500/20 to-yellow-600/20',
      border: 'border-amber-500/30',
      badge: `${user.credits}% Reached`,
      actionText: 'View Rewards',
      path: 'credits'
    },
    {
      title: 'Professional Support',
      desc: 'Verified clinical referrals, psychologists, psychiatrists, and 24/7 helplines.',
      icon: PhoneCall,
      gradient: 'from-rose-600/20 to-pink-600/20',
      border: 'border-rose-500/30',
      badge: 'RED Priority',
      actionText: 'Browse Providers',
      path: 'professional-support'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Anonymous ID: {user.anonymousId}
              </span>
              <span className="text-xs text-slate-400">• Non-clinical screening</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-indigo-200">{user.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              AMATERASU evaluates self-reported emotional trajectory, stress concerns, and social comfort to connect you with personalized care and anonymous peer support.
            </p>
          </div>

          {/* Main CTA */}
          <button
            onClick={() => onNavigate('assessment')}
            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all group shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Mic className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-indigo-200 font-semibold">Ready to share?</div>
              <div className="text-base tracking-wide font-black">START AI CONVERSATION</div>
            </div>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Metric Highlight Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current SVI */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current SVI Score</div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-white">{currentSvi}</span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Stress Vulnerability Index</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        {/* Support Priority Region */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Support Region</div>
            <div className="mt-2">
              <RegionBadge region={currentRegion} size="sm" />
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5">Based on latest screening</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <HeartPulse className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* Current Support Credits */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Support Credits</div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-amber-400">{user.credits}</span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
            <div className="w-28 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, user.credits)}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* Main Concern */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Concern</div>
            <div className="text-lg font-bold text-slate-100 mt-1 truncate max-w-[160px]">
              {lastConcern}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Identified from session</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Sun className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Support Pathways & Services</h2>
          <span className="text-xs text-slate-400">Choose a care option</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate(card.path)}
                className={`bg-slate-900/80 border ${card.border} hover:border-indigo-400/60 rounded-3xl p-6 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden flex flex-col justify-between`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.gradient} rounded-bl-full pointer-events-none blur-2xl opacity-50`} />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                  <span>{card.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Three Support Regions Overview Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Amaterasu 3-Tier Support Priority Framework
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
            <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>🟢 GREEN (SVI: 0–30)</span>
            </div>
            <div className="font-semibold text-slate-300">Low Support Priority</div>
            <p className="text-slate-400 mt-1">
              Personalized preventative care: 4-7-8 breathing, gentle study chunking, routine suggestions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20">
            <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>🟠 ORANGE (SVI: 31–70)</span>
            </div>
            <div className="font-semibold text-slate-300">Moderate Support Priority</div>
            <p className="text-slate-400 mt-1">
              Everything in Green PLUS 15-minute anonymous peer matching via moderated voice or text chat.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20">
            <div className="flex items-center gap-2 font-bold text-rose-400 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>🔴 RED (SVI: 71–100)</span>
            </div>
            <div className="font-semibold text-slate-300">High Support Priority</div>
            <p className="text-slate-400 mt-1">
              Prompt professional referral: certified psychologists, psychiatrists, counselors, and 24/7 national helplines.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>⚠️ Non-clinical prototype: This application does not diagnose clinical mental illness.</span>
          <div className="flex gap-2">
            <button
              onClick={() => onTriggerDemo('GREEN')}
              className="text-emerald-400 hover:underline"
            >
              Demo Green
            </button>
            <span>•</span>
            <button
              onClick={() => onTriggerDemo('ORANGE')}
              className="text-amber-400 hover:underline"
            >
              Demo Orange
            </button>
            <span>•</span>
            <button
              onClick={() => onTriggerDemo('RED')}
              className="text-rose-400 hover:underline"
            >
              Demo Red
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
