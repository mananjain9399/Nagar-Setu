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
  Building2,
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
  const navItems: { id: ActiveTabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'queue', label: 'Queue', icon: ListFilter, badge: pendingReviewCount },
    { id: 'ai-pipeline', label: 'AI Engine', icon: Cpu },
    { id: 'digest', label: 'Digest', icon: FileSpreadsheet },
    { id: 'evaluation', label: 'Benchmark', icon: Target },
    { id: 'comparison', label: 'Before/After', icon: Sparkles },
    { id: 'taxonomy', label: 'Taxonomy', icon: Layers },
    { id: 'gazetteer', label: 'Gazetteer', icon: MapPin },
    { id: 'quality', label: 'Quality', icon: CheckCheck },
    { id: 'import', label: 'Ingest', icon: UploadCloud },
  ];

  return (
    <header className="bg-[#0b1329] border-b border-[#1b2640] sticky top-0 z-40 text-slate-100 shadow-sm">
      {/* Top Operations Meta Strip */}
      <div className="bg-[#070c1a] border-b border-[#152037] px-4 sm:px-6 lg:px-8 py-1 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-300 font-semibold uppercase tracking-wider">
            BHOPAL MUNICIPAL CORPORATION
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Zone Command Center • Live Grievance Ingestion
          </span>
        </div>

        <div className="flex items-center gap-3">
          {qualityScore !== undefined && (
            <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              <ShieldCheck className="w-3 h-3" />
              <span>HEALTH: {qualityScore}%</span>
            </div>
          )}
          <div className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            <span>TOTAL: </span>
            <span className="text-white font-bold">{totalComplaints}</span>
          </div>
          {pendingReviewCount > 0 && (
            <div className="text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              <span>REVIEW: </span>
              <span className="text-amber-200 font-bold">{pendingReviewCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Bar: Brand + High Density Nav Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-white uppercase font-heading">
                  Nagar Setu
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  (नगर सेतु)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Bhopal Municipal Zone Operations
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Light pill active state matching reference design) */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded transition-all cursor-pointer select-none whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
                        isActive
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
