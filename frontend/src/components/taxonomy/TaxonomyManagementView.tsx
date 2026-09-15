import React, { useState, useEffect } from 'react';
import { Department } from '../../types';
import { api } from '../../services/api';
import {
  Layers,
  UploadCloud,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Search,
} from 'lucide-react';

export const TaxonomyManagementView: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Import / Validate modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [rawPayload, setRawPayload] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [validationReport, setValidationReport] = useState<any | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTaxonomy();
  }, []);

  const loadTaxonomy = async () => {
    setLoading(true);
    try {
      const data = await api.getTaxonomy();
      setDepartments(data);
      if (data.length > 0 && !expandedDeptId) {
        setExpandedDeptId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load taxonomy:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    setSubmitting(true);
    setValidationReport(null);
    setImportStatus(null);
    try {
      let report;
      if (file) {
        const text = await file.text();
        report = await api.validateTaxonomyCSVText(text);
      } else if (rawPayload.trim().startsWith('[') || rawPayload.trim().startsWith('{')) {
        const parsed = JSON.parse(rawPayload);
        const records = Array.isArray(parsed) ? parsed : parsed.records || [parsed];
        report = await api.validateTaxonomyJSON(records);
      } else {
        report = await api.validateTaxonomyCSVText(rawPayload);
      }
      setValidationReport(report);
    } catch (err: any) {
      setValidationReport({
        valid: false,
        errors: [err.response?.data?.message || err.message || 'Validation failed'],
        warnings: [],
        summary: { departmentCount: 0, categoryCount: 0 },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImport = async () => {
    setSubmitting(true);
    setImportStatus(null);
    try {
      let res;
      if (file) {
        res = await api.importTaxonomyCSV(file);
      } else if (rawPayload.trim().startsWith('[') || rawPayload.trim().startsWith('{')) {
        const parsed = JSON.parse(rawPayload);
        const records = Array.isArray(parsed) ? parsed : parsed.records || [parsed];
        res = await api.importTaxonomyJSON(records);
      } else {
        res = await api.importTaxonomyCSVText(rawPayload);
      }
      setImportStatus(`Success! Imported ${res.importedDepartments} departments and ${res.importedCategories} categories.`);
      await loadTaxonomy();
      setTimeout(() => {
        setShowImportModal(false);
        setRawPayload('');
        setFile(null);
        setValidationReport(null);
        setImportStatus(null);
      }, 2000);
    } catch (err: any) {
      setImportStatus(`Error importing taxonomy: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDepartments = departments.filter((d) => {
    const q = searchTerm.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.categories?.some((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
    );
  });

  const totalCategories = departments.reduce((acc, d) => acc + (d.categories?.length || 0), 0);

  return (
    <div className="space-y-5">
      {/* Top Banner & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-slate-100">Municipal Partner Taxonomy</h2>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              {departments.length} Departments | {totalCategories} Categories
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configurable department and category registry. Decoupled from core engine to prevent hardcoded government assumptions.
          </p>
        </div>

        <button
          onClick={() => setShowImportModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-colors self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Import Partner Taxonomy</span>
        </button>
      </div>

      {/* Strict Disclaimer Alert */}
      <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-lg flex items-start gap-2.5 text-xs text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">Configurable Data Rule:</span>
          <span className="text-amber-200/90 leading-relaxed">
            The active taxonomy below is a provisional placeholder. When official municipal department codes and category lists are provided by the government partner, use the import tool above to replace or update them without modifying source code.
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter departments or categories by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-750 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Departments & Categories Hierarchy List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg">
          Loading taxonomy configuration...
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDepartments.map((dept) => {
            const isExpanded = expandedDeptId === dept.id;
            const categoryCount = dept.categories?.length || 0;

            return (
              <div
                key={dept.id}
                className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm transition-all"
              >
                {/* Department Row Header */}
                <div
                  onClick={() => setExpandedDeptId(isExpanded ? null : dept.id)}
                  className="px-4 py-3 bg-slate-950/60 hover:bg-slate-850/80 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-slate-200">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                          {dept.code}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-100">{dept.name}</h4>
                      </div>
                      {dept.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{dept.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {categoryCount} {categoryCount === 1 ? 'Category' : 'Categories'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      dept.active ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {dept.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>

                {/* Categories Table (Collapsible) */}
                {isExpanded && (
                  <div className="border-t border-slate-800 p-4 bg-slate-950/30">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="text-slate-500 font-mono text-[10px] uppercase border-b border-slate-800/80 pb-2">
                            <th className="py-2 px-3">Category Code</th>
                            <th className="py-2 px-3">Category Name</th>
                            <th className="py-2 px-3">Description</th>
                            <th className="py-2 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {dept.categories && dept.categories.length > 0 ? (
                            dept.categories.map((cat) => (
                              <tr key={cat.id} className="hover:bg-slate-850/40 transition-colors">
                                <td className="py-2 px-3 font-mono text-slate-300 font-medium">
                                  {cat.code}
                                </td>
                                <td className="py-2 px-3 text-slate-200 font-medium">
                                  {cat.name}
                                </td>
                                <td className="py-2 px-3 text-slate-400">
                                  {cat.description || '-'}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-3 px-3 text-slate-500 italic text-center">
                                No categories registered under this department yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* IMPORT / VALIDATE MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-xl max-w-2xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-slate-100">Import Partner Taxonomy</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Provide a partner-supplied taxonomy in CSV format (<code>department_code,department_name,category_code,category_name</code>) or nested JSON. You can validate the file before importing.
            </p>

            {/* Drag and drop or file selector */}
            <div className="border-2 border-dashed border-slate-750 rounded-lg p-4 text-center">
              <input
                type="file"
                accept=".csv,.json"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                id="taxonomy-file-input"
                className="hidden"
              />
              <label htmlFor="taxonomy-file-input" className="cursor-pointer block text-xs">
                <FileCode className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                <span className="text-slate-300 font-medium">
                  {file ? file.name : 'Select or drop CSV / JSON taxonomy file'}
                </span>
              </label>
            </div>

            {/* Paste alternative */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Or paste CSV/JSON payload directly:
              </label>
              <textarea
                rows={5}
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                placeholder={`department_code,department_name,category_code,category_name\nWATER,Water Works,WW_LEAK,Main Line Leak\nROADS,Roads & Civil,RD_POTHOLE,Pothole Repair`}
                className="w-full bg-slate-950 border border-slate-750 rounded p-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-sky-500"
              />
            </div>

            {/* Validation Report Card */}
            {validationReport && (
              <div className={`p-3 rounded-lg border text-xs ${
                validationReport.valid
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {validationReport.valid ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{validationReport.valid ? 'Validation Passed' : 'Validation Errors Found'}</span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono">
                  Summary: {validationReport.summary?.departmentCount} departments, {validationReport.summary?.categoryCount} categories.
                </p>
                {validationReport.errors?.length > 0 && (
                  <ul className="list-disc pl-4 mt-1 font-mono text-[10px] space-y-0.5">
                    {validationReport.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                  </ul>
                )}
                {validationReport.warnings?.length > 0 && (
                  <ul className="list-disc pl-4 mt-1 font-mono text-[10px] text-amber-300 space-y-0.5">
                    {validationReport.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                  </ul>
                )}
              </div>
            )}

            {importStatus && (
              <div className={`p-2.5 rounded text-xs ${
                importStatus.includes('Error')
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
              }`}>
                {importStatus}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleValidate}
                disabled={submitting || (!file && !rawPayload.trim())}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded border border-slate-700 disabled:opacity-50"
              >
                {submitting ? 'Checking...' : 'Validate Taxonomy (Dry Run)'}
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={submitting || (!file && !rawPayload.trim())}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded shadow disabled:opacity-50"
              >
                {submitting ? 'Importing...' : 'Commit Taxonomy Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
