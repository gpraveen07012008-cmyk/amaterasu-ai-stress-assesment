import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare } from 'lucide-react';
import { SpeechStatus } from '../services/speechService';

interface VoiceAssistantOrbProps {
  status: SpeechStatus;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  isTextMode: boolean;
  onToggleListening: () => void;
  onStopSpeaking: () => void;
  onToggleTextMode: () => void;
}

export const VoiceAssistantOrb: React.FC<VoiceAssistantOrbProps> = ({
  status,
  isListening,
  isSpeaking,
  transcript,
  isTextMode,
  onToggleListening,
  onStopSpeaking,
  onToggleTextMode
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      {/* Visual Glowing Sphere */}
      <div className="relative w-44 h-44 flex items-center justify-center my-4">
        {/* Glow halo */}
        <div
          className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 ${
            isSpeaking
              ? 'bg-purple-600/40 scale-125'
              : isListening
              ? 'bg-cyan-500/40 scale-120'
              : 'bg-indigo-600/20 scale-100'
          }`}
        />

        {/* Outer orbital rings */}
        <div
          className={`absolute inset-2 rounded-full border border-indigo-500/30 transition-all duration-1000 ${
            isSpeaking ? 'animate-spin-slow' : isListening ? 'scale-105 border-cyan-400/40' : ''
          }`}
        />

        {/* Central Orb */}
        <div
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-500 shadow-2xl relative z-10 ${
            isSpeaking
              ? 'bg-gradient-to-tr from-purple-700 via-indigo-600 to-amber-400 border-amber-300 shadow-purple-500/50 scale-105 animate-pulse-glow'
              : isListening
              ? 'bg-gradient-to-tr from-cyan-600 via-indigo-600 to-blue-500 border-cyan-300 shadow-cyan-500/50 scale-105'
              : 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 border-indigo-500/40 shadow-indigo-900/40'
          }`}
        >
          {isSpeaking ? (
            <Volume2 className="w-10 h-10 text-white animate-pulse" />
          ) : isListening ? (
            <Mic className="w-10 h-10 text-white animate-bounce" />
          ) : (
            <Sparkles className="w-9 h-9 text-indigo-300" />
          )}

          {/* Equalizer waves */}
          {(isListening || isSpeaking) && (
            <div className="flex items-center gap-1 mt-2">
              <span className="w-1 h-3 bg-white/80 rounded-full animate-pulse" />
              <span className="w-1 h-5 bg-white rounded-full animate-pulse delay-75" />
              <span className="w-1 h-4 bg-white/90 rounded-full animate-pulse delay-150" />
              <span className="w-1 h-2 bg-white/70 rounded-full animate-pulse delay-100" />
            </div>
          )}
        </div>
      </div>

      {/* State badge */}
      <div className="mt-2 mb-3">
        <span
          className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${
            isSpeaking
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : isListening
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
              : 'bg-slate-800/80 text-slate-300 border-slate-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isSpeaking ? 'bg-purple-400' : isListening ? 'bg-cyan-400' : 'bg-slate-400'
            }`}
          />
          {isSpeaking
            ? 'AI Speaking...'
            : isListening
            ? 'Listening... Speak naturally'
            : status === 'processing'
            ? 'Processing your response...'
            : 'Ready to listen'}
        </span>
      </div>

      {/* Real-time transcript display when listening */}
      {isListening && transcript && (
        <div className="max-w-md w-full bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-3 text-xs text-cyan-200 mb-4 font-mono animate-in fade-in">
          "{transcript}"
        </div>
      )}

      {/* Voice Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
        <button
          onClick={onToggleListening}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Stop Speaking</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>🎙 Start Speaking</span>
            </>
          )}
        </button>

        {isSpeaking && (
          <button
            onClick={onStopSpeaking}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Pause Voice</span>
          </button>
        )}

        <button
          onClick={onToggleTextMode}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            isTextMode
              ? 'bg-indigo-950/60 border-indigo-400/50 text-indigo-300'
              : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{isTextMode ? 'Voice View' : 'Text Input Fallback'}</span>
        </button>
      </div>
    </div>
  );
};
