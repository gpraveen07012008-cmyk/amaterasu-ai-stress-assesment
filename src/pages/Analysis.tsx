import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  HeartPulse, 
  ShieldCheck, 
  MessageSquare, 
  PhoneCall, 
  RefreshCw, 
  Award, 
  CheckCircle, 
  Activity, 
  Volume2, 
  Share2 
} from 'lucide-react';
import { AssessmentResult, UserProfile, SupportRegion } from '../types';
import { SVIChart } from '../components/SVIChart';
import { RegionBadge } from '../components/RegionBadge';

interface AnalysisProps {
  assessment: AssessmentResult;
  user: UserProfile;
  onNavigate: (path: string) => void;
  onStartReassessment: () => void;
}

export const Analysis: React.FC<AnalysisProps> = ({
  assessment,
  user,
  onNavigate,
  onStartReassessment
}) => {
  const isGreen = assessment.supportRegion === 'GREEN';
  const isOrange = assessment.supportRegion === 'ORANGE';
  const isRed = assessment.supportRegion === 'RED';

  const indicatorBadgeColor = (val: 'Low' | 'Moderate' | 'High') => {
    switch (val) {
      case 'Low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Moderate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Screening Completed
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              {new Date(assessment.timestamp).toLocaleDateString([], {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            YOUR SUPPORT ASSESSMENT
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            AI-assisted evaluation based on self-reported stress, emotional trajectory, and social comfort.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <RegionBadge region={assessment.supportRegion} size="lg" />
        </div>
      </div>

      {/* Main SVI Gauge Card */}
      <SVIChart
        score={assessment.sviScore}
        region={assessment.supportRegion}
        breakdown={{
          emotional: Math.round(assessment.sviScore * 0.3),
          stress: Math.round(assessment.sviScore * 0.3),
          concern: Math.round(assessment.sviScore * 0.2),
          social: Math.round(assessment.sviScore * 0.2),
          speechModifier: 0
        }}
      />

      {/* Key Findings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Main Concern Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Identified Primary Concern
          </div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-indigo-200 to-white">
            {assessment.mainConcern}
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Your reflections emphasize stressors tied to {assessment.mainConcern.toLowerCase()}.
          </p>

          {assessment.secondaryConcerns.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Secondary Contributing Themes:
              </span>
              <div className="flex flex-wrap gap-2">
                {assessment.secondaryConcerns.map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Emotion Indicators Matrix */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Observed Distress Indicators
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {Object.entries(assessment.emotionalIndicators).map(([key, val]) => (
              <div
                key={key}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800"
              >
                <span className="capitalize text-slate-300">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${indicatorBadgeColor(val)}`}>
                  {val}
                </span>
              </div>
            ))}
          </div>

          {assessment.speechSignals && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Speech cadence: {assessment.speechSignals.speechRate} pace • {assessment.speechSignals.pauses} pauses</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">(Supporting signal)</span>
            </div>
          )}
        </div>
      </div>

      {/* Personalized AI Suggestions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Recommended Personalized Interventions</h3>
        </div>

        <div className="space-y-3">
          {assessment.personalizedSuggestions.map((sug, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs sm:text-sm text-slate-200"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                {i + 1}
              </div>
              <p className="leading-relaxed">{sug}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Available Care Pathways based on Region */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
          Suitable Care Pathways for Your Priority Level
        </h3>

        <div className="max-w-xl">
          {/* Option 1: Activities (All regions) */}
          {isGreen && <div
            onClick={() => onNavigate('personalized-support')}
            className="p-5 rounded-3xl border transition-all cursor-pointer hover:scale-[1.02] flex flex-col justify-between bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/30"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span>Recommended for GREEN</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">Personalized Activities</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                4-7-8 breathing exercises, study chunking, and mindful grounding tailored to your concern.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-emerald-400 flex items-center justify-between">
              <span>Open Activities</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>}

          {/* Option 2: Peer Communication (Orange & Green) */}
          {isOrange && <div
            onClick={() => onNavigate('communication')}
            className="p-5 rounded-3xl border transition-all cursor-pointer hover:scale-[1.02] flex flex-col justify-between bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/30"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                <MessageSquare className="w-4 h-4" />
                <span>Recommended for ORANGE</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">Anonymous Peer Lounge</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                15-minute moderated voice or text chat with an anonymous peer who understands your stress.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-amber-400 flex items-center justify-between">
              <span>Enter Lounge</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>}

          {/* Option 3: Professional Support (Red Priority) */}
          {isRed && <div
            onClick={() => onNavigate('professional-support')}
            className="p-5 rounded-3xl border transition-all cursor-pointer hover:scale-[1.02] flex flex-col justify-between bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/30"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-1">
                <PhoneCall className="w-4 h-4" />
                <span>{isRed ? 'Priority Action for RED' : 'Available on Demand'}</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">Professional Care & Hotlines</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Certified psychologists, psychiatrists, counselors, and 24/7 official tele-mental health services.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-rose-400 flex items-center justify-between">
              <span>Browse Providers</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={onStartReassessment}
          className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl transition-colors w-full sm:w-auto justify-center"
        >
          <RefreshCw className="w-4 h-4 text-indigo-400" />
          <span>Reassess How I'm Feeling</span>
        </button>

        <button
          onClick={() => onNavigate('feedback')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all w-full sm:w-auto justify-center"
        >
          <Award className="w-4 h-4" />
          <span>Provide Feedback (+10 Credits)</span>
        </button>
      </div>

      {/* Disclaimer */}
      <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center text-[11px] text-slate-500">
        This is a non-clinical screening result and should not be considered a medical diagnosis.
      </div>
    </div>
  );
};
