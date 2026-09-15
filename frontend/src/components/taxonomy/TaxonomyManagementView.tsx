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
    <div className="space-y-4">
      {/* Top Banner & Actions */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              MUNICIPAL PARTNER TAXONOMY
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {departments.length} Units | {totalCategories} Categories
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable department and category registry decoupled from core engine.
          </p>
        </div>

        <button
          onClick={() => setShowImportModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Import Partner Taxonomy</span>
        </button>
      </div>

      {/* Notice */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-start gap-2.5 text-xs text-slate-700 shadow-xs">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900 block mb-0.5">Configurable Data Rule:</span>
          <span className="text-slate-600 leading-relaxed text-[11px]">
            Taxonomy records are fully decoupled. When official municipal department codes are provided by government partners, use the import tool to replace or update them without modifying source code.
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter departments or categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
        />
      </div>

      {/* Departments & Categories Hierarchy List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-md">
          Loading taxonomy configuration...
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDepartments.map((dept) => {
            const isExpanded = expandedDeptId === dept.id;
            const categoryCount = dept.categories?.length || 0;

            return (
              <div
                key={dept.id}
                className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-xs"
              >
                {/* Department Row Header */}
                <div
                  onClick={() => setExpandedDeptId(isExpanded ? null : dept.id)}
                  className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <button className="text-slate-500 hover:text-slate-900">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          {dept.code}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{dept.name}</h4>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {categoryCount} {categoryCount === 1 ? 'Category' : 'Categories'}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      dept.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {dept.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>

                {/* Categories Table (Collapsible) */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-3 bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200 pb-1.5">
                            <th className="py-1.5 px-3">Category Code</th>
                            <th className="py-1.5 px-3">Category Name</th>
                            <th className="py-1.5 px-3">Description</th>
                            <th className="py-1.5 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-sans">
                          {dept.categories && dept.categories.length > 0 ? (
                            dept.categories.map((cat) => (
                              <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-1.5 px-3 font-mono text-slate-700 font-medium">
                                  {cat.code}
                                </td>
                                <td className="py-1.5 px-3 text-slate-900 font-medium">
                                  {cat.name}
                                </td>
                                <td className="py-1.5 px-3 text-slate-500 text-[11px]">
                                  {cat.description || '-'}
                                </td>
                                <td className="py-1.5 px-3 text-right">
                                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-3 px-3 text-slate-400 italic text-center">
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md max-w-xl w-full p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Import Partner Taxonomy
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-800 text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Upload CSV (<code>department_code,department_name,category_code,category_name</code>) or paste payload.
            </p>

            <div className="border-2 border-dashed border-slate-200 rounded p-3 text-center bg-slate-50">
              <input
                type="file"
                accept=".csv,.json"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                id="taxonomy-file-input"
                className="hidden"
              />
              <label htmlFor="taxonomy-file-input" className="cursor-pointer block text-xs">
                <FileCode className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-slate-700 font-medium">
                  {file ? file.name : 'Select or drop CSV / JSON taxonomy file'}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">
                Or paste CSV payload directly:
              </label>
              <textarea
                rows={4}
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                placeholder={`department_code,department_name,category_code,category_name\nWATER,Water Works,WW_LEAK,Main Line Leak`}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            {validationReport && (
              <div className={`p-2.5 rounded border text-xs ${
                validationReport.valid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  {validationReport.valid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                  <span>{validationReport.valid ? 'Validation Passed' : 'Validation Errors Found'}</span>
                </div>
                <p className="text-[11px] font-mono">
                  Summary: {validationReport.summary?.departmentCount} departments, {validationReport.summary?.categoryCount} categories.
                </p>
              </div>
            )}

            {importStatus && (
              <div className={`p-2 rounded text-xs ${
                importStatus.includes('Error')
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {importStatus}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleValidate}
                disabled={submitting || (!file && !rawPayload.trim())}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-200 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Checking...' : 'Validate (Dry Run)'}
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={submitting || (!file && !rawPayload.trim())}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Importing...' : 'Commit Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
