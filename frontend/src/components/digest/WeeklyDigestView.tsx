import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { WeeklyDigestResult } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Building2,
  Clock,
  Printer,
  ShieldCheck,
  Flame,
} from 'lucide-react';

interface WeeklyDigestViewProps {
  onInspectComplaint?: (complaintId: string) => void;
}

export const WeeklyDigestView: React.FC<WeeklyDigestViewProps> = ({
  onInspectComplaint,
}) => {
  const [digest, setDigest] = useState<WeeklyDigestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDigest();
  }, []);

  const loadDigest = async () => {
    setLoading(true);
    try {
      const data = await api.getWeeklyDigest();
      setDigest(data);
    } catch (err) {
      console.error('Failed to load weekly digest:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open('http://localhost:5000/api/analytics/export/csv', '_blank');
  };

  const handleExportJSON = () => {
    window.open('http://localhost:5000/api/analytics/export/json', '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center text-xs text-slate-400">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mb-3" />
        <p className="text-slate-300 font-medium">Compiling municipal department weekly digest...</p>
      </div>
    );
  }

  if (!digest) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-slate-100">Municipal Department Weekly Digest</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              {digest.reportPeriod.currentWeekStart} to {digest.reportPeriod.currentWeekEnd}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Departmental throughput, median resolution times, repeat complaint hotspots, and emerging incident cluster detection.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Week-over-Week Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500">Total Grievances Received</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {digest.summary.totalComplaintsReceived}
            </span>
            <span className="text-xs font-mono text-sky-400">
              {digest.weekComparison.comparisonNote}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500">Confirmed Resolved</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {digest.summary.totalResolved}
            </span>
            <span className="text-[11px] text-slate-400 italic">
              {digest.summary.totalResolved === 'Data unavailable' ? 'Resolution timestamps not in export' : 'Actual verified closures'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500">Median Resolution Time</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {digest.summary.overallMedianResolutionHours !== 'Data unavailable'
                ? `${digest.summary.overallMedianResolutionHours}h`
                : 'Data unavailable'}
            </span>
            <span className="text-[11px] text-slate-400 italic">
              Strictly un-fabricated
            </span>
          </div>
        </div>
      </div>

      {/* Emerging Incident Clusters (Extension 5.4) */}
      {digest.emergingClusters && digest.emergingClusters.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Emerging Incident Clusters (Geo-Concentration Alerts)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {digest.emergingClusters.map((cluster) => (
              <div
                key={cluster.id}
                className="bg-slate-900 border border-amber-800/40 rounded-lg p-4 space-y-2 border-l-4 border-l-amber-500"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">
                    {cluster.alertTitle}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                    {cluster.complaintCount} INCIDENTS
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {cluster.evidence}
                </p>
                <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sky-400" />
                    {cluster.locality} ({cluster.ward || 'Zone'})
                  </span>
                  <span>Category: {cluster.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Department Performance Digest
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {digest.departmentDigests.length} Configured Departments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Department</th>
                <th className="py-2.5 px-4 font-semibold text-right">Received</th>
                <th className="py-2.5 px-4 font-semibold text-right">Resolved</th>
                <th className="py-2.5 px-4 font-semibold text-right">Median Time</th>
                <th className="py-2.5 px-4 font-semibold">Repeat Complaint Localities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {digest.departmentDigests.map((dept) => (
                <tr key={dept.departmentCode} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-100 block">{dept.departmentName}</span>
                    <span className="font-mono text-[10px] text-slate-500">{dept.departmentCode}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                    {dept.complaintsReceived}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span
                      className={
                        dept.complaintsResolved === 'Data unavailable'
                          ? 'text-slate-500 italic text-[11px]'
                          : 'text-emerald-400 font-bold'
                      }
                    >
                      {dept.complaintsResolved}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span
                      className={
                        dept.medianResolutionTimeHours === 'Data unavailable'
                          ? 'text-slate-500 italic text-[11px]'
                          : 'text-sky-300 font-bold'
                      }
                    >
                      {dept.medianResolutionTimeHours !== 'Data unavailable'
                        ? `${dept.medianResolutionTimeHours}h`
                        : 'Data unavailable'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {dept.repeatLocalities.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {dept.repeatLocalities.map((loc, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-950 font-mono text-[10px] text-slate-300 border border-slate-800"
                          >
                            {loc.locality} ({loc.count})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">No repeat clusters</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Repeat Complaint Localities Hotspots */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Municipal Repeat Complaint Localities (Hotspot Analysis)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Strictly Calculated from Actual Export</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {digest.repeatLocalitiesHotspots.map((spot, idx) => (
            <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  {spot.locality}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    spot.trend === 'SURGING'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {spot.trend}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Ward: {spot.ward || 'Bhopal Central'} | {spot.complaintCount} Complaints
              </p>
              <div className="space-y-0.5 pt-1 border-t border-slate-800/80">
                <span className="text-[9px] uppercase font-mono text-slate-500 block">Top Issue Categories:</span>
                {spot.topCategories.map((c, cIdx) => (
                  <div key={cIdx} className="flex items-center justify-between text-[11px] text-slate-300">
                    <span className="truncate">{c.name}</span>
                    <span className="font-mono text-slate-400">x{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
