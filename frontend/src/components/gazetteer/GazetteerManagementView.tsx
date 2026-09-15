import React, { useState, useEffect } from 'react';
import { Ward, Locality, AliasOverlap, NormalisationResult } from '../../types';
import { api } from '../../services/api';
import {
  MapPin,
  Search,
  UploadCloud,
  Layers,
  AlertTriangle,
  Play,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';

export const GazetteerManagementView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'tester' | 'wards' | 'overlaps' | 'import'>('tester');
  const [wards, setWards] = useState<Ward[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [overlaps, setOverlaps] = useState<AliasOverlap[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive Normaliser state
  const [testInput, setTestInput] = useState('near MP Nagar zone 1');
  const [normalisationResult, setNormalisationResult] = useState<NormalisationResult | null>(null);
  const [normalising, setNormalising] = useState(false);

  // Import state
  const [file, setFile] = useState<File | null>(null);
  const [rawCsv, setRawCsv] = useState('');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    loadGazetteer();
  }, []);

  const loadGazetteer = async () => {
    setLoading(true);
    try {
      const [wardData, locData, overlapData] = await Promise.all([
        api.getWards(),
        api.getLocalities(),
        api.getGazetteerOverlaps(),
      ]);
      setWards(wardData);
      setLocalities(locData);
      setOverlaps(overlapData);
    } catch (err) {
      console.error('Failed to load gazetteer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunNormalisation = async (queryText?: string) => {
    const q = queryText || testInput;
    if (!q.trim()) return;

    setNormalising(true);
    try {
      const res = await api.normalizeLocation(q);
      setNormalisationResult(res);
    } catch (err) {
      console.error('Normalisation error:', err);
    } finally {
      setNormalising(false);
    }
  };

  const handleImportGazetteer = async () => {
    setImporting(true);
    setImportStatus(null);
    try {
      let res;
      if (file) {
        if (file.name.endsWith('.json')) {
          const text = await file.text();
          const parsed = JSON.parse(text);
          const records = Array.isArray(parsed) ? parsed : parsed.records || [parsed];
          res = await api.importGazetteerJSON(records);
        } else {
          res = await api.importGazetteerCSV(file);
        }
      } else if (rawCsv.trim().startsWith('[') || rawCsv.trim().startsWith('{')) {
        const parsed = JSON.parse(rawCsv);
        const records = Array.isArray(parsed) ? parsed : parsed.records || [parsed];
        res = await api.importGazetteerJSON(records);
      } else {
        res = await api.importGazetteerCSVText(rawCsv);
      }
      setImportStatus(`Success! Imported ${res.importedWards} wards and ${res.importedLocalities} localities.`);
      await loadGazetteer();
    } catch (err: any) {
      setImportStatus(`Error importing gazetteer: ${err.response?.data?.message || err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const sampleTestPhrases = [
    'near MP Nagar zone 1',
    'सर्वधर्म पुल कोलार रोड',
    'opposite Aashima Mall Hoshangabad Road',
    'behind Dussehra Maidan TT Nagar',
    'Chetak Bridge Incline',
    '10 No Market Arera Colony',
    'near unknown highway junction in hills',
  ];

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-slate-100">Bhopal Municipal Locality Gazetteer</h2>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              {wards.length} Wards | {localities.length} Localities
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ground-truth municipal boundary registry, multi-lingual aliases, spelling variants, and landmark mapping for explainable routing.
          </p>
        </div>

        {/* Subtab Navigator */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveSubTab('tester')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeSubTab === 'tester' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive Normaliser
          </button>
          <button
            onClick={() => setActiveSubTab('wards')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeSubTab === 'wards' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wards & Localities
          </button>
          <button
            onClick={() => setActiveSubTab('overlaps')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'overlaps' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Alias Overlaps</span>
            {overlaps.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-bold">
                {overlaps.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('import')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeSubTab === 'import' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Import Gazetteer
          </button>
        </div>
      </div>

      {/* ================= TAB 1: INTERACTIVE NORMALISATION TESTER ================= */}
      {activeSubTab === 'tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Input & Preset Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Raw Location Input
                </span>
                <span className="text-[10px] font-mono text-slate-500">Pipeline Test Console</span>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter raw location text e.g. near MP Nagar zone 1, Sarvadharma bridge, etc."
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-sky-500"
                />

                <button
                  onClick={() => handleRunNormalisation()}
                  disabled={normalising || !testInput.trim()}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded-md shadow flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{normalising ? 'Executing Normalisation Pipeline...' : 'Run Normalisation Pipeline'}</span>
                </button>
              </div>

              {/* Sample Presets */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1.5">
                  Try Sample Grievance Locations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleTestPhrases.map((phrase, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTestInput(phrase);
                        handleRunNormalisation(phrase);
                      }}
                      className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-sky-300 border border-slate-800 text-[11px] transition-colors text-left"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong>Explainability Rule:</strong> The engine will never invent or guess a ward when evidence is insufficient. If a location is unknown or ambiguous, it returns null for ward and flags for human operator review with alternative candidates.
              </p>
            </div>
          </div>

          {/* Pipeline Explanation Output Column */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Normalisation Decision & Rationale
                  </h3>
                </div>
                {normalisationResult && (
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                    normalisationResult.confidence >= 0.85
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : normalisationResult.confidence > 0
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    CONFIDENCE: {Math.round(normalisationResult.confidence * 100)}%
                  </span>
                )}
              </div>

              {normalisationResult ? (
                <div className="space-y-4 text-xs">
                  {/* Results Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">
                        Normalized Locality
                      </span>
                      <span className="font-bold text-slate-100 text-sm">
                        {normalisationResult.normalized_locality || (
                          <span className="text-rose-400 font-normal italic">Unmapped / Unknown</span>
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">
                        Resolved Municipal Ward
                      </span>
                      <span className="font-mono font-bold text-sky-400 text-sm">
                        {normalisationResult.ward || (
                          <span className="text-slate-500 font-normal italic">No Ward Inferred</span>
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">
                        Operator Review Flag
                      </span>
                      <span className={`inline-block font-semibold mt-0.5 ${
                        normalisationResult.requires_review ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {normalisationResult.requires_review ? 'Requires Human Review' : 'Auto-Resolved'}
                      </span>
                    </div>
                  </div>

                  {/* Explainability Box */}
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                      Step-by-step Explainability Trace:
                    </span>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-200 leading-relaxed font-sans text-xs">
                      {normalisationResult.explanation}
                    </div>
                  </div>

                  {/* Matched Details */}
                  {normalisationResult.matched_alias && (
                    <div className="flex items-center gap-4 bg-slate-950/60 p-2.5 rounded border border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-500">Matched Term/Alias:</span>{' '}
                        <code className="text-sky-300 font-semibold">{normalisationResult.matched_alias}</code>
                      </div>
                    </div>
                  )}

                  {/* Competing Candidates (if ambiguous) */}
                  {normalisationResult.candidates && normalisationResult.candidates.length > 1 && (
                    <div>
                      <span className="text-[10px] uppercase font-mono text-amber-400 block mb-1">
                        Alternative Candidates Considered ({normalisationResult.candidates.length}):
                      </span>
                      <div className="space-y-1.5">
                        {normalisationResult.candidates.map((cand, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-500">#{idx + 1}</span>
                              <span className="font-semibold text-slate-200">{cand.locality}</span>
                              <span className="font-mono text-sky-400">({cand.ward || 'No Ward'})</span>
                              <span className="text-slate-500">via {cand.matchedOn}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-300">
                              {Math.round(cand.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw Output Payload */}
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                      Service Output Payload (JSON):
                    </span>
                    <pre className="p-2.5 bg-slate-950 rounded border border-slate-850 font-mono text-[10px] text-slate-400 overflow-x-auto">
                      {JSON.stringify(normalisationResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Enter a location in the left panel and run the normalisation pipeline to inspect the match trace.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: WARDS & LOCALITIES REGISTRY ================= */}
      {activeSubTab === 'wards' && (
        <div className="space-y-3">
          {wards.map((w) => (
            <div key={w.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                    {w.wardNumber}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-100">{w.wardName}</h4>
                  {w.zone && (
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                      {w.zone}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {w.localities?.length || 0} Localities
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {w.localities && w.localities.map((loc) => (
                  <div key={loc.id} className="p-3 bg-slate-950 rounded border border-slate-850 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-sm">{loc.name}</span>
                      {loc.latitude && loc.longitude && (
                        <span className="font-mono text-[10px] text-slate-500">
                          {loc.latitude.toFixed(3)}, {loc.longitude.toFixed(3)}
                        </span>
                      )}
                    </div>

                    {/* Aliases */}
                    {loc.aliases && loc.aliases.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                          Aliases ({loc.aliases.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {loc.aliases.map((a, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 text-[11px] border border-slate-800 font-mono">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hindi / Transliterated Spelling Variants */}
                    {loc.spellingVariants && loc.spellingVariants.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                          Spelling Variants (Hindi & English)
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {loc.spellingVariants.map((sv, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-purple-950/40 text-purple-300 text-[11px] border border-purple-800/40">
                              {sv}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Landmarks */}
                    {loc.landmarkTerms && loc.landmarkTerms.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                          Key Landmark Terms
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {loc.landmarkTerms.map((lm, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-sky-950/40 text-sky-300 text-[11px] border border-sky-800/40">
                              {lm}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TAB 3: OVERLAPPING ALIASES DETECTOR ================= */}
      {activeSubTab === 'overlaps' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Gazetteer Alias & Landmark Collisions
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {overlaps.length} Collisions Detected
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The collision detector identifies aliases, spelling variants, or landmark terms that appear in multiple different localities or municipal wards. Collisions produce ambiguity during triage and automatically flag complaints for human operator review.
          </p>

          {overlaps.length > 0 ? (
            <div className="space-y-2">
              {overlaps.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-slate-950 border border-amber-900/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-300 text-sm">
                        "{item.term}"
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {item.type}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Claimed by {item.occurrences.length} distinct localities:
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.occurrences.map((occ, oIdx) => (
                      <span
                        key={oIdx}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300"
                      >
                        {occ.localityName} ({occ.wardNumber})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950 rounded border border-slate-800 text-xs text-emerald-400 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>Zero alias collisions detected. Gazetteer terms are strictly unique.</span>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: IMPORT GAZETTEER ================= */}
      {activeSubTab === 'import' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <UploadCloud className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100">Import Partner Municipal Gazetteer</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Upload or paste partner gazetteer records in CSV or JSON format (<code>ward_id,ward_name,locality_name,aliases,spelling_variants,landmark_terms,latitude,longitude</code>). Multiple aliases or landmarks can be separated by semicolons (<code>;</code>).
          </p>

          <div className="border-2 border-dashed border-slate-750 rounded-lg p-4 text-center">
            <input
              type="file"
              accept=".csv,.json"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              id="gazetteer-file-input"
              className="hidden"
            />
            <label htmlFor="gazetteer-file-input" className="cursor-pointer block text-xs">
              <UploadCloud className="w-6 h-6 text-slate-500 mx-auto mb-1" />
              <span className="text-slate-300 font-medium">
                {file ? file.name : 'Select or drop partner gazetteer CSV or JSON'}
              </span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Or paste CSV / JSON content directly:
            </label>
            <textarea
              rows={4}
              value={rawCsv}
              onChange={(e) => setRawCsv(e.target.value)}
              placeholder={`ward_id,ward_name,locality_name,aliases,spelling_variants,landmark_terms\nWard 12,Arera North,Arera Colony,"Arera;Arera Main","अरेरा","10 No Market"`}
              className="w-full bg-slate-950 border border-slate-750 rounded p-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-sky-500"
            />
          </div>

          {importStatus && (
            <div className={`p-2.5 rounded text-xs ${
              importStatus.includes('Error')
                ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
            }`}>
              {importStatus}
            </div>
          )}

          <button
            onClick={handleImportGazetteer}
            disabled={importing || (!file && !rawCsv.trim())}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded shadow transition-colors disabled:opacity-50"
          >
            {importing ? 'Importing Gazetteer...' : 'Commit Gazetteer Ingestion'}
          </button>
        </div>
      )}
    </div>
  );
};
