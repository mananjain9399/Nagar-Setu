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
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-100">Complaints by Department</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {data.length} Departments
        </span>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          return (
            <div
              key={d.name}
              onClick={() => onSelectDepartment(d.name === 'Unassigned / Triage Needed' ? 'UNASSIGNED' : d.name)}
              className="group cursor-pointer p-2 rounded hover:bg-slate-850 transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-200 group-hover:text-sky-300 transition-colors truncate max-w-[220px]">
                  {d.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[11px]">{pct}%</span>
                  <span className="font-mono font-bold text-slate-100 bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                    {d.count}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-sky-400 transition-colors" />
                </div>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(5, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-6">No department data available</p>
        )}
      </div>
    </div>
  );
};
