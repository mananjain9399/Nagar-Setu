import React from 'react';
import {
  ListFilter,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { DashboardStats } from '../../types';

interface GreetingHeroProps {
  stats: DashboardStats['summary'];
  qualityScore?: number;
  onNavigateTab: (tab: any) => void;
  onScrollToAnalytics: () => void;
}

export const GreetingHero: React.FC<GreetingHeroProps> = ({
  stats,
  qualityScore,
  onNavigateTab,
}) => {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const criticalAndHigh =
    stats.criticalOrHighUrgencyCount ??
    (stats.criticalCount || 0) + (stats.highCount || 0);

  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Command Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Bhopal Municipal Corporation • Zone HQ
            </span>
            <span className="text-xs text-slate-400 font-mono">
              COMMAND CONSOLE
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {greeting}, Officer
          </h2>

          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Nagar Setu is monitoring civic complaints across CM Helpline 181, municipal channels and social feeds for automated triage and routing.
          </p>

          {/* Compact Operational Indicators */}
          <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-100">
            {/* Indicator 1: Total */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="text-slate-600">Total:</span>
              <strong className="font-mono font-bold text-slate-900">{stats.totalComplaints} Complaints</strong>
            </div>

            {/* Indicator 2: AI Processed */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-800">AI Processed:</span>
              <strong className="font-mono font-bold text-emerald-900">{stats.processedCount}</strong>
            </div>

            {/* Indicator 3: Human Review */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-amber-800">Human Review:</span>
              <strong className="font-mono font-bold text-amber-900">{stats.requiresHumanReviewCount}</strong>
            </div>

            {/* Indicator 4: Unprocessed */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600">Unprocessed:</span>
              <strong className="font-mono font-bold text-slate-800">{stats.unprocessedCount}</strong>
            </div>

            {/* Indicator 5: High / Critical */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-rose-800">High / Critical:</span>
              <strong className="font-mono font-bold text-rose-900">{criticalAndHigh}</strong>
            </div>
          </div>
        </div>

        {/* Right Quick Action Links */}
        <div className="flex sm:flex-col gap-2 flex-shrink-0 lg:border-l lg:border-slate-100 lg:pl-5">
          <button
            onClick={() => onNavigateTab('queue')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-between gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5" />
              <span>Open Triage Queue</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigateTab('ai-pipeline')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded border border-slate-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Engine Workspace</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
