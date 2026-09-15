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
    <div className="dual-card rounded-xl p-5 shadow-xl border border-white/10 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
              <Radio className="w-4 h-4 text-sky-400" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Grievance Source Channels
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10">
            Multi-Channel Stream
          </span>
        </div>

        <div className="space-y-2">
          {data.map((item) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div
                key={item.channel}
                onClick={() => onSelectChannel(item.channel)}
                className="flex items-center justify-between p-3 rounded-lg bg-[#060a14]/60 border border-white/5 hover:border-sky-400/40 hover:bg-white/5 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <ChannelBadge channel={item.channel} />
                  <span className="text-xs text-slate-300 font-mono font-medium">
                    {pct}% volume
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-white/10">
                    {item.count}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
