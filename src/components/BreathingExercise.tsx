import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';

export const BreathingExercise: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // 4-7-8 Breathing Technique: Inhale 4s, Hold 7s, Exhale 8s
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (phase === 'Inhale') {
              setPhase('Hold');
              return 7;
            } else if (phase === 'Hold') {
              setPhase('Exhale');
              return 8;
            } else {
              setPhase('Inhale');
              setCyclesCompleted((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase]);

  const handleReset = () => {
    setIsActive(false);
    setPhase('Inhale');
    setTimeLeft(4);
  };

  return (
    <div className="bg-slate-900/90 border border-indigo-500/20 rounded-2xl p-6 text-center relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h4 className="text-sm font-semibold text-slate-200">Parasympathetic 4-7-8 Breathing</h4>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          title={soundEnabled ? 'Mute guidance' : 'Enable calming tone'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
        Gently calm your autonomic nervous system by pacing inhalation, breath retention, and extended exhalation.
      </p>

      {/* Visual Animated Breathing Sphere */}
      <div className="relative w-48 h-48 mx-auto my-4 flex items-center justify-center">
        {/* Outer aura ring */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-1000 ${
            phase === 'Inhale'
              ? 'scale-110 bg-indigo-500/20 blur-xl'
              : phase === 'Hold'
              ? 'scale-125 bg-purple-500/30 blur-2xl'
              : 'scale-90 bg-emerald-500/15 blur-lg'
          }`}
        />

        {/* Dynamic expanding/contracting circle */}
        <div
          className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-1000 border-2 ${
            phase === 'Inhale'
              ? 'scale-110 bg-gradient-to-tr from-indigo-600/40 to-cyan-500/40 border-cyan-400 shadow-lg shadow-cyan-500/30'
              : phase === 'Hold'
              ? 'scale-120 bg-gradient-to-tr from-purple-600/50 to-indigo-500/50 border-purple-400 shadow-xl shadow-purple-500/40'
              : 'scale-90 bg-gradient-to-tr from-emerald-600/30 to-teal-500/30 border-emerald-400 shadow-md shadow-emerald-500/20'
          }`}
        >
          <span className="text-xs uppercase tracking-widest font-bold text-slate-200">{phase}</span>
          <span className="text-3xl font-extrabold text-white font-mono mt-1">{timeLeft}s</span>
        </div>
      </div>

      {/* Stats and Controls */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
            isActive
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
          }`}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isActive ? 'Pause' : 'Start Breathing'}
        </button>

        <button
          onClick={handleReset}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 text-xs text-slate-400 font-mono">
        Completed Cycles: <span className="text-indigo-400 font-bold">{cyclesCompleted}</span>
      </div>
    </div>
  );
};
