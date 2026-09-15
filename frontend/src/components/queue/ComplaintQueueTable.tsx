import React from 'react';
import { Complaint } from '../../types';
import {
  UrgencyBadge,
  ChannelBadge,
  StatusBadge,
  DuplicateBadge,
} from '../common/Badges';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowUpRight,
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
      <div className="bg-white border border-slate-200 rounded-md p-12 text-center shadow-xs">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-xs text-slate-600 font-medium">Loading municipal grievance records...</p>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-12 text-center shadow-xs">
        <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-800">No matching complaint records found</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          No records match the current filter criteria. Try resetting filters or import new complaint exports.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px] font-mono">
              <th className="py-2.5 px-3">ID / Channel</th>
              <th className="py-2.5 px-3">Grievance Summary</th>
              <th className="py-2.5 px-3">Department & Category</th>
              <th className="py-2.5 px-2.5">Location / Ward</th>
              <th className="py-2.5 px-2.5">Urgency</th>
              <th className="py-2.5 px-2.5">Status</th>
              <th className="py-2.5 px-2.5">Duplicate</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {complaints.map((c) => {
              const isUnassigned = !c.department;
              return (
                <tr
                  key={c.id}
                  onClick={() => onSelectComplaint(c)}
                  className={`cursor-pointer transition-colors hover:bg-slate-50/80 ${
                    c.requiresHumanReview ? 'bg-amber-50/30' : 'bg-white'
                  }`}
                >
                  {/* 1. ID / Channel */}
                  <td className="py-2 px-3 whitespace-nowrap">
                    <div className="font-mono text-xs font-bold text-slate-900">
                      {c.externalId || c.id.substring(0, 10)}
                    </div>
                    <div className="mt-0.5">
                      <ChannelBadge channel={c.sourceChannel} />
                    </div>
                  </td>

                  {/* 2. Text Summary */}
                  <td className="py-2 px-3 max-w-xs sm:max-w-sm">
                    <p className="line-clamp-2 text-slate-800 text-xs leading-snug">
                      {c.rawText}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-400">
                      <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                      {c.mediaType && c.mediaType !== 'NONE' && (
                        <span className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                          📎 {c.mediaType}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 3. Department & Category */}
                  <td className="py-2 px-3 whitespace-nowrap">
                    {isUnassigned ? (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        Unassigned
                      </span>
                    ) : (
                      <>
                        <div className="font-semibold text-slate-900 truncate max-w-[160px] text-xs">
                          {c.department}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                          {c.category || '—'}
                        </div>
                      </>
                    )}
                  </td>

                  {/* 4. Location / Ward */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <div className="font-medium text-slate-800 truncate max-w-[130px] text-xs">
                      {c.locality || 'Unknown'}
                    </div>
                    <div className="text-[11px] font-mono text-blue-700 font-semibold">
                      {c.ward || 'No Ward'}
                    </div>
                  </td>

                  {/* 5. Urgency */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <UrgencyBadge urgency={c.urgency} />
                  </td>

                  {/* 6. Processing Status */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <StatusBadge
                      status={c.processingStatus}
                      requiresHumanReview={c.requiresHumanReview}
                    />
                  </td>

                  {/* 7. Duplicate Status */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <DuplicateBadge duplicateStatus={c.duplicateStatus} />
                  </td>

                  {/* 8. Action */}
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComplaint(c);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-xs font-semibold transition-all cursor-pointer"
                      title="Inspect Ticket"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
        <div className="text-slate-500 font-mono text-[11px]">
          PAGE <strong className="text-slate-900 font-bold">{currentPage}</strong> OF{' '}
          <strong className="text-slate-900 font-bold">{totalPages || 1}</strong> ({totalCount} RECORDS)
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3 h-3" />
            <span>Prev</span>
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
