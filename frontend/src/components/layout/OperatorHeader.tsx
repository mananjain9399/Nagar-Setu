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
  Radio,
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
    <header className="glass-panel sticky top-0 z-30 shadow-lg border-b border-slate-800/80">
      {/* Animated Top Civic Stream Ribbon */}
      <div className="h-0.5 w-full bridge-stream" />

      {/* Notice Banner - Calm Teal & Slate */}
      <div className="bg-[#0b1329]/90 border-b border-teal-900/30 px-4 py-1.5 flex items-center justify-between text-xs text-teal-300">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span className="font-semibold tracking-wide text-teal-200">
            Nagar Setu Operational Stream:
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Anonymised municipal grievance bridge for Bhopal Zone Operations. Read-only triage environment.
          </span>
        </div>
        <div className="flex items-center gap-2">
          {qualityScore !== undefined && (
            <span className="px-2 py-0.5 rounded bg-teal-950/70 text-teal-300 font-mono text-[11px] font-semibold border border-teal-700/40 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-400" /> QUALITY {qualityScore}%
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 font-mono text-[11px] font-semibold border border-slate-700/50">
            {totalComplaints} RECORDS
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Nagar Setu Insignia & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 p-0.5 shadow-md shadow-teal-500/10">
                <div className="w-full h-full bg-[#091122] rounded-[10px] flex items-center justify-center font-bold text-teal-400 text-lg">
                  <svg className="w-6 h-6 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" />
                    <path d="M2 19h20" />
                    <path d="M8 19v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
                    <path d="M12 4v3" />
                  </svg>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500 border-2 border-[#091122]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-100 tracking-tight leading-none bg-gradient-to-r from-teal-200 via-sky-200 to-indigo-200 bg-clip-text text-transparent">
                  Nagar Setu (नगर सेतु)
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-teal-950 text-teal-300 border border-teal-800/60 shadow-sm">
                  CIVIC BRIDGE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Bhopal Municipal Grievance Intelligence & Explainable Routing
              </p>
            </div>
          </div>

          {/* Navigation Controls with Calm Styling */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 backdrop-blur-md overflow-x-auto">
              {/* 1. Dashboard */}
              <button
                onClick={() => onTabChange('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              {/* 2. Complaint Queue */}
              <button
                onClick={() => onTabChange('queue')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'queue'
                    ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Queue</span>
                {pendingReviewCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                    {pendingReviewCount}
                  </span>
                )}
              </button>

              {/* 3. AI Pipeline Engine */}
              <button
                onClick={() => onTabChange('ai-pipeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'ai-pipeline'
                    ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-teal-400" />
                <span>AI Engine</span>
              </button>

              {/* 4. Weekly Digest */}
              <button
                onClick={() => onTabChange('digest')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'digest'
                    ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Weekly Digest</span>
              </button>

              {/* 5. Evaluation Benchmark */}
              <button
                onClick={() => onTabChange('evaluation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'evaluation'
                    ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Benchmark</span>
              </button>

              {/* 6. Before / After Comparison */}
              <button
                onClick={() => onTabChange('comparison')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'comparison'
                    ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Before/After</span>
              </button>

              {/* 7. Taxonomy */}
              <button
                onClick={() => onTabChange('taxonomy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'taxonomy'
                    ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Taxonomy</span>
              </button>

              {/* 8. Gazetteer */}
              <button
                onClick={() => onTabChange('gazetteer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'gazetteer'
                    ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Gazetteer</span>
              </button>

              {/* 9. Data Quality */}
              <button
                onClick={() => onTabChange('quality')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'quality'
                    ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Quality</span>
              </button>

              {/* 10. Ingestion */}
              <button
                onClick={() => onTabChange('import')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'import'
                    ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
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
