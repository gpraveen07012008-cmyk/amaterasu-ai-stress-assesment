import React, { useState } from 'react';
import { 
  Star, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Heart, 
  ArrowRight, 
  RefreshCw 
} from 'lucide-react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface FeedbackProps {
  user: UserProfile;
  peerAnonymousId?: string;
  isVoiceCallFeedback?: boolean;
  onFeedbackSubmitted: () => void;
  onNavigateToReassessment: () => void;
  onNavigateToDashboard: () => void;
}

export const Feedback: React.FC<FeedbackProps> = ({
  user,
  peerAnonymousId = 'User_7392',
  isVoiceCallFeedback = false,
  onFeedbackSubmitted,
  onNavigateToReassessment,
  onNavigateToDashboard
}) => {
  const [rating, setRating] = useState(5);
  const [wasRespectful, setWasRespectful] = useState(true);
  const [feltSupported, setFeltSupported] = useState(true);
  const [wouldTalkAgain, setWouldTalkAgain] = useState(true);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [earnedCredits, setEarnedCredits] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authService.addCredits(10);
    setEarnedCredits(10);
    setSubmitted(true);
    onFeedbackSubmitted();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        
        {!submitted ? (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Session Feedback</h2>
              <p className="text-xs text-slate-400 mt-1">
                Help us maintain community warmth. Submitting feedback awards <b>+10 Support Credits</b>!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div className="text-center">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  How helpful was this conversation?
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700 hover:text-slate-500'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs text-amber-400 font-bold block mt-1">
                  {rating === 5 && 'Extremely Helpful & Grounding'}
                  {rating === 4 && 'Very Supportive'}
                  {rating === 3 && 'Somewhat Helpful'}
                  {rating <= 2 && 'Needs Improvement'}
                </span>
              </div>

              {/* Yes/No Check Questions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="text-slate-300">Was the other person respectful and courteous?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWasRespectful(true)}
                      className={`px-3 py-1 rounded-xl font-bold transition-all ${
                        wasRespectful ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setWasRespectful(false)}
                      className={`px-3 py-1 rounded-xl font-bold transition-all ${
                        !wasRespectful ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="text-slate-300">Did you feel emotionally heard or supported?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFeltSupported(true)}
                      className={`px-3 py-1 rounded-xl font-bold transition-all ${
                        feltSupported ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeltSupported(false)}
                      className={`px-3 py-1 rounded-xl font-bold transition-all ${
                        !feltSupported ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="text-slate-300">Would you communicate with this person again?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWouldTalkAgain(true)}
                      className={`px-3 py-1 rounded-xl font-bold transition-all ${
                        wouldTalkAgain ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setWouldTalkAgain(false)}
                      className={`px-3 py-1 rounded-xl font-bold transition-all ${
                        !wouldTalkAgain ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional comments */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Optional Comments / Observations
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  placeholder="Share any thoughts on what went well or how the exchange felt..."
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>SUBMIT FEEDBACK & CLAIM +10 CREDITS</span>
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-400 text-slate-950 mx-auto flex items-center justify-center shadow-2xl shadow-amber-500/40">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Reward Added
              </span>
              <h2 className="text-2xl font-black text-white mt-1">Thank you for your feedback!</h2>
              <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto">
                +10 Support Credits have been deposited to your account. Your new balance is{' '}
                <b className="text-amber-400">{user.credits} / 100 Credits</b>.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
              {!isVoiceCallFeedback && (
                <button
                  onClick={onNavigateToReassessment}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reassess How I'm Feeling</span>
                </button>
              )}

              <button
                onClick={onNavigateToDashboard}
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
