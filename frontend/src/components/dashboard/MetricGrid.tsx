import React from 'react';
import { DashboardStats } from '../../types';
import {
  FileText,
  Clock,
  CheckCircle2,
  Copy,
  AlertTriangle,
  Flame,
} from 'lucide-react';

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
      subtext: 'Active dataset export',
      icon: FileText,
      color: 'text-cyan-400',
      accentBorder: 'hover:border-cyan-400/50',
      action: () => onFilterClick && onFilterClick('clear', ''),
    },
    {
      id: 'unprocessed',
      label: 'UNPROCESSED',
      value: stats.unprocessedCount,
      subtext: 'Awaiting triage',
      icon: Clock,
      color: 'text-slate-300',
      accentBorder: 'hover:border-slate-400/50',
      action: () => onFilterClick && onFilterClick('processingStatus', 'UNPROCESSED'),
    },
    {
      id: 'processed',
      label: 'AI PROCESSED',
      value: stats.processedCount,
      subtext: 'Structured & routed',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      accentBorder: 'hover:border-emerald-400/50',
      action: () => onFilterClick && onFilterClick('processingStatus', 'PROCESSED'),
    },
    {
      id: 'duplicates',
      label: 'POSSIBLE DUPLICATES',
      value: stats.possibleDuplicatesCount,
      subtext: 'Cluster matched',
      icon: Copy,
      color: 'text-indigo-400',
      accentBorder: 'hover:border-indigo-400/50',
      action: () => onFilterClick && onFilterClick('duplicateStatus', 'POSSIBLE_DUPLICATE'),
    },
    {
      id: 'review',
      label: 'HUMAN REVIEW',
      value: stats.requiresHumanReviewCount,
      subtext: 'Operator decision required',
      icon: AlertTriangle,
      color: 'text-amber-400',
      accentBorder: 'hover:border-amber-400/50',
      alert: true,
      action: () => onFilterClick && onFilterClick('reviewStatus', 'REQUIRES_HUMAN_REVIEW'),
    },
    {
      id: 'critical',
      label: 'HIGH / CRITICAL',
      value: stats.criticalOrHighUrgencyCount,
      subtext: `${stats.criticalCount} Critical, ${stats.highCount} High priority`,
      icon: Flame,
      color: 'text-rose-400',
      accentBorder: 'hover:border-rose-400/50',
      alert: true,
      action: () => onFilterClick && onFilterClick('urgency', 'CRITICAL'),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            onClick={c.action}
            className={`dual-card p-4 rounded-xl border border-white/10 flex flex-col justify-between cursor-pointer transition-all ${c.accentBorder} shadow-lg`}
          >
            <div>
              {/* Card Header: Label & Icon aligned */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {c.label}
                </span>
                <Icon className={`w-4 h-4 ${c.color} flex-shrink-0`} />
              </div>

              {/* Crisp White KPI */}
              <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                {c.value}
              </div>
            </div>

            {/* Subtext */}
            <p className="text-[11px] font-medium text-slate-400 mt-2.5 pt-2 border-t border-white/5 truncate">
              {c.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
