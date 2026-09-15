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
    <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            {view === 'locality' ? (
              <MapPin className="w-4 h-4 text-indigo-600" />
            ) : (
              <Navigation className="w-4 h-4 text-indigo-600" />
            )}
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {view === 'locality' ? 'Bhopal Localities' : 'Municipal Wards'}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
            <button
              onClick={() => setView('locality')}
              className={`px-2 py-0.5 text-[11px] rounded font-medium transition-all cursor-pointer ${
                view === 'locality'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Localities ({localities.length})
            </button>
            <button
              onClick={() => setView('ward')}
              className={`px-2 py-0.5 text-[11px] rounded font-medium transition-all cursor-pointer ${
                view === 'ward'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wards ({wards.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[175px] overflow-y-auto pr-1">
          {view === 'locality' ? (
            localities.map((l) => (
              <div
                key={l.name}
                onClick={() => onSelectLocality(l.name)}
                className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition-all group"
              >
                <span className="text-xs text-slate-800 group-hover:text-blue-900 truncate font-medium max-w-[130px]">
                  {l.name}
                </span>
                <span className="font-mono text-[11px] font-bold text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-200 shadow-2xs">
                  {l.count}
                </span>
              </div>
            ))
          ) : (
            wards.map((w) => (
              <div
                key={w.name}
                onClick={() => onSelectWard(w.name)}
                className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition-all group"
              >
                <span className="text-xs text-slate-800 group-hover:text-blue-900 truncate font-medium max-w-[130px]">
                  {w.name}
                </span>
                <span className="font-mono text-[11px] font-bold text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-200 shadow-2xs">
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
