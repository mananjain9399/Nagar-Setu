import React from 'react';
import {
  Sparkles,
  ArrowDown,
  ListFilter,
  Cpu,
  FileSpreadsheet,
  Target,
  ShieldCheck,
  Building2,
  Clock,
  Layers,
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
  onScrollToAnalytics,
}) => {
  // Determine greeting by time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="matte-card p-6 sm:p-8 mb-8 border border-slate-200/90 bg-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Welcome Area */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              Bhopal Municipal Corporation • Zone HQ
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Live Operations Console
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {greeting}, Officer 👋
          </h2>

          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Welcome to <strong className="text-slate-900 font-semibold">Nagar Setu (नगर सेतु)</strong>. The intelligent civic bridge is actively monitoring complaints across CM Helpline 181, municipal app, and social feeds for Bhopal's 85 wards.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Dataset Active:</span>
              <strong className="text-slate-900 font-mono font-bold">
                {stats.totalComplaints} Complaints
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-slate-600">Requires Review:</span>
              <strong className="text-slate-900 font-mono font-bold">
                {stats.requiresHumanReviewCount} Items
              </strong>
            </div>

            {qualityScore !== undefined && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-slate-600">Data Quality:</span>
                <strong className="text-slate-900 font-mono font-bold">
                  {qualityScore}% Clean
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Right Quick Hub Cards */}
        <div className="grid grid-cols-2 gap-2.5 sm:w-80 flex-shrink-0">
          <button
            onClick={() => onNavigateTab('queue')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 group-hover:text-blue-600 mb-1">
              <ListFilter className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold text-slate-500">QUEUE</span>
            </div>
            <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900">
              Complaint Queue
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats.unprocessedCount} unrouted
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('ai-pipeline')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 group-hover:text-blue-600 mb-1">
              <Cpu className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold text-slate-500">AI</span>
            </div>
            <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900">
              7-Stage Engine
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Intelligent triage
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('digest')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 group-hover:text-blue-600 mb-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold text-slate-500">REPORT</span>
            </div>
            <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900">
              Weekly Digest
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Zone summaries
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('evaluation')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 group-hover:text-blue-600 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold text-slate-500">BENCHMARK</span>
            </div>
            <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900">
              Evaluation
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              90% accuracy
            </div>
          </button>
        </div>
      </div>

      {/* Scroll Down Invitation */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Scroll down to inspect live operational metrics, department loads & ward distributions</span>
        <button
          onClick={onScrollToAnalytics}
          className="flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 transition-colors"
        >
          <span>View Analytics</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </button>
      </div>
    </div>
  );
};
