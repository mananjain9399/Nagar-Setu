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
    <div className="bw-card rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Radio className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Grievance Source Channels
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono font-medium px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
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
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <ChannelBadge channel={item.channel} />
                  <span className="text-xs text-slate-500 font-mono font-medium">
                    {pct}% volume
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    {item.count}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
