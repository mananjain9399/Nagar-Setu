import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../../services/api';
import { WeeklyDigestResult } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  MapPin,
  Building2,
  Printer,
  Flame,
} from 'lucide-react';

interface WeeklyDigestViewProps {
  onInspectComplaint?: (complaintId: string) => void;
}

export const WeeklyDigestView: React.FC<WeeklyDigestViewProps> = () => {
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
    window.open(`${API_BASE_URL}/analytics/export/csv`, '_blank');
  };

  const handleExportJSON = () => {
    window.open(`${API_BASE_URL}/analytics/export/json`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-12 text-center text-xs text-slate-500 shadow-xs">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-slate-700 font-medium">Compiling municipal department weekly digest...</p>
      </div>
    );
  }

  if (!digest) return null;

  return (
    <div className="space-y-4">
      {/* Top Banner & Export Actions */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              DAILY / WEEKLY CIVIC DIGEST
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {digest.reportPeriod.currentWeekStart} to {digest.reportPeriod.currentWeekEnd}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Department workload, critical complaints, repeat complaint hotspots, and emerging incident cluster detection.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Week-over-Week Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-0.5 shadow-xs border-t-2 border-t-blue-600">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Total Grievances Received</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {digest.summary.totalComplaintsReceived}
            </span>
            <span className="text-xs font-mono text-blue-700 font-medium">
              {digest.weekComparison.comparisonNote}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-0.5 shadow-xs border-t-2 border-t-emerald-600">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Confirmed Resolved</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {digest.summary.totalResolved}
            </span>
            <span className="text-[11px] text-slate-400 italic">
              {digest.summary.totalResolved === 'Data unavailable' ? 'Not in export' : 'Verified closures'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-0.5 shadow-xs border-t-2 border-t-indigo-600">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Median Resolution Time</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {digest.summary.overallMedianResolutionHours !== 'Data unavailable'
                ? `${digest.summary.overallMedianResolutionHours}h`
                : 'Data unavailable'}
            </span>
            <span className="text-[11px] text-slate-400 italic">
              Strictly verified
            </span>
          </div>
        </div>
      </div>

      {/* Emerging Incident Clusters */}
      {digest.emergingClusters && digest.emergingClusters.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Emerging Incident Clusters (Geo-Concentration Alerts)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {digest.emergingClusters.map((cluster) => (
              <div
                key={cluster.id}
                className="bg-white border border-amber-200 rounded-md p-3 space-y-1.5 border-l-4 border-l-amber-500 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">
                    {cluster.alertTitle}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                    {cluster.complaintCount} INCIDENTS
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-snug">
                  {cluster.evidence}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
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
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Department Performance Digest
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {digest.departmentDigests.length} DEPARTMENTS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-2 px-3 font-semibold">Department</th>
                <th className="py-2 px-3 font-semibold text-right">Received</th>
                <th className="py-2 px-3 font-semibold text-right">Resolved</th>
                <th className="py-2 px-3 font-semibold text-right">Median Time</th>
                <th className="py-2 px-3 font-semibold">Repeat Complaint Localities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {digest.departmentDigests.map((dept) => (
                <tr key={dept.departmentCode} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3">
                    <span className="font-semibold text-slate-900 block">{dept.departmentName}</span>
                    <span className="font-mono text-[10px] text-slate-400">{dept.departmentCode}</span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    {dept.complaintsReceived}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    <span
                      className={
                        dept.complaintsResolved === 'Data unavailable'
                          ? 'text-slate-400 italic text-[11px]'
                          : 'text-emerald-700 font-bold'
                      }
                    >
                      {dept.complaintsResolved}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    <span
                      className={
                        dept.medianResolutionTimeHours === 'Data unavailable'
                          ? 'text-slate-400 italic text-[11px]'
                          : 'text-blue-700 font-bold'
                      }
                    >
                      {dept.medianResolutionTimeHours !== 'Data unavailable'
                        ? `${dept.medianResolutionTimeHours}h`
                        : 'Data unavailable'}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {dept.repeatLocalities.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {dept.repeatLocalities.map((loc, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-700 border border-slate-200"
                          >
                            {loc.locality} ({loc.count})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No repeat clusters</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Repeat Complaint Localities Hotspots */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Ward & Locality Hotspot Analysis
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">LIVE MAPPING</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {digest.repeatLocalitiesHotspots.map((spot, idx) => (
            <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  {spot.locality}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    spot.trend === 'SURGING'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {spot.trend}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-600">
                Ward: {spot.ward || 'Bhopal Central'} | {spot.complaintCount} Complaints
              </p>
              <div className="space-y-0.5 pt-1 border-t border-slate-200/80">
                <span className="text-[9px] uppercase font-mono text-slate-500 block">Top Issue Categories:</span>
                {spot.topCategories.map((c, cIdx) => (
                  <div key={cIdx} className="flex items-center justify-between text-[11px] text-slate-700">
                    <span className="truncate">{c.name}</span>
                    <span className="font-mono text-slate-500">x{c.count}</span>
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
