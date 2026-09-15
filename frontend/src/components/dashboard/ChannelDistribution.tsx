import React from 'react';
import { Radio, ChevronRight } from 'lucide-react';
import { ChannelBadge } from '../common/Badges';

interface ChannelDistributionProps {
  data: Array<{ channel: string; count: number }>;
  total: number;
  onSelectChannel: (channel: string) => void;
}

export const ChannelDistribution: React.FC<ChannelDistributionProps> = ({
  data,
  total,
  onSelectChannel,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-100">Grievance Source Channels</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Multi-Channel Exports
        </span>
      </div>

      <div className="space-y-2">
        {data.map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div
              key={item.channel}
              onClick={() => onSelectChannel(item.channel)}
              className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-slate-800/80 hover:border-sky-500/40 hover:bg-slate-850 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2.5">
                <ChannelBadge channel={item.channel} />
                <span className="text-xs text-slate-300 font-mono">
                  {pct}% of volume
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded">
                  {item.count}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
