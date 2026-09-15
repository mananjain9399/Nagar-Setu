import React from 'react';
import { Building2, ChevronRight } from 'lucide-react';

interface DepartmentDistributionProps {
  data: Array<{ name: string; count: number }>;
  total: number;
  onSelectDepartment: (dept: string) => void;
}

export const DepartmentDistribution: React.FC<DepartmentDistributionProps> = ({
  data,
  total,
  onSelectDepartment,
}) => {
  return (
    <div className="dual-card rounded-xl p-5 shadow-xl border border-white/10 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Building2 className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Complaints by Department
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10">
            {data.length} Units
          </span>
        </div>

        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {data.map((d) => {
            const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
            return (
              <div
                key={d.name}
                onClick={() => onSelectDepartment(d.name === 'Unassigned / Triage Needed' ? 'UNASSIGNED' : d.name)}
                className="group cursor-pointer p-2.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-200 group-hover:text-white transition-colors truncate max-w-[210px]">
                    {d.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px] font-medium">{pct}%</span>
                    <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-white/10 shadow-inner">
                      {d.count}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                <div className="w-full bg-slate-900/90 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(5, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
          {data.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">No department data available</p>
          )}
        </div>
      </div>
    </div>
  );
};
