import React, { useState } from 'react';
import { 
  History, 
  PhoneCall, 
  MessageSquare, 
  Star, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { CallHistoryItem, UserProfile } from '../types';
import { authService } from '../services/authService';

interface CallHistoryProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
  onRefreshUser: () => void;
}

export const CallHistory: React.FC<CallHistoryProps> = ({ user, onNavigate, onRefreshUser }) => {
  const [historyItems, setHistoryItems] = useState<CallHistoryItem[]>(authService.getCallHistory());
  const canFavourite = user.credits > 100;

  const handleToggleFavourite = (item: CallHistoryItem) => {
    if (!canFavourite) {
      alert('Milestone Locked: You need more than 100 credits to unlock the Favourite Previous Callers feature. You currently have ' + user.credits + ' credits.');
      return;
    }

    authService.toggleFavouriteCaller(item.anonymousUserId);
    setHistoryItems(authService.getCallHistory());
    onRefreshUser();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Communication Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Call & Peer Session History
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Logs of your past 15-minute anonymous peer text and voice exchanges.
          </p>
        </div>

        <button
          onClick={() => onNavigate('communication')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 self-start sm:self-center"
        >
          New Peer Session
        </button>
      </div>

      {/* 100 Credits Notice */}
      {!canFavourite && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Reach <b>more than 100 credits</b> to favourite supportive callers (Current: <b>{user.credits} / 100</b>).
            </span>
          </div>
          <button
            onClick={() => onNavigate('credits')}
            className="text-amber-300 hover:underline font-bold shrink-0 ml-3"
          >
            View Progress →
          </button>
        </div>
      )}

      {/* History Items List */}
      <div className="space-y-4">
        {historyItems.length > 0 ? (
          historyItems.map((item) => {
            const isVoice = item.communicationType === 'Voice';
            const isFav = user.favouriteCallers?.includes(item.anonymousUserId) || item.isFavourite;

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-sm transition-all hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isVoice
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {isVoice ? <PhoneCall className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-base">
                        {item.anonymousUserId}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                        {item.communicationType}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.date}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Duration: {item.duration}</span>
                      </span>
                    </div>

                    {item.feedbackText && (
                      <p className="text-xs text-slate-300 mt-2 italic bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                        "{item.feedbackText}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-800">
                  {/* Rating display */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= (item.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Favourite button */}
                  <button
                    onClick={() => handleToggleFavourite(item)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isFav
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title={
                      canFavourite
                        ? isFav
                          ? 'Remove favourite'
                          : 'Favourite this caller'
                        : 'Requires more than 100 credits'
                    }
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span>{isFav ? 'Favourited' : 'Favourite'}</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            No previous peer sessions recorded yet. Enter the Anonymous Peer Lounge to connect.
          </div>
        )}
      </div>
    </div>
  );
};
