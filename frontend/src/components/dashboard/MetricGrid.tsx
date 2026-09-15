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
      label: 'Total Complaints',
      value: stats.totalComplaints,
      subtext: 'In active dataset export',
      icon: FileText,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
      action: () => onFilterClick && onFilterClick('clear', ''),
    },
    {
      id: 'unprocessed',
      label: 'Unprocessed Records',
      value: stats.unprocessedCount,
      subtext: 'Awaiting initial classification',
      icon: Clock,
      color: 'text-slate-300',
      bgColor: 'bg-slate-800/80',
      borderColor: 'border-slate-700',
      action: () => onFilterClick && onFilterClick('processingStatus', 'UNPROCESSED'),
    },
    {
      id: 'processed',
      label: 'Processed Complaints',
      value: stats.processedCount,
      subtext: 'Structured & mapped',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      action: () => onFilterClick && onFilterClick('processingStatus', 'PROCESSED'),
    },
    {
      id: 'duplicates',
      label: 'Possible Duplicates',
      value: stats.possibleDuplicatesCount,
      subtext: 'Clustered within zone / time',
      icon: Copy,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      action: () => onFilterClick && onFilterClick('duplicateStatus', 'POSSIBLE_DUPLICATE'),
    },
    {
      id: 'review',
      label: 'Human Review Required',
      value: stats.requiresHumanReviewCount,
      subtext: 'Needs operator decision',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      alert: true,
      action: () => onFilterClick && onFilterClick('reviewStatus', 'REQUIRES_HUMAN_REVIEW'),
    },
    {
      id: 'critical',
      label: 'High & Critical Urgency',
      value: stats.criticalOrHighUrgencyCount,
      subtext: `${stats.criticalCount} Critical, ${stats.highCount} High priority`,
      icon: Flame,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      alert: true,
      action: () => onFilterClick && onFilterClick('urgency', 'CRITICAL'),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            onClick={c.action}
            className={`p-3.5 rounded-lg border transition-all cursor-pointer hover:scale-[1.02] ${c.bgColor} ${c.borderColor} shadow-sm`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-400 leading-tight truncate">
                {c.label}
              </span>
              <Icon className={`w-4 h-4 ${c.color} flex-shrink-0`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">
                {c.value}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {c.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
