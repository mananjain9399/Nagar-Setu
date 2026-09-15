import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { ComplaintFilterQuery, Department } from '../../types';

interface QueueFilterToolbarProps {
  filters: ComplaintFilterQuery;
  departments: Department[];
  wards: string[];
  localities: string[];
  onFilterChange: (newFilters: Partial<ComplaintFilterQuery>) => void;
  onResetFilters: () => void;
  totalFiltered: number;
}

export const QueueFilterToolbar: React.FC<QueueFilterToolbarProps> = ({
  filters,
  departments,
  wards,
  localities,
  onFilterChange,
  onResetFilters,
  totalFiltered,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-3 shadow-sm">
      {/* Top Search and Status Line */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search complaint text, external ID, locality..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-750 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <span className="text-slate-400">
            Showing <strong className="text-slate-200 font-mono">{totalFiltered}</strong> matching records
          </span>
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-xs border border-slate-700 hover:border-slate-600 transition-colors"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Grid of 9 Multi-select / Dropdown Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2 pt-1 border-t border-slate-800/80">
        {/* 1. Department */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Department
          </label>
          <select
            value={filters.department || 'ALL'}
            onChange={(e) => onFilterChange({ department: e.target.value, page: 1 })}
            className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Departments</option>
            <option value="UNASSIGNED">Unassigned / Pending</option>
            {departments.map((d) => (
              <option key={d.code} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Urgency */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Urgency
          </label>
          <select
            value={filters.urgency || 'ALL'}
            onChange={(e) => onFilterChange({ urgency: e.target.value, page: 1 })}
            className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* 3. Source Channel */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Channel
          </label>
          <select
            value={filters.sourceChannel || 'ALL'}
            onChange={(e) => onFilterChange({ sourceChannel: e.target.value, page: 1 })}
            className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Channels</option>
            <option value="CM_HELPLINE_181">CM Helpline 181</option>
            <option value="MUNICIPAL_APP">Bhopal App</option>
            <option value="ELECTED_REP">Elected Rep</option>
            <option value="SOCIAL_MEDIA">Social Media</option>
            <option value="MANUAL_IMPORT">Manual Import</option>
          </select>
        </div>

        {/* 4. Ward */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Ward
          </label>
          <select
            value={filters.ward || 'ALL'}
            onChange={(e) => onFilterChange({ ward: e.target.value, page: 1 })}
            className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Wards</option>
            {wards.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Locality */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Locality
          </label>
          <select
            value={filters.locality || 'ALL'}
            onChange={(e) => onFilterChange({ locality: e.target.value, page: 1 })}
            className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Localities</option>
            {localities.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Duplicate Status */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Duplicate
          </label>
          <select
            value={filters.duplicateStatus || 'ALL'}
            onChange={(e) => onFilterChange({ duplicateStatus: e.target.value, page: 1 })}
            className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNIQUE">Unique Only</option>
            <option value="POSSIBLE_DUPLICATE">Possible Duplicate</option>
            <option value="CONFIRMED_DUPLICATE">Confirmed Duplicate</option>
          </select>
        </div>

        {/* 7. Human Review Status */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Review Status
          </label>
          <select
            value={filters.reviewStatus || 'ALL'}
            onChange={(e) => onFilterChange({ reviewStatus: e.target.value, page: 1 })}
            className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All</option>
            <option value="REQUIRES_HUMAN_REVIEW">Needs Review</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="REVIEWED">Reviewed by Operator</option>
          </select>
        </div>

        {/* 8. Processing Status */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Engine Status
          </label>
          <select
            value={filters.processingStatus || 'ALL'}
            onChange={(e) => onFilterChange({ processingStatus: e.target.value, page: 1 })}
            className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Stages</option>
            <option value="PROCESSED">Processed</option>
            <option value="UNPROCESSED">Unprocessed</option>
            <option value="REQUIRES_REVIEW">Requires Review</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* 9. Language */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Language
          </label>
          <select
            value={filters.language || 'ALL'}
            onChange={(e) => onFilterChange({ language: e.target.value, page: 1 })}
            className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Languages</option>
            <option value="hi">Hindi (hi)</option>
            <option value="en">English (en)</option>
            <option value="hi-en">Hinglish (hi-en)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
