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
  Sun,
  Moon,
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
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const OperatorHeader: React.FC<OperatorHeaderProps> = ({
  activeTab,
  onTabChange,
  pendingReviewCount,
  totalComplaints,
  qualityScore,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="matte-header sticky top-0 z-30 shadow-matte">
      {/* Top Meta Bar */}
      <div className="bg-[#0b172a] border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-bold text-slate-200 uppercase text-[11px] tracking-wide">
            Nagar Setu (नगर सेतु)
          </span>
          <span className="text-slate-400 hidden md:inline font-normal">
            • Bhopal Municipal Zone Operations & AI Grievance Bridge
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {qualityScore !== undefined && (
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 font-mono text-[11px] font-semibold border border-emerald-800/50 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              QUALITY {qualityScore}%
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px] font-medium border border-slate-700">
            {totalComplaints} RECORDS
          </span>

          {/* Theme Toggle Button in Meta Bar */}
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-[11px] font-semibold transition-colors"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Light</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-sm flex items-center justify-center">
              <svg
                className="w-7 h-7 text-[#0f1e36]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 18C5 12 9 8 12 8C15 8 19 12 21 18" stroke="#0f1e36" />
                <path d="M7 18C8.5 14 10 12 12 12C14 12 15.5 14 17 18" stroke="#3b82f6" />
                <circle cx="12" cy="5" r="2" fill="#2563eb" stroke="#0f1e36" strokeWidth="1.5" />
                <line x1="12" y1="7" x2="12" y2="12" stroke="#0f1e36" strokeWidth="1.5" />
                <line x1="2" y1="18" x2="22" y2="18" stroke="#0f1e36" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white leading-none font-heading">
                  NAGAR SETU
                </h1>
                <span className="text-xs font-semibold text-slate-300">
                  (नगर सेतु)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  OPERATOR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Civic Complaint Intelligence & Routing Bridge
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <nav className="flex items-center gap-1 bg-[#0b172a] p-1 rounded-xl border border-slate-800">
              {/* 1. Dashboard */}
              <button
                onClick={() => onTabChange('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'dashboard' ? 'matte-nav-active' : 'matte-nav-inactive'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              {/* 2. Queue */}
              <button
                onClick={() => onTabChange('queue')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'queue' ? 'matte-nav-active' : 'matte-nav-inactive'
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
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'ai-pipeline' ? 'matte-nav-active' : 'matte-nav-inactive'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>AI Engine</span>
              </button>

              {/* 4. Weekly Digest */}
              <button
                onClick={() => onTabChange('digest')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'digest' ? 'matte-nav-active' : 'matte-nav-inactive'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Digest</span>
              </button>

              {/* 5. Benchmark */}
              <button
                onClick={() => onTabChange('evaluation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'evaluation' ? 'matte-nav-active' : 'matte-nav-inactive'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Benchmark</span>
              </button>

              {/* 6. Before / After */}
              <button
                onClick={() => onTabChange('comparison')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'comparison' ? 'matte-nav-active' : 'matte-nav-inactive'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Before/After</span>
              </button>

              {/* 7. Taxonomy */}
              <button
                onClick={() => onTabChange('taxonomy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'taxonomy' ? 'matte-nav-active' : 'matte-nav-inactive'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Taxonomy</span>
              </button>

              {/* 8. Gazetteer */}
              <button
                onClick={() => onTabChange('gazetteer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'gazetteer' ? 'matte-nav-active' : 'matte-nav-inactive'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Gazetteer</span>
              </button>

              {/* 9. Quality */}
              <button
                onClick={() => onTabChange('quality')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'quality' ? 'matte-nav-active' : 'matte-nav-inactive'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Quality</span>
              </button>

              {/* 10. Import */}
              <button
                onClick={() => onTabChange('import')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'import' ? 'matte-nav-active' : 'matte-nav-inactive'
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
