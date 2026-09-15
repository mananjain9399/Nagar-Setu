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
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Overview Notice Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-start gap-3 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <h3 className="font-semibold text-slate-100 mb-0.5">
            Anonymised Complaint Dataset Ingestion
          </h3>
          <p className="text-slate-400 leading-relaxed">
            Upload or paste batch grievance exports from external channels (CM Helpline 181, Municipal App, Elected Rep notes). The engine automatically parses raw complaint text, identifies languages, extracts location entities, and queues tickets for operator review.
          </p>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 max-w-md">
        <button
          onClick={() => setImportMode('sample')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
            importMode === 'sample'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Quick Demo Dataset
        </button>
        <button
          onClick={() => setImportMode('file')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
            importMode === 'file'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Upload CSV File
        </button>
        <button
          onClick={() => setImportMode('text')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
            importMode === 'text'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Paste CSV / JSON
        </button>
      </div>

      {/* Mode 1: Quick Sample Dataset */}
      {importMode === 'sample' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-100">
              Load Sample Anonymised Bhopal Export (CSV)
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Instantly ingest our pre-bundled synthetic sample file containing 5 multi-channel complaints across Karond, Bairagarh, Arera Hills, and Kolar Road to test the pipeline.
          </p>

          <button
            onClick={handleSampleImport}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-md shadow transition-colors disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{loading ? 'Ingesting Sample Records...' : 'Load & Ingest Sample Dataset'}</span>
          </button>
        </div>
      )}

      {/* Mode 2: File Upload */}
      {importMode === 'file' && (
        <form onSubmit={handleFileUpload} className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <h4 className="text-sm font-semibold text-slate-100">Upload CSV Export File</h4>
          </div>

          <div className="border-2 border-dashed border-slate-750 hover:border-sky-500/50 rounded-lg p-6 text-center transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer block">
              <UploadCloud className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <span className="text-xs text-slate-300 font-medium block">
                {file ? file.name : 'Click to select an exported CSV file'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Supports complaint_id, source_channel, complaint_text, locality, ward_no, etc.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded-md shadow transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing File...' : 'Start Batch Import'}
          </button>
        </form>
      )}

      {/* Mode 3: Raw Text Paste */}
      {importMode === 'text' && (
        <form onSubmit={handleTextImport} className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-sky-400" />
            <h4 className="text-sm font-semibold text-slate-100">Paste CSV or JSON Payload</h4>
          </div>

          <textarea
            rows={8}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`complaint_id,source_channel,complaint_text,locality,ward_no
IMP-01,CM_HELPLINE_181,"Water pipe leak near MP Nagar Zone-1 square",MP Nagar Zone-1,Ward 34`}
            className="w-full bg-slate-950 border border-slate-750 rounded p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-sky-500"
          />

          <button
            type="submit"
            disabled={!rawText.trim() || loading}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded-md shadow transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing Payload...' : 'Parse & Ingest Records'}
          </button>
        </form>
      )}

      {/* Feedback Messages */}
      {errorMessage && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {result && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-lg p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ingestion Batch Completed</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">TOTAL READ</span>
              <span className="text-slate-100 font-bold">{result.totalRows}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-emerald-500 block text-[10px]">IMPORTED</span>
              <span className="text-emerald-300 font-bold">{result.importedCount}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-amber-500 block text-[10px]">SKIPPED / DUPS</span>
              <span className="text-amber-300 font-bold">{result.skippedCount}</span>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-2 text-[11px] text-amber-400 bg-amber-950/40 p-2 rounded border border-amber-800/40">
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
      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 text-xs text-slate-400">
        <h5 className="font-semibold text-slate-300 mb-2 uppercase text-[11px] tracking-wider">
          Resilient Header Mapping Reference
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
          <div className="p-2 bg-slate-900 rounded border border-slate-850">
            <strong className="text-slate-200 block">ID:</strong>
            <code>complaint_id, id, external_id</code>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-850">
            <strong className="text-slate-200 block">Channel:</strong>
            <code>source_channel, channel, source</code>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-850">
            <strong className="text-slate-200 block">Text:</strong>
            <code>complaint_text, raw_text, text</code>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-850">
            <strong className="text-slate-200 block">Location:</strong>
            <code>locality, location, ward, ward_no</code>
          </div>
        </div>
      </div>
    </div>
  );
};
