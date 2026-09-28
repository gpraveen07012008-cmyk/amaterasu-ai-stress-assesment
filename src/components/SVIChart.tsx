import React from 'react';
import { SupportRegion } from '../types';
import { getRegionColor } from '../utils/scoring';

interface SVIChartProps {
  score: number;
  region: SupportRegion;
  breakdown?: {
    emotional: number;
    stress: number;
    concern: number;
    social: number;
    speechModifier?: number;
  };
}

export const SVIChart: React.FC<SVIChartProps> = ({ score, region, breakdown }) => {
  const styling = getRegionColor(region);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
      {/* Background glow matching the region */}
      <div
        className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
          region === 'GREEN'
            ? 'bg-emerald-500'
            : region === 'ORANGE'
            ? 'bg-amber-500'
            : 'bg-rose-500'
        }`}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Circular gauge representation */}
        <div className="relative flex items-center justify-center w-36 h-36">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-slate-800"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Value circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              className={styling.text}
              strokeWidth="9"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * score) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-white tracking-tight">{score}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">/ 100 SVI</span>
          </div>
        </div>

        {/* Region explanation */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Prototype Screening Metric
            </span>
          </div>
          <h3 className={`text-xl font-bold ${styling.text}`}>
            Stress Vulnerability Index
          </h3>
          <p className="text-sm text-slate-300 mt-1 max-w-md">
            {region === 'GREEN' && 'Your indicators reflect low active stress levels. Preventative self-care is suggested.'}
            {region === 'ORANGE' && 'Your indicators suggest moderate stress build-up. Peer connection & grounding exercises are beneficial.'}
            {region === 'RED' && 'Your responses reflect high acute distress. Prompt professional or crisis support is advised.'}
          </p>

          {/* Region spectrum bar */}
          <div className="mt-4">
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div className="w-[30%] bg-emerald-500/50 hover:bg-emerald-500 transition-colors" title="GREEN (0-30)" />
              <div className="w-[40%] bg-amber-500/50 hover:bg-amber-500 transition-colors" title="ORANGE (31-70)" />
              <div className="w-[30%] bg-rose-500/50 hover:bg-rose-500 transition-colors" title="RED (71-100)" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0 (Green)</span>
              <span>31 (Orange)</span>
              <span>71 (Red)</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-score Breakdown */}
      {breakdown && (
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Transparent Algorithm Breakdown
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <div className="text-slate-400">Emotional State</div>
              <div className="text-base font-bold text-indigo-300 mt-0.5">{breakdown.emotional} <span className="text-[10px] text-slate-500">/ 30 pts (30%)</span></div>
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <div className="text-slate-400">Self-Reported Stress</div>
              <div className="text-base font-bold text-indigo-300 mt-0.5">{breakdown.stress} <span className="text-[10px] text-slate-500">/ 30 pts (30%)</span></div>
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <div className="text-slate-400">Concern Severity</div>
              <div className="text-base font-bold text-indigo-300 mt-0.5">{breakdown.concern} <span className="text-[10px] text-slate-500">/ 20 pts (20%)</span></div>
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <div className="text-slate-400">Social / Withdrawal</div>
              <div className="text-base font-bold text-indigo-300 mt-0.5">{breakdown.social} <span className="text-[10px] text-slate-500">/ 20 pts (20%)</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Strict disclaimer footer */}
      <div className="mt-4 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>⚠️ Non-Clinical Disclaimer: SVI is a prototype screening indicator and is not a medical diagnosis.</span>
      </div>
    </div>
  );
};
