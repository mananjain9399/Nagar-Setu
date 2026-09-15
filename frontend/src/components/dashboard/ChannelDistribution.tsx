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
    <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Source Channels
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono font-medium px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
            INGESTION FEED
          </span>
        </div>

        <div className="space-y-1.5">
          {data.map((item) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div
                key={item.channel}
                onClick={() => onSelectChannel(item.channel)}
                className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2">
                  <ChannelBadge channel={item.channel} />
                  <span className="text-[11px] text-slate-400 font-mono">
                    {pct}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    {item.count}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
