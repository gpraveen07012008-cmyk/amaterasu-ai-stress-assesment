import React from 'react';
import { SupportRegion } from '../types';
import { getRegionColor } from '../utils/scoring';

interface RegionBadgeProps {
  region: SupportRegion;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const RegionBadge: React.FC<RegionBadgeProps> = ({ region, size = 'md', showSubtitle = false }) => {
  const styling = getRegionColor(region);

  const regionNames: Record<SupportRegion, string> = {
    GREEN: 'GREEN — LOW PRIORITY',
    ORANGE: 'ORANGE — MODERATE PRIORITY',
    RED: 'RED — HIGH SUPPORT PRIORITY',
  };

  const regionSubtitles: Record<SupportRegion, string> = {
    GREEN: 'Low observed distress indicators',
    ORANGE: 'Moderate distress indicators • Connection recommended',
    RED: 'Prompt professional or human care recommended',
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3.5 py-1.5',
    lg: 'text-base px-5 py-2.5',
  };

  return (
    <div className="inline-flex flex-col items-start">
      <div
        className={`inline-flex items-center gap-2 rounded-full border font-semibold tracking-wide ${sizeClasses[size]} ${styling.bg} ${styling.border} ${styling.text}`}
      >
        <span className={`w-2.5 h-2.5 rounded-full ${styling.bar} animate-pulse`} />
        <span>{regionNames[region]}</span>
      </div>
      {showSubtitle && (
        <span className="text-xs text-slate-400 mt-1 pl-1">
          {regionSubtitles[region]}
        </span>
      )}
    </div>
  );
};
