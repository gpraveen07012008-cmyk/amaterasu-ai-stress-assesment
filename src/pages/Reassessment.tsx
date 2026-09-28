import React from 'react';
import { 
  RefreshCw, 
  ArrowRight, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  ShieldCheck, 
  HeartHandshake, 
  PhoneCall, 
  Sun,
  Activity
} from 'lucide-react';
import { UserProfile, SupportRegion } from '../types';
import { RegionBadge } from '../components/RegionBadge';

interface ReassessmentProps {
  user: UserProfile;
  previousSvi?: number;
  currentSvi?: number;
  previousRegion?: SupportRegion;
  currentRegion?: SupportRegion;
  onContinueSupport: () => void;
  onChangeSupport: () => void;
  onEscalateProfessional: () => void;
  onTakeNewAssessment: () => void;
}

export const Reassessment: React.FC<ReassessmentProps> = ({
  user,
  previousSvi = 64,
  currentSvi = 48,
  previousRegion = 'ORANGE',
  currentRegion = 'ORANGE',
  onContinueSupport,
  onChangeSupport,
  onEscalateProfessional,
  onTakeNewAssessment
}) => {
  const diff = currentSvi - previousSvi;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <RefreshCw className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Screening Comparison
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Post-Intervention Reassessment
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Compare your latest self-reported stress indicators against your earlier session to calibrate your next support step.
        </p>
      </div>

      {/* Comparison Scoreboard */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Previous SVI */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Previous Screening
            </span>
            <div className="text-4xl font-black text-slate-300 mt-2">
              {previousSvi} <span className="text-xs text-slate-500 font-mono">/ 100</span>
            </div>
            <div className="mt-3">
              <RegionBadge region={previousRegion} size="sm" />
            </div>
          </div>

          {/* Shift Indicator */}
          <div className="flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
              {diff < 0 ? (
                <TrendingDown className="w-6 h-6 text-emerald-400" />
              ) : diff > 0 ? (
                <TrendingUp className="w-6 h-6 text-amber-400" />
              ) : (
                <Minus className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <span className="text-xs font-bold text-slate-200">
              {diff < 0 ? `${Math.abs(diff)} Point Reduction` : diff > 0 ? `+${diff} Point Increase` : 'No SVI Shift'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Observed screening change</span>
          </div>

          {/* Current SVI */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-indigo-500/30 text-center ring-1 ring-indigo-500/20">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              Current Reassessment
            </span>
            <div className="text-4xl font-black text-white mt-2">
              {currentSvi} <span className="text-xs text-slate-400 font-mono">/ 100</span>
            </div>
            <div className="mt-3">
              <RegionBadge region={currentRegion} size="sm" />
            </div>
          </div>
        </div>

        {/* Framing Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          <p className="leading-relaxed">
            "Your latest screening result is different from your previous result."
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">
            ⚠️ Note: SVI reflects self-reported stress indicators. A lower score does not medically certify symptom relief, nor does a higher score diagnose clinical deterioration.
          </span>
        </div>
      </div>

      {/* 3 Core Decision Pathways: CONTINUE / CHANGE / ESCALATE */}
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Recommended Next Steps
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Pathway 1: CONTINUE */}
          <div
            onClick={onContinueSupport}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Sun className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">CONTINUE SUPPORT</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Maintain your current care routine, continue 4-7-8 breathing exercises, and retain anonymous peer access.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-bold text-emerald-400 flex items-center justify-between">
              <span>Keep Current Plan</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Pathway 2: CHANGE */}
          <div
            onClick={onChangeSupport}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">CHANGE SUPPORT</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Switch intervention modes: try 5-4-3-2-1 sensory grounding, or switch between text and voice peer matching.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-bold text-amber-400 flex items-center justify-between">
              <span>Explore New Mode</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Pathway 3: ESCALATE */}
          <div
            onClick={onEscalateProfessional}
            className="p-6 rounded-3xl bg-slate-900/80 border border-rose-500/30 hover:border-rose-500/60 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ring-1 ring-rose-500/20"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">ESCALATE TO PRO</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Connect promptly with a certified clinical psychologist, psychiatrist, or Tele-MANAS government counselor.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-bold text-rose-400 flex items-center justify-between">
              <span>View Providers</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-center">
        <button
          onClick={onTakeNewAssessment}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-indigo-400" />
          <span>Conduct Fresh AI Voice Conversation</span>
        </button>
      </div>
    </div>
  );
};
