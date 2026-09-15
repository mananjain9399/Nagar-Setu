import React from 'react';
import { DashboardStats } from '../../types';

interface MetricGridProps {
  stats: DashboardStats['summary'];
  onFilterClick?: (filterType: string, value: string) => void;
}

export const MetricGrid: React.FC<MetricGridProps> = ({ stats, onFilterClick }) => {
  const cards = [
    {
      id: 'total',
      label: 'TOTAL COMPLAINTS',
      value: stats.totalComplaints,
      subtext: 'Ingested records',
      topBorder: 'border-t-2 border-t-slate-700',
      numColor: 'text-slate-900',
      action: () => onFilterClick && onFilterClick('clear', ''),
    },
    {
      id: 'processed',
      label: 'AI PROCESSED',
      value: stats.processedCount,
      subtext: 'Triage complete',
      topBorder: 'border-t-2 border-t-emerald-600',
      numColor: 'text-emerald-700',
      action: () => onFilterClick && onFilterClick('processingStatus', 'PROCESSED'),
    },
    {
      id: 'unprocessed',
      label: 'UNPROCESSED',
      value: stats.unprocessedCount,
      subtext: 'Awaiting pipeline',
      topBorder: 'border-t-2 border-t-slate-400',
      numColor: 'text-slate-700',
      action: () => onFilterClick && onFilterClick('processingStatus', 'UNPROCESSED'),
    },
    {
      id: 'review',
      label: 'HUMAN REVIEW',
      value: stats.requiresHumanReviewCount,
      subtext: 'Operator sign-off',
      topBorder: 'border-t-2 border-t-amber-500',
      numColor: 'text-amber-700',
      action: () => onFilterClick && onFilterClick('reviewStatus', 'REQUIRES_HUMAN_REVIEW'),
    },
    {
      id: 'critical',
      label: 'HIGH / CRITICAL',
      value: stats.criticalOrHighUrgencyCount,
      subtext: 'Emergency priority',
      topBorder: 'border-t-2 border-t-rose-600',
      numColor: 'text-rose-700',
      action: () => onFilterClick && onFilterClick('urgency', 'CRITICAL'),
    },
    {
      id: 'duplicates',
      label: 'POSSIBLE DUPLICATES',
      value: stats.possibleDuplicatesCount,
      subtext: 'Cluster matched',
      topBorder: 'border-t-2 border-t-indigo-500',
      numColor: 'text-indigo-700',
      action: () => onFilterClick && onFilterClick('duplicateStatus', 'POSSIBLE_DUPLICATE'),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <div
          key={c.id}
          onClick={c.action}
          className={`bg-white border border-slate-200 ${c.topBorder} rounded-md p-3.5 flex flex-col justify-between cursor-pointer hover:border-slate-300 hover:shadow-xs transition-all`}
        >
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1">
              {c.label}
            </div>

            <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${c.numColor} tracking-tight`}>
              {c.value}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-sans mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <span className="truncate">{c.subtext}</span>
            <span className="text-[10px] font-mono text-blue-600 font-medium">VIEW →</span>
          </div>
        </div>
      ))}
    </div>
  );
};
