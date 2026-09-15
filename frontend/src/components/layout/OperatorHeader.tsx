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
    <header className="bw-header sticky top-0 z-30 shadow-md">
      {/* Dual-Tone Blue & White Animated Stream */}
      <div className="h-0.5 w-full bridge-stream" />

      {/* Top Meta Bar */}
      <div className="bg-[#0c1e38] border-b border-white/10 px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-xs text-blue-200">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
          </span>
          <span className="font-bold text-white tracking-wide uppercase text-[11px]">
            Nagar Setu Live Engine
          </span>
          <span className="text-blue-200/80 hidden md:inline font-normal">
            • Bhopal Municipal Corporation Grievance Intelligence & Operations
          </span>
        </div>

        <div className="flex items-center gap-2">
          {qualityScore !== undefined && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-400/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              QUALITY {qualityScore}%
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono text-[11px] font-semibold border border-white/15">
            {totalComplaints} RECORDS
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Nagar Setu Logo & Title */}
          <div className="flex items-center gap-3.5 flex-shrink-0">
            {/* Clean White & Blue Geometric Bridge Emblem */}
            <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md shadow-black/20 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-blue-900"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Bridge Arch */}
                <path d="M3 18C5 12 9 8 12 8C15 8 19 12 21 18" stroke="#1e3a8a" />
                <path d="M7 18C8.5 14 10 12 12 12C14 12 15.5 14 17 18" stroke="#3b82f6" />
                <circle cx="12" cy="5" r="2" fill="#2563eb" stroke="#1e3a8a" strokeWidth="1.5" />
                <line x1="12" y1="7" x2="12" y2="12" stroke="#1e3a8a" strokeWidth="1.5" />
                <line x1="2" y1="18" x2="22" y2="18" stroke="#1e3a8a" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white leading-none">
                  NAGAR SETU
                </h1>
                <span className="text-xs font-semibold text-blue-200">
                  (नगर सेतु)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-white/15 text-white border border-white/20">
                  OPERATOR CONSOLE
                </span>
              </div>
              <p className="text-xs text-blue-200/90 mt-0.5 font-medium">
                Bhopal Civic Grievance & Intelligent Routing Bridge
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <nav className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
              {/* 1. Dashboard */}
              <button
                onClick={() => onTabChange('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'dashboard' ? 'bw-nav-active' : 'bw-nav-inactive'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              {/* 2. Queue */}
              <button
                onClick={() => onTabChange('queue')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'queue' ? 'bw-nav-active' : 'bw-nav-inactive'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Queue</span>
                {pendingReviewCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-black ${
                    activeTab === 'queue' ? 'bg-amber-500 text-white' : 'bg-amber-400 text-slate-950'
                  }`}>
                    {pendingReviewCount}
                  </span>
                )}
              </button>

              {/* 3. AI Engine */}
              <button
                onClick={() => onTabChange('ai-pipeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'ai-pipeline' ? 'bw-nav-active' : 'bw-nav-inactive'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>AI Engine</span>
              </button>

              {/* 4. Weekly Digest */}
              <button
                onClick={() => onTabChange('digest')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'digest' ? 'bw-nav-active' : 'bw-nav-inactive'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Digest</span>
              </button>

              {/* 5. Benchmark */}
              <button
                onClick={() => onTabChange('evaluation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'evaluation' ? 'bw-nav-active' : 'bw-nav-inactive'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Benchmark</span>
              </button>

              {/* 6. Before / After */}
              <button
                onClick={() => onTabChange('comparison')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'comparison' ? 'bw-nav-active' : 'bw-nav-inactive'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Before/After</span>
              </button>

              {/* 7. Taxonomy */}
              <button
                onClick={() => onTabChange('taxonomy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'taxonomy' ? 'bw-nav-active' : 'bw-nav-inactive'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Taxonomy</span>
              </button>

              {/* 8. Gazetteer */}
              <button
                onClick={() => onTabChange('gazetteer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'gazetteer' ? 'bw-nav-active' : 'bw-nav-inactive'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Gazetteer</span>
              </button>

              {/* 9. Quality */}
              <button
                onClick={() => onTabChange('quality')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'quality' ? 'bw-nav-active' : 'bw-nav-inactive'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Quality</span>
              </button>

              {/* 10. Import */}
              <button
                onClick={() => onTabChange('import')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'import' ? 'bw-nav-active' : 'bw-nav-inactive'
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
