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
    <div className="bw-card rounded-xl p-4 space-y-3">
      {/* Top Search and Status Line */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search complaint text, external ID, locality..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto text-xs">
          <span className="text-slate-500">
            Showing <strong className="text-blue-900 font-mono font-bold">{totalFiltered}</strong> matching records
          </span>
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs border border-slate-200 font-semibold transition-all"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Grid of 9 Multi-select / Dropdown Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2 pt-2 border-t border-slate-100">
        {/* 1. Department */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Department
          </label>
          <select
            value={filters.department || 'ALL'}
            onChange={(e) => onFilterChange({ department: e.target.value, page: 1 })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="ALL">All Units</option>
            <option value="UNASSIGNED">Unassigned</option>
            {departments.map((d) => (
              <option key={d.code} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Urgency */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Urgency
          </label>
          <select
            value={filters.urgency || 'ALL'}
            onChange={(e) => onFilterChange({ urgency: e.target.value, page: 1 })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="ALL">All Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* 3. Source Channel */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Channel
          </label>
          <select
            value={filters.sourceChannel || 'ALL'}
            onChange={(e) => onFilterChange({ sourceChannel: e.target.value, page: 1 })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="ALL">All Sources</option>
            <option value="CM_HELPLINE_181">CM Helpline 181</option>
            <option value="MUNICIPAL_APP">Bhopal 311</option>
            <option value="ELECTED_REP">Elected Rep</option>
            <option value="SOCIAL_MEDIA">Social Media</option>
            <option value="MANUAL_IMPORT">Manual Import</option>
          </select>
        </div>

        {/* 4. Ward */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Ward
          </label>
          <select
            value={filters.ward || 'ALL'}
            onChange={(e) => onFilterChange({ ward: e.target.value, page: 1 })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
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
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Locality
          </label>
          <select
            value={filters.locality || 'ALL'}
            onChange={(e) => onFilterChange({ locality: e.target.value, page: 1 })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="ALL">All Localities</option>
            {localities.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Processing Status */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Status
          </label>
          <select
            value={filters.processingStatus || 'ALL'}
            onChange={(e) => onFilterChange({ processingStatus: e.target.value, page: 1 })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PROCESSED">Processed</option>
            <option value="UNPROCESSED">Unprocessed</option>
            <option value="FAILED">Failed</option>
            <option value="IGNORED">Ignored</option>
          </select>
        </div>

        {/* 7. Human Review Required */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Review Flag
          </label>
          <select
            value={filters.reviewStatus || 'ALL'}
            onChange={(e) => onFilterChange({ reviewStatus: e.target.value, page: 1 })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="ALL">All Records</option>
            <option value="REQUIRES_HUMAN_REVIEW">Review Needed</option>
            <option value="REVIEW_OPTIONAL">Standard Auto</option>
          </select>
        </div>

        {/* 8. Duplicate Status */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Duplicates
          </label>
          <select
            value={filters.duplicateStatus || 'ALL'}
            onChange={(e) => onFilterChange({ duplicateStatus: e.target.value, page: 1 })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="ALL">All Types</option>
            <option value="UNIQUE">Unique Tickets</option>
            <option value="POSSIBLE_DUPLICATE">Near Duplicates</option>
            <option value="CONFIRMED_DUPLICATE">Confirmed Dups</option>
          </select>
        </div>

        {/* 9. Media Type */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Media
          </label>
          <select
            value={filters.mediaType || 'ALL'}
            onChange={(e) => onFilterChange({ mediaType: e.target.value, page: 1 })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="ALL">All Media</option>
            <option value="IMAGE">Photo Reports</option>
            <option value="AUDIO">Audio Calls</option>
            <option value="NONE">Text Grievance</option>
          </select>
        </div>
      </div>
    </div>
  );
};
