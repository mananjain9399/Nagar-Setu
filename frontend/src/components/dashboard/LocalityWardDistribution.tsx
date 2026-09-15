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
    <div className="dual-card rounded-xl p-5 shadow-xl border border-white/10 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              {view === 'locality' ? (
                <MapPin className="w-4 h-4 text-indigo-400" />
              ) : (
                <Navigation className="w-4 h-4 text-indigo-400" />
              )}
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {view === 'locality' ? 'Bhopal Localities' : 'Municipal Wards'}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-[#060a14] p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setView('locality')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                view === 'locality'
                  ? 'bg-white text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Localities ({localities.length})
            </button>
            <button
              onClick={() => setView('ward')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                view === 'ward'
                  ? 'bg-white text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
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
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#060a14]/60 border border-white/5 hover:border-indigo-400/40 cursor-pointer transition-all hover:bg-white/5 group"
              >
                <span className="text-xs text-slate-200 group-hover:text-white truncate font-medium max-w-[140px]">
                  {l.name}
                </span>
                <span className="font-mono text-xs font-bold text-white bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30">
                  {l.count}
                </span>
              </div>
            ))
          ) : (
            wards.map((w) => (
              <div
                key={w.name}
                onClick={() => onSelectWard(w.name)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#060a14]/60 border border-white/5 hover:border-indigo-400/40 cursor-pointer transition-all hover:bg-white/5 group"
              >
                <span className="text-xs text-slate-200 group-hover:text-white truncate font-medium max-w-[140px]">
                  {w.name}
                </span>
                <span className="font-mono text-xs font-bold text-white bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30">
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
