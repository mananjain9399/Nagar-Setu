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
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center text-xs text-slate-400">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mb-3" />
        <p className="text-slate-300 font-medium">Auditing dataset quality and location integrity...</p>
      </div>
    );
  }

  if (!summary) return null;

  const totalIssues = Object.values(summary.issuesSummary).reduce((a, b) => a + b, 0);

  const metricCards = [
    {
      id: 'missingLocations',
      label: 'Missing Locations',
      count: summary.issuesSummary.missingLocations,
      icon: MapPinOff,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      filter: 'MISSING_LOCATION',
    },
    {
      id: 'ambiguousLocalities',
      label: 'Ambiguous Locations',
      count: summary.issuesSummary.ambiguousLocalities,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      filter: 'AMBIGUOUS_LOCALITY',
    },
    {
      id: 'unknownAliases',
      label: 'Unmapped Aliases',
      count: summary.issuesSummary.unknownAliases,
      icon: FileQuestion,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
      filter: 'UNKNOWN_ALIAS',
    },
    {
      id: 'invalidTimestamps',
      label: 'Invalid Timestamps',
      count: summary.issuesSummary.invalidTimestamps,
      icon: CalendarX,
      color: 'text-slate-400',
      bgColor: 'bg-slate-800/80',
      borderColor: 'border-slate-750',
      filter: 'INVALID_TIMESTAMP',
    },
    {
      id: 'missingText',
      label: 'Missing Complaint Text',
      count: summary.issuesSummary.missingText,
      icon: FileX,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      filter: 'MISSING_TEXT',
    },
    {
      id: 'duplicateExternalIds',
      label: 'Duplicate External IDs',
      count: summary.issuesSummary.duplicateExternalIds,
      icon: CopyX,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      filter: 'DUPLICATE_EXTERNAL_ID',
    },
    {
      id: 'unsupportedMedia',
      label: 'Unsupported Media',
      count: summary.issuesSummary.unsupportedMedia,
      icon: Film,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      filter: 'UNSUPPORTED_MEDIA',
    },
  ];

  const filteredIssues = summary.detectedIssues.filter((i) => {
    if (selectedIssueFilter === 'ALL') return true;
    return i.issueType === selectedIssueFilter;
  });

  return (
    <div className="space-y-5">
      {/* Top Health Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">Dataset Health & Quality Audit</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated verification across all imported grievance records. Flags missing geographical evidence, ambiguous terms, and corrupted fields.
          </p>
        </div>

        {/* Quality Score Meter */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Dataset Health</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {summary.qualityScorePercentage}% Clean
            </span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Total Records</span>
            <span className="text-xl font-bold font-mono text-slate-200">
              {summary.totalRecords}
            </span>
          </div>
          <button
            onClick={loadQualityData}
            className="p-1.5 rounded hover:bg-slate-850 text-slate-400 hover:text-slate-200 ml-2"
            title="Re-run quality audit"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedIssueFilter === card.filter;
          return (
            <div
              key={card.id}
              onClick={() => setSelectedIssueFilter(isSelected ? 'ALL' : card.filter)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer hover:scale-[1.02] ${card.bgColor} ${
                isSelected ? 'ring-2 ring-sky-500 border-transparent' : card.borderColor
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-400 truncate max-w-[100px]">
                  {card.label}
                </span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <span className="text-2xl font-bold font-mono text-slate-100 block">
                {card.count}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                {isSelected ? 'Click to deselect' : 'Filter table'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Issues Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm overflow-hidden space-y-3">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Detected Quality Issues ({filteredIssues.length})
            </h3>
          </div>

          {selectedIssueFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedIssueFilter('ALL')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              Clear filter ({selectedIssueFilter})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-950 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Complaint Ref</th>
                <th className="py-2.5 px-2.5">Issue Type</th>
                <th className="py-2.5 px-2">Severity</th>
                <th className="py-2.5 px-3">Defect Description</th>
                <th className="py-2.5 px-2.5">Sample Value</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-200 font-semibold">
                      {issue.externalId || issue.complaintId.slice(0, 8)}
                    </td>

                    <td className="py-2.5 px-2.5">
                      <span className="font-mono text-[11px] font-semibold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {issue.issueType.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-2.5 px-2">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                        issue.severity === 'HIGH'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : issue.severity === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {issue.severity}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-300 text-xs">
                      {issue.description}
                    </td>

                    <td className="py-2.5 px-2.5 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                      {issue.sampleValue ? `"${issue.sampleValue}"` : <span className="text-slate-600">null</span>}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onInspectComplaint(issue.complaintId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 text-xs font-medium border border-sky-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
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
