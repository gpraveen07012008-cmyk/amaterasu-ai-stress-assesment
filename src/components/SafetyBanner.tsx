import React from 'react';
import { AlertTriangle, VolumeX, ShieldAlert, Flag } from 'lucide-react';

interface SafetyBannerProps {
  warningCount: number;
  isMuted?: boolean;
  onReportClick: () => void;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({
  warningCount,
  isMuted = false,
  onReportClick
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        {isMuted ? (
          <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
            <VolumeX className="w-4 h-4" />
          </div>
        ) : warningCount > 0 ? (
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
        ) : (
          <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <ShieldAlert className="w-4 h-4" />
          </div>
        )}

        <div>
          {isMuted ? (
            <span className="text-rose-300 font-semibold">
              Muted due to safety policy: 2nd sensitive alert triggered.
            </span>
          ) : warningCount === 1 ? (
            <span className="text-amber-300 font-medium">
              Safety notice: Please ensure conversations remain supportive and respectful.
            </span>
          ) : (
            <span className="text-slate-400">
              Community Moderation: Anonymous peer support. Identity is strictly confidential.
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReportClick}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 rounded-lg transition-colors font-medium text-[11px]"
        >
          <Flag className="w-3 h-3" />
          <span>Report User</span>
        </button>
      </div>
    </div>
  );
};
