import React from 'react';
import {
  LayoutDashboard,
  ListFilter,
  Layers,
  MapPin,
  CheckCheck,
  UploadCloud,
  ShieldCheck,
  Cpu,
  FileSpreadsheet,
  Target,
  Sparkles,
} from 'lucide-react';

export type ActiveTabType =
  | 'dashboard'
  | 'queue'
  | 'ai-pipeline'
  | 'digest'
  | 'evaluation'
  | 'comparison'
  | 'taxonomy'
  | 'gazetteer'
  | 'quality'
  | 'import';

interface OperatorHeaderProps {
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  pendingReviewCount: number;
  totalComplaints: number;
  qualityScore?: number;
}

export const OperatorHeader: React.FC<OperatorHeaderProps> = ({
  activeTab,
  onTabChange,
  pendingReviewCount,
  totalComplaints,
  qualityScore,
}) => {
  return (
    <header className="dual-panel sticky top-0 z-30 shadow-2xl border-b border-white/10">
      {/* Dual-Tone Shimmer Bridge Stream */}
      <div className="h-0.5 w-full bridge-stream" />

      {/* Top Meta Bar */}
      <div className="bg-[#050811]/90 border-b border-white/5 px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span className="font-bold text-white tracking-wide uppercase text-[11px]">
            Nagar Setu Live Engine
          </span>
          <span className="text-slate-400 hidden md:inline font-normal">
            • Bhopal Municipal Zone Operations Console (Read-Only Dataset)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {qualityScore !== undefined && (
            <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              QUALITY {qualityScore}%
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px] font-semibold border border-white/10">
            {totalComplaints} RECORDS
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & New Logo */}
          <div className="flex items-center gap-3.5 flex-shrink-0">
            {/* New Logo SVG: Dual-tone Geometric Bridge Emblem */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#090e1a] rounded-[10px] flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Outer Bridge Arch */}
                  <path d="M3 18C5 12 9 8 12 8C15 8 19 12 21 18" stroke="#ffffff" />
                  {/* Inner Arch */}
                  <path d="M7 18C8.5 14 10 12 12 12C14 12 15.5 14 17 18" stroke="#38bdf8" />
                  {/* Central Intelligence Node */}
                  <circle cx="12" cy="5" r="2" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="12" y1="7" x2="12" y2="12" stroke="#ffffff" strokeWidth="1.5" />
                  {/* Base Roadway */}
                  <line x1="2" y1="18" x2="22" y2="18" stroke="#ffffff" />
                </svg>
              </div>
            </div>

            {/* Title Hierarchy */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white leading-none">
                  NAGAR SETU
                </h1>
                <span className="text-xs font-semibold text-cyan-400 font-sans tracking-normal">
                  (नगर सेतु)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-white/10 text-white border border-white/20">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium leading-tight">
                Civic Complaint Intelligence & Routing Bridge
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <nav className="flex items-center gap-1 bg-[#060a14]/80 p-1 rounded-xl border border-white/10 shadow-inner">
              {/* 1. Dashboard */}
              <button
                onClick={() => onTabChange('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              {/* 2. Queue */}
              <button
                onClick={() => onTabChange('queue')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'queue'
                    ? 'bg-white text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Queue</span>
                {pendingReviewCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-black">
                    {pendingReviewCount}
                  </span>
                )}
              </button>

              {/* 3. AI Engine */}
              <button
                onClick={() => onTabChange('ai-pipeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'ai-pipeline'
                    ? 'bg-white text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Cpu className={`w-3.5 h-3.5 ${activeTab === 'ai-pipeline' ? 'text-slate-950' : 'text-cyan-400'}`} />
                <span>AI Engine</span>
              </button>

              {/* 4. Weekly Digest */}
              <button
                onClick={() => onTabChange('digest')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'digest'
                    ? 'bg-white text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileSpreadsheet className={`w-3.5 h-3.5 ${activeTab === 'digest' ? 'text-slate-950' : 'text-emerald-400'}`} />
                <span>Digest</span>
              </button>

              {/* 5. Benchmark */}
              <button
                onClick={() => onTabChange('evaluation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'evaluation'
                    ? 'bg-white text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Target className={`w-3.5 h-3.5 ${activeTab === 'evaluation' ? 'text-slate-950' : 'text-indigo-400'}`} />
                <span>Benchmark</span>
              </button>

              {/* 6. Before / After */}
              <button
                onClick={() => onTabChange('comparison')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'comparison'
                    ? 'bg-white text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'comparison' ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>Before/After</span>
              </button>

              {/* 7. Taxonomy */}
              <button
                onClick={() => onTabChange('taxonomy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'taxonomy'
                    ? 'bg-white text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Taxonomy</span>
              </button>

              {/* 8. Gazetteer */}
              <button
                onClick={() => onTabChange('gazetteer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'gazetteer'
                    ? 'bg-white text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Gazetteer</span>
              </button>

              {/* 9. Quality */}
              <button
                onClick={() => onTabChange('quality')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'quality'
                    ? 'bg-white text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Quality</span>
              </button>

              {/* 10. Import */}
              <button
                onClick={() => onTabChange('import')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'import'
                    ? 'bg-white text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Import</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
