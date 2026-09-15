import React from 'react';
import { Complaint } from '../../types';
import {
  UrgencyBadge,
  ChannelBadge,
  StatusBadge,
  DuplicateBadge,
} from '../common/Badges';
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface ComplaintQueueTableProps {
  complaints: Complaint[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectComplaint: (complaint: Complaint) => void;
  loading: boolean;
}

export const ComplaintQueueTable: React.FC<ComplaintQueueTableProps> = ({
  complaints,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onSelectComplaint,
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mb-3" />
        <p className="text-sm text-slate-300 font-medium">Loading complaint records from zone database...</p>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
        <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-200">No matching complaint records found</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          No records match the current filter criteria. Try resetting filters or import new complaint exports.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm overflow-hidden">
      {/* High-density operational data table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Complaint / Ref</th>
              <th className="py-2.5 px-2.5">Channel</th>
              <th className="py-2.5 px-3 min-w-[260px]">Raw Complaint Text</th>
              <th className="py-2.5 px-2">Lang</th>
              <th className="py-2.5 px-2.5">Department / Category</th>
              <th className="py-2.5 px-2">Urgency</th>
              <th className="py-2.5 px-2.5">Ward / Locality</th>
              <th className="py-2.5 px-2">Duplicate</th>
              <th className="py-2.5 px-2">Status</th>
              <th className="py-2.5 px-2 text-center">Conf</th>
              <th className="py-2.5 px-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {complaints.map((c) => {
              const hasReviews = (c._count?.reviews ?? 0) > 0 || (c.reviews && c.reviews.length > 0);
              const confPct = c.confidence ? Math.round(c.confidence * 100) : null;

              return (
                <tr
                  key={c.id}
                  className="hover:bg-slate-850/80 transition-colors group cursor-pointer"
                  onClick={() => onSelectComplaint(c)}
                >
                  {/* ID / External ID */}
                  <td className="py-2.5 px-3">
                    <div className="font-mono font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                      {c.externalId || c.id.slice(0, 8)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(c.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>

                  {/* Channel */}
                  <td className="py-2.5 px-2.5">
                    <ChannelBadge channel={c.sourceChannel} />
                  </td>

                  {/* Raw Text Snippet */}
                  <td className="py-2.5 px-3">
                    <p className="line-clamp-2 text-slate-200 leading-relaxed font-sans">
                      {c.rawText}
                    </p>
                    {c.caption && (
                      <span className="text-[10px] text-slate-400 italic block mt-0.5 truncate max-w-sm">
                        Attachment: {c.caption}
                      </span>
                    )}
                  </td>

                  {/* Language */}
                  <td className="py-2.5 px-2">
                    <span className="px-1.5 py-0.5 rounded font-mono text-[10px] uppercase font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {c.language || 'en'}
                    </span>
                  </td>

                  {/* Department & Category */}
                  <td className="py-2.5 px-2.5">
                    <div className="font-medium text-slate-200 truncate max-w-[180px]">
                      {c.department || <span className="text-slate-500 italic">Unassigned</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                      {c.category || <span className="text-slate-500">-</span>}
                    </div>
                  </td>

                  {/* Urgency */}
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <UrgencyBadge urgency={c.urgency} />
                  </td>

                  {/* Ward / Locality */}
                  <td className="py-2.5 px-2.5">
                    <div className="font-medium text-slate-200 truncate max-w-[130px]">
                      {c.locality || 'Unknown'}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {c.ward || 'Zone General'}
                    </div>
                  </td>

                  {/* Duplicate Status */}
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <DuplicateBadge duplicateStatus={c.duplicateStatus} />
                  </td>

                  {/* Processing / Review Status */}
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <StatusBadge
                        status={c.processingStatus}
                        requiresHumanReview={c.requiresHumanReview}
                      />
                      {hasReviews && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          Operator Reviewed
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Confidence */}
                  <td className="py-2.5 px-2 text-center whitespace-nowrap font-mono">
                    {confPct !== null ? (
                      <span
                        className={`text-[11px] font-bold ${
                          confPct >= 90
                            ? 'text-emerald-400'
                            : confPct >= 75
                            ? 'text-sky-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {confPct}%
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-2.5 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComplaint(c);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 hover:text-white border border-sky-800 text-xs font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-3 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing page <strong className="text-slate-200 font-mono">{currentPage}</strong> of{' '}
          <strong className="text-slate-200 font-mono">{totalPages || 1}</strong> ({totalCount} total records)
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="px-2 font-mono text-slate-300">{currentPage}</span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
