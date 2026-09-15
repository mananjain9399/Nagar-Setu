import React, { useState, useEffect } from 'react';
import { DataQualitySummary } from '../../types';
import { api } from '../../services/api';
import {
  CheckCheck,
  AlertTriangle,
  MapPinOff,
  FileQuestion,
  CalendarX,
  CopyX,
  FileX,
  RotateCcw,
  Eye,
  Film,
} from 'lucide-react';

interface DataQualityViewProps {
  onInspectComplaint: (complaintId: string) => void;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({ onInspectComplaint }) => {
  const [summary, setSummary] = useState<DataQualitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIssueFilter, setSelectedIssueFilter] = useState<string>('ALL');

  useEffect(() => {
    loadQualityData();
  }, []);

  const loadQualityData = async () => {
    setLoading(true);
    try {
      const data = await api.getDataQualityStats();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load data quality summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-12 text-center text-xs text-slate-500 shadow-xs">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-slate-700 font-medium">Auditing dataset quality and location integrity...</p>
      </div>
    );
  }

  if (!summary) return null;

  const metricCards = [
    {
      id: 'missingLocations',
      label: 'Missing Locations',
      count: summary.issuesSummary.missingLocations,
      icon: MapPinOff,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50/60',
      borderColor: 'border-rose-200',
      filter: 'MISSING_LOCATION',
    },
    {
      id: 'ambiguousLocalities',
      label: 'Ambiguous Locations',
      count: summary.issuesSummary.ambiguousLocalities,
      icon: AlertTriangle,
      color: 'text-amber-800',
      bgColor: 'bg-amber-50/60',
      borderColor: 'border-amber-200',
      filter: 'AMBIGUOUS_LOCALITY',
    },
    {
      id: 'unknownAliases',
      label: 'Unmapped Aliases',
      count: summary.issuesSummary.unknownAliases,
      icon: FileQuestion,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50/60',
      borderColor: 'border-blue-200',
      filter: 'UNKNOWN_ALIAS',
    },
    {
      id: 'invalidTimestamps',
      label: 'Invalid Timestamps',
      count: summary.issuesSummary.invalidTimestamps,
      icon: CalendarX,
      color: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      filter: 'INVALID_TIMESTAMP',
    },
    {
      id: 'missingText',
      label: 'Missing Text',
      count: summary.issuesSummary.missingText,
      icon: FileX,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50/60',
      borderColor: 'border-rose-200',
      filter: 'MISSING_TEXT',
    },
    {
      id: 'duplicateExternalIds',
      label: 'Duplicate IDs',
      count: summary.issuesSummary.duplicateExternalIds,
      icon: CopyX,
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50/60',
      borderColor: 'border-indigo-200',
      filter: 'DUPLICATE_EXTERNAL_ID',
    },
    {
      id: 'unsupportedMedia',
      label: 'Unsupported Media',
      count: summary.issuesSummary.unsupportedMedia,
      icon: Film,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50/60',
      borderColor: 'border-orange-200',
      filter: 'UNSUPPORTED_MEDIA',
    },
  ];

  const filteredIssues = summary.detectedIssues.filter((i) => {
    if (selectedIssueFilter === 'ALL') return true;
    return i.issueType === selectedIssueFilter;
  });

  return (
    <div className="space-y-4">
      {/* Top Health Overview Card */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              DATASET HEALTH & QUALITY AUDIT
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated verification across all imported grievance records. Flags missing geographical evidence, ambiguous terms, and corrupted fields.
          </p>
        </div>

        {/* Quality Score Meter */}
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded border border-slate-200 self-start sm:self-auto">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Dataset Health</span>
            <span className="text-xl font-bold font-mono text-emerald-700">
              {summary.qualityScorePercentage}% Clean
            </span>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Total Records</span>
            <span className="text-xl font-bold font-mono text-slate-900">
              {summary.totalRecords}
            </span>
          </div>
          <button
            onClick={loadQualityData}
            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Re-run quality audit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedIssueFilter === card.filter;
          return (
            <div
              key={card.id}
              onClick={() => setSelectedIssueFilter(isSelected ? 'ALL' : card.filter)}
              className={`p-3 rounded border transition-all cursor-pointer hover:shadow-xs ${card.bgColor} ${
                isSelected ? 'ring-2 ring-blue-600 border-transparent' : card.borderColor
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-medium text-slate-700 truncate max-w-[90px]">
                  {card.label}
                </span>
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
              <span className="text-xl font-bold font-mono text-slate-900 block">
                {card.count}
              </span>
              <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                {isSelected ? 'Deselect' : 'Filter table'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Issues Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden space-y-2">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Detected Quality Issues ({filteredIssues.length})
            </h3>
          </div>

          {selectedIssueFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedIssueFilter('ALL')}
              className="text-xs text-blue-700 hover:underline font-semibold cursor-pointer"
            >
              Clear filter ({selectedIssueFilter})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Complaint Ref</th>
                <th className="py-2 px-2.5">Issue Type</th>
                <th className="py-2 px-2">Severity</th>
                <th className="py-2 px-3">Defect Description</th>
                <th className="py-2 px-2.5">Sample Value</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 font-mono text-slate-900 font-semibold text-xs">
                      {issue.externalId || issue.complaintId.slice(0, 8)}
                    </td>

                    <td className="py-2 px-2.5">
                      <span className="font-mono text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {issue.issueType.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-2 px-2">
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                        issue.severity === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : issue.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {issue.severity}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-slate-800 text-xs">
                      {issue.description}
                    </td>

                    <td className="py-2 px-2.5 font-mono text-[10px] text-slate-500 truncate max-w-xs">
                      {issue.sampleValue ? `"${issue.sampleValue}"` : <span className="text-slate-400">null</span>}
                    </td>

                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => onInspectComplaint(issue.complaintId)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No data quality defects detected under current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
