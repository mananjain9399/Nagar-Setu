import React, { useState } from 'react';
import { api } from '../../services/api';
import { ImportResult } from '../../types';
import {
  UploadCloud,
  FileText,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';

interface DatasetImportViewProps {
  onImportComplete: () => void;
}

export const DatasetImportView: React.FC<DatasetImportViewProps> = ({ onImportComplete }) => {
  const [importMode, setImportMode] = useState<'file' | 'text' | 'sample'>('sample');
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const res = await api.importCSVFile(file);
      setResult(res);
      onImportComplete();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'CSV Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTextImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const trimmed = rawText.trim();
      let res: ImportResult;
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        const records = Array.isArray(parsed) ? parsed : parsed.records || [parsed];
        res = await api.importJSON(records);
      } else {
        res = await api.importCSVText(trimmed);
      }
      setResult(res);
      onImportComplete();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleImport = async () => {
    setLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const res = await api.importSampleDataset();
      setResult(res);
      onImportComplete();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Sample import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Overview Notice Card */}
      <div className="bg-white border border-slate-200 rounded-md p-4 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <h3 className="font-bold uppercase tracking-wider text-slate-900 mb-0.5">
            Anonymised Complaint Dataset Ingestion
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Upload or paste batch grievance exports from external channels (CM Helpline 181, Municipal App, Elected Rep notes). The engine automatically parses raw complaint text, identifies languages, extracts location entities, and queues tickets for operator review.
          </p>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200 max-w-md">
        <button
          onClick={() => setImportMode('sample')}
          className={`flex-1 py-1 px-2.5 rounded text-xs font-semibold transition-all cursor-pointer ${
            importMode === 'sample'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Quick Demo Dataset
        </button>
        <button
          onClick={() => setImportMode('file')}
          className={`flex-1 py-1 px-2.5 rounded text-xs font-semibold transition-all cursor-pointer ${
            importMode === 'file'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upload CSV File
        </button>
        <button
          onClick={() => setImportMode('text')}
          className={`flex-1 py-1 px-2.5 rounded text-xs font-semibold transition-all cursor-pointer ${
            importMode === 'text'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Paste CSV / JSON
        </button>
      </div>

      {/* Mode 1: Quick Sample Dataset */}
      {importMode === 'sample' && (
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Load Sample Anonymised Bhopal Export (CSV)
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Instantly ingest our pre-bundled synthetic sample file containing multi-channel complaints across Karond, Bairagarh, Arera Hills, and Kolar Road to test the pipeline.
          </p>

          <button
            onClick={handleSampleImport}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{loading ? 'Ingesting Sample Records...' : 'Load & Ingest Sample Dataset'}</span>
          </button>
        </div>
      )}

      {/* Mode 2: File Upload */}
      {importMode === 'file' && (
        <form onSubmit={handleFileUpload} className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Upload CSV Export File</h4>
          </div>

          <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded p-6 text-center transition-colors bg-slate-50">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer block">
              <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <span className="text-xs text-slate-700 font-medium block">
                {file ? file.name : 'Click to select an exported CSV file'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Supports complaint_id, source_channel, complaint_text, locality, ward_no, etc.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Processing File...' : 'Start Batch Import'}
          </button>
        </form>
      )}

      {/* Mode 3: Raw Text Paste */}
      {importMode === 'text' && (
        <form onSubmit={handleTextImport} className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Paste CSV or JSON Payload</h4>
          </div>

          <textarea
            rows={6}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`complaint_id,source_channel,complaint_text,locality,ward_no\nIMP-01,CM_HELPLINE_181,"Water pipe leak near MP Nagar Zone-1 square",MP Nagar Zone-1,Ward 34`}
            className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
          />

          <button
            type="submit"
            disabled={!rawText.trim() || loading}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Processing Payload...' : 'Parse & Ingest Records'}
          </button>
        </form>
      )}

      {/* Feedback Messages */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {result && (
        <div className="bg-white border border-emerald-200 rounded-md p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ingestion Batch Completed</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px]">TOTAL READ</span>
              <span className="text-slate-900 font-bold">{result.totalRows}</span>
            </div>
            <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
              <span className="text-emerald-700 block text-[10px]">IMPORTED</span>
              <span className="text-emerald-700 font-bold">{result.importedCount}</span>
            </div>
            <div className="bg-amber-50 p-2 rounded border border-amber-200">
              <span className="text-amber-800 block text-[10px]">SKIPPED / DUPS</span>
              <span className="text-amber-800 font-bold">{result.skippedCount}</span>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
              <span className="font-semibold block mb-0.5">Notes / Warnings:</span>
              <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px]">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Resilient Schema Mapping Reference */}
      <div className="bg-white border border-slate-200 rounded-md p-3.5 text-xs text-slate-600 shadow-xs">
        <h5 className="font-semibold text-slate-800 mb-1.5 uppercase text-[10px] font-mono tracking-wider">
          Resilient Header Mapping Reference
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <strong className="text-slate-800 block">ID:</strong>
            <code className="text-slate-600">complaint_id, id</code>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <strong className="text-slate-800 block">Channel:</strong>
            <code className="text-slate-600">source_channel, source</code>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <strong className="text-slate-800 block">Text:</strong>
            <code className="text-slate-600">complaint_text, raw_text</code>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <strong className="text-slate-800 block">Location:</strong>
            <code className="text-slate-600">locality, ward, ward_no</code>
          </div>
        </div>
      </div>
    </div>
  );
};
