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
    <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Department Workload
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono font-medium px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
            {data.length} UNITS
          </span>
        </div>

        <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
          {data.map((d) => {
            const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
            return (
              <div
                key={d.name}
                onClick={() => onSelectDepartment(d.name === 'Unassigned / Triage Needed' ? 'UNASSIGNED' : d.name)}
                className="group cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors truncate max-w-[190px]">
                    {d.name}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-slate-400">{pct}%</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      {d.count}
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-sm transition-all duration-300"
                    style={{ width: `${Math.max(4, pct)}%` }}
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
