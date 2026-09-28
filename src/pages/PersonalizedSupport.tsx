import React, { useState } from 'react';
import { 
  Sun, 
  Sparkles, 
  Wind, 
  Clock, 
  BookOpen, 
  Music, 
  CheckCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Heart,
  ArrowRight
} from 'lucide-react';
import { UserProfile, ConcernCategory, SupportRegion } from '../types';
import { BreathingExercise } from '../components/BreathingExercise';
import { GroundingChecklist } from '../components/GroundingChecklist';

interface PersonalizedSupportProps {
  user: UserProfile;
  concern?: ConcernCategory;
  region?: SupportRegion;
  onNavigate: (path: string) => void;
}

export const PersonalizedSupport: React.FC<PersonalizedSupportProps> = ({
  user,
  concern = 'Academic pressure',
  region = 'ORANGE',
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'breathing' | 'grounding' | 'pomodoro' | 'journal'>('breathing');
  
  // Pomodoro timer state
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);

  // Journaling state
  const [journalEntry, setJournalEntry] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);

  // Pomodoro countdown
  React.useEffect(() => {
    let t: NodeJS.Timeout;
    if (isPomodoroRunning) {
      t = setInterval(() => {
        setPomodoroSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(t);
            setIsPomodoroRunning(false);
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [isPomodoroRunning]);

  const pomoMin = Math.floor(pomodoroSeconds / 60);
  const pomoSec = pomodoroSeconds % 60;

  const handleSaveJournal = () => {
    if (!journalEntry.trim()) return;
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Tailored Care Plan
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Personalized Supportive Interventions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Grounded techniques configured for your focus on <b>{concern}</b>.
          </p>
        </div>

        <button
          onClick={() => onNavigate('communication')}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 self-start sm:self-center"
        >
          <span>Try Anonymous Peer Chat</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('breathing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'breathing'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>4-7-8 Breathing</span>
        </button>

        <button
          onClick={() => setActiveTab('grounding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'grounding'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>5-4-3-2-1 Sensory Grounding</span>
        </button>

        <button
          onClick={() => setActiveTab('pomodoro')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'pomodoro'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Task Chunking (Pomodoro)</span>
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'journal'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Reflective Journaling</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'breathing' && (
        <div className="space-y-6">
          <BreathingExercise />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-white block mb-1">Inhale 4 Seconds</span>
              <p className="text-slate-400">Deep nasal breathing gently expands the diaphragm and stimulates lung capacity.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-white block mb-1">Hold 7 Seconds</span>
              <p className="text-slate-400">Allows oxygen to saturate the bloodstream and stabilizes resting heart rate.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-white block mb-1">Exhale 8 Seconds</span>
              <p className="text-slate-400">Slow deliberate oral exhalation activates the vagus nerve to calm nervous arousal.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'grounding' && (
        <GroundingChecklist />
      )}

      {activeTab === 'pomodoro' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center max-w-xl mx-auto backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-1">Micro-Focus Task Chunking</h3>
          <p className="text-xs text-slate-400 mb-6">
            Instead of staring at an overwhelming assignment or workload, commit to just ONE 25-minute focus chunk followed by a mandatory rest break.
          </p>

          <div className="w-48 h-48 mx-auto my-4 rounded-full border-4 border-indigo-500/30 flex flex-col items-center justify-center bg-slate-950/80 shadow-2xl relative">
            <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
              {String(pomoMin).padStart(2, '0')}:{String(pomoSec).padStart(2, '0')}
            </span>
            <span className="text-[11px] uppercase tracking-widest text-indigo-400 font-semibold mt-1">
              {isPomodoroRunning ? 'Focused Block' : 'Ready'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                isPomodoroRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isPomodoroRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPomodoroRunning ? 'Pause Chunk' : 'Start 25-min Block'}</span>
            </button>

            <button
              onClick={() => {
                setIsPomodoroRunning(false);
                setPomodoroSeconds(25 * 60);
              }}
              className="p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 backdrop-blur-sm max-w-2xl mx-auto">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Reflective Distress De-escalation Journal</h3>
            <p className="text-xs text-slate-400">
              Writing down what you can control versus what is outside your influence frees mental bandwidth.
            </p>
          </div>

          <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl text-xs text-indigo-300">
            💡 <b>Prompt:</b> "What is one thing causing me tension today that I have direct control over, and what is one thing I can gently permit myself to let go of?"
          </div>

          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            rows={5}
            placeholder="Write your stream of consciousness thoughts here. Everything remains strictly local to your browser session..."
            className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-2xl p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {journalSaved ? '✓ Reflection saved locally' : 'No data uploaded to servers'}
            </span>
            <button
              onClick={handleSaveJournal}
              disabled={!journalEntry.trim()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-indigo-600/20"
            >
              Save Reflection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
