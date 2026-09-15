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
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {view === 'locality' ? (
            <MapPin className="w-4 h-4 text-purple-400" />
          ) : (
            <Navigation className="w-4 h-4 text-purple-400" />
          )}
          <h3 className="text-sm font-semibold text-slate-100">
            {view === 'locality' ? 'Bhopal Localities' : 'Municipal Wards'}
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
          <button
            onClick={() => setView('locality')}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              view === 'locality'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Localities ({localities.length})
          </button>
          <button
            onClick={() => setView('ward')}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              view === 'ward'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
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
              className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/40 cursor-pointer transition-all hover:bg-slate-850"
            >
              <span className="text-xs text-slate-200 truncate font-medium">
                {l.name}
              </span>
              <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                {l.count}
              </span>
            </div>
          ))
        ) : (
          wards.map((w) => (
            <div
              key={w.name}
              onClick={() => onSelectWard(w.name)}
              className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/40 cursor-pointer transition-all hover:bg-slate-850"
            >
              <span className="text-xs text-slate-200 truncate font-medium">
                {w.name}
              </span>
              <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                {w.count}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
