import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface LocalityWardProps {
  localities: Array<{ name: string; count: number }>;
  wards: Array<{ name: string; count: number }>;
  onSelectLocality: (locality: string) => void;
  onSelectWard: (ward: string) => void;
}

export const LocalityWardDistribution: React.FC<LocalityWardProps> = ({
  localities,
  wards,
  onSelectLocality,
  onSelectWard,
}) => {
  const [view, setView] = useState<'locality' | 'ward'>('locality');

  return (
    <div className="bw-card rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              {view === 'locality' ? (
                <MapPin className="w-4 h-4" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {view === 'locality' ? 'Bhopal Localities' : 'Municipal Wards'}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setView('locality')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                view === 'locality'
                  ? 'bg-white text-blue-900 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Localities ({localities.length})
            </button>
            <button
              onClick={() => setView('ward')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                view === 'ward'
                  ? 'bg-white text-blue-900 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wards ({wards.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
          {view === 'locality' ? (
            localities.map((l) => (
              <div
                key={l.name}
                onClick={() => onSelectLocality(l.name)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all group"
              >
                <span className="text-xs text-slate-700 group-hover:text-blue-900 truncate font-semibold max-w-[140px]">
                  {l.name}
                </span>
                <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs">
                  {l.count}
                </span>
              </div>
            ))
          ) : (
            wards.map((w) => (
              <div
                key={w.name}
                onClick={() => onSelectWard(w.name)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all group"
              >
                <span className="text-xs text-slate-700 group-hover:text-blue-900 truncate font-semibold max-w-[140px]">
                  {w.name}
                </span>
                <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs">
                  {w.count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
