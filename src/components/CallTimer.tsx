import React, { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface CallTimerProps {
  initialSeconds?: number; // default 900 (15 minutes)
  onExpire: () => void;
  isPaused?: boolean;
}

export const CallTimer: React.FC<CallTimerProps> = ({
  initialSeconds = 900,
  onExpire,
  isPaused = false
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isLowTime = secondsLeft <= 120; // 2 minutes remaining warning

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold transition-all ${
        isLowTime
          ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse'
          : 'bg-slate-800/80 border-slate-700 text-slate-200'
      }`}
    >
      {isLowTime ? (
        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-indigo-400" />
      )}
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-slate-400 font-sans">/ 15:00 max</span>
    </div>
  );
};
