import React from 'react';
import { Tag, ChevronRight } from 'lucide-react';

interface CategoryDistributionProps {
  data: Array<{ name: string; count: number }>;
  total: number;
  onSelectCategory: (cat: string) => void;
}

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({
  data,
  total,
  onSelectCategory,
}) => {
  return (
    <div className="bw-card rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Tag className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Complaints by Category
            </h3>
          </div>
          <span className="text-xs text-emerald-700 font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100">
            Top {data.length} Categories
          </span>
        </div>

        <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
          {data.slice(0, 10).map((c) => {
            const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
            return (
              <div
                key={c.name}
                onClick={() => onSelectCategory(c.name)}
                className="group cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors truncate max-w-[210px]">
                    {c.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px] font-medium">{pct}%</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                      {c.count}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
          {data.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">No category data available</p>
          )}
        </div>
      </div>
    </div>
  );
};
