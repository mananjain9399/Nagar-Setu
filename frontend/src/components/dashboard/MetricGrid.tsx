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
      iconBg: 'bg-blue-50 text-blue-600',
      action: () => onFilterClick && onFilterClick('clear', ''),
    },
    {
      id: 'unprocessed',
      label: 'UNPROCESSED',
      value: stats.unprocessedCount,
      subtext: 'Awaiting triage',
      icon: Clock,
      iconBg: 'bg-slate-100 text-slate-600',
      action: () => onFilterClick && onFilterClick('processingStatus', 'UNPROCESSED'),
    },
    {
      id: 'processed',
      label: 'AI PROCESSED',
      value: stats.processedCount,
      subtext: 'Structured & routed',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600',
      action: () => onFilterClick && onFilterClick('processingStatus', 'PROCESSED'),
    },
    {
      id: 'duplicates',
      label: 'POSSIBLE DUPLICATES',
      value: stats.possibleDuplicatesCount,
      subtext: 'Cluster matched',
      icon: Copy,
      iconBg: 'bg-indigo-50 text-indigo-600',
      action: () => onFilterClick && onFilterClick('duplicateStatus', 'POSSIBLE_DUPLICATE'),
    },
    {
      id: 'review',
      label: 'HUMAN REVIEW',
      value: stats.requiresHumanReviewCount,
      subtext: 'Operator decision needed',
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-amber-600',
      alert: true,
      action: () => onFilterClick && onFilterClick('reviewStatus', 'REQUIRES_HUMAN_REVIEW'),
    },
    {
      id: 'critical',
      label: 'HIGH / CRITICAL',
      value: stats.criticalOrHighUrgencyCount,
      subtext: `${stats.criticalCount} Critical, ${stats.highCount} High priority`,
      icon: Flame,
      iconBg: 'bg-rose-50 text-rose-600',
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
            className="bw-card p-4 rounded-xl flex flex-col justify-between cursor-pointer transition-all shadow-sm group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
                  {c.label}
                </span>
                <div className={`p-1.5 rounded-lg ${c.iconBg} transition-transform group-hover:scale-110`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* High Contrast Metric Value */}
              <div className="text-3xl font-black font-mono text-slate-900 tracking-tight">
                {c.value}
              </div>
            </div>

            {/* Subtext */}
            <p className="text-[11px] font-medium text-slate-500 mt-2.5 pt-2 border-t border-slate-100 truncate">
              {c.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
