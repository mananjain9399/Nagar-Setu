import React from 'react';
import {
  LayoutDashboard,
  ListFilter,
  Layers,
  MapPin,
  CheckCheck,
  UploadCloud,
  ShieldAlert,
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
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Strict Synthetic Data Notice Banner */}
      <div className="bg-amber-950/80 border-b border-amber-800/60 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="font-semibold uppercase tracking-wider">
            Operator Console Notice:
          </span>
          <span className="text-amber-200">
            Operating on anonymised export records with synthetic test dataset. No live connection or write access to live municipal/CM Helpline systems.
          </span>
        </div>
        <div className="flex items-center gap-2">
          {qualityScore !== undefined && (
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 font-mono text-[11px] font-semibold border border-emerald-700/50">
              DATA QUALITY: {qualityScore}%
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-amber-900/60 font-mono text-[11px] font-semibold border border-amber-700/50">
            DATASET: SYNTHETIC-DEV ({totalComplaints} items)
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Municipal Insignia & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-sky-950 border border-sky-600/40 flex items-center justify-center font-bold text-sky-400 text-lg shadow-inner">
              BMC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-100 tracking-tight leading-none">
                  Bhopal Civic Complaint Intelligence Engine
                </h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  FULL SUITE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Zone Operations, Multimodal AI, Explainable Routing & Weekly Digest
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 overflow-x-auto">
              {/* 1. Dashboard */}
              <button
                onClick={() => onTabChange('dashboard')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              {/* 2. Complaint Queue */}
              <button
                onClick={() => onTabChange('queue')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'queue'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Queue</span>
                {pendingReviewCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/50">
                    {pendingReviewCount}
                  </span>
                )}
              </button>

              {/* 3. AI Pipeline Engine */}
              <button
                onClick={() => onTabChange('ai-pipeline')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'ai-pipeline'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span>AI Engine</span>
              </button>

              {/* 4. Weekly Digest */}
              <button
                onClick={() => onTabChange('digest')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'digest'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Weekly Digest</span>
              </button>

              {/* 5. Evaluation Benchmark */}
              <button
                onClick={() => onTabChange('evaluation')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'evaluation'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Benchmark</span>
              </button>

              {/* 6. Before / After Comparison */}
              <button
                onClick={() => onTabChange('comparison')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'comparison'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Before/After</span>
              </button>

              {/* 7. Taxonomy */}
              <button
                onClick={() => onTabChange('taxonomy')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'taxonomy'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Taxonomy</span>
              </button>

              {/* 8. Gazetteer */}
              <button
                onClick={() => onTabChange('gazetteer')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'gazetteer'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Gazetteer</span>
              </button>

              {/* 9. Data Quality */}
              <button
                onClick={() => onTabChange('quality')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'quality'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Quality</span>
              </button>

              {/* 10. Ingestion */}
              <button
                onClick={() => onTabChange('import')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'import'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
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
