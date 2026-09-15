import React, { useState, useEffect } from 'react';
import { Ward, Locality, NormalisationResult, AliasOverlap } from '../../types';
import { api } from '../../services/api';
import {
  MapPin,
  Play,
  Layers,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const GazetteerManagementView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'tester' | 'wards' | 'overlaps' | 'import'>('tester');
  const [wards, setWards] = useState<Ward[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [overlaps, setOverlaps] = useState<AliasOverlap[]>([]);
  const [loading, setLoading] = useState(true);

  // Normaliser tester state
  const [testInput, setTestInput] = useState('near 10 No Market Arera Colony');
  const [normalising, setNormalising] = useState(false);
  const [normalisationResult, setNormalisationResult] = useState<NormalisationResult | null>(null);

  // Ingestion state
  const [rawCsv, setRawCsv] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    loadGazetteerData();
  }, []);

  const loadGazetteerData = async () => {
    setLoading(true);
    try {
      const [wardsData, locsData, overlapsData] = await Promise.all([
        api.getWards(),
        api.getLocalities(),
        api.getGazetteerOverlaps().catch(() => []),
      ]);
      setWards(wardsData);
      setLocalities(locsData);
      setOverlaps(overlapsData);
    } catch (err) {
      console.error('Error loading gazetteer reference data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunNormalisation = async (phrase?: string) => {
    const input = phrase || testInput;
    if (!input.trim()) return;

    setNormalising(true);
    try {
      const result = await api.normalizeLocation(input);
      setNormalisationResult(result);
    } catch (err) {
      console.error('Failed to run normalisation test:', err);
    } finally {
      setNormalising(false);
    }
  };

  const handleImportGazetteer = async () => {
    setImporting(true);
    setImportStatus(null);
    try {
      if (file) {
        const res = await api.importGazetteerCSV(file);
        setImportStatus(`Imported ${res.importedLocalities} localities across ${res.importedWards} wards successfully.`);
      } else if (rawCsv.trim()) {
        const res = await api.importGazetteerCSVText(rawCsv);
        setImportStatus(`Imported ${res.importedLocalities} localities across ${res.importedWards} wards successfully.`);
      }
      await loadGazetteerData();
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
    'near unknown location sector 99',
  ];

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-12 text-center text-xs text-slate-500 shadow-xs">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-slate-700 font-medium">Loading Bhopal municipal gazetteer registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Banner & Actions */}
      <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              BHOPAL MUNICIPAL LOCALITY GAZETTEER
            </h2>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {wards.length} Wards | {localities.length} Localities
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ground-truth municipal boundary registry, multilingual aliases, spelling variants, and landmark mapping.
          </p>
        </div>

        {/* Subtab Navigator */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveSubTab('tester')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'tester' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Normaliser Tester
          </button>
          <button
            onClick={() => setActiveSubTab('wards')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'wards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Wards & Localities ({wards.length})
          </button>
          <button
            onClick={() => setActiveSubTab('overlaps')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'overlaps' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Collisions ({overlaps.length})
          </button>
          <button
            onClick={() => setActiveSubTab('import')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'import' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Import Gazetteer
          </button>
        </div>
      </div>

      {/* ================= TAB 1: INTERACTIVE NORMALISER TESTER ================= */}
      {activeSubTab === 'tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Input & Testing Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Location Normaliser Tester
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Test how the deterministic engine resolves misspelled, Hindi, or landmark phrases into standardized wards.
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunNormalisation()}
                  placeholder="e.g. Near 10 No market or सर्वधर्म पुल..."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
                />

                <button
                  onClick={() => handleRunNormalisation()}
                  disabled={normalising || !testInput.trim()}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{normalising ? 'Normalising...' : 'RUN NORMALISATION PIPELINE'}</span>
                </button>
              </div>

              {/* Sample Presets */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1 font-semibold">
                  Sample Locations:
                </span>
                <div className="flex flex-wrap gap-1">
                  {sampleTestPhrases.map((phrase, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTestInput(phrase);
                        handleRunNormalisation(phrase);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] transition-colors cursor-pointer"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 flex items-start gap-2 shadow-xs">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="leading-snug text-[11px]">
                <strong>Explainability Rule:</strong> The engine never fabricates a ward when evidence is ambiguous or absent. If uncertain, it returns null for ward and flags for human operator review.
              </p>
            </div>
          </div>

          {/* Pipeline Explanation Output Column */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Normalisation Decision Trace
                  </h3>
                </div>
                {normalisationResult && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    normalisationResult.confidence >= 0.85
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : normalisationResult.confidence > 0
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    CONFIDENCE: {Math.round(normalisationResult.confidence * 100)}%
                  </span>
                )}
              </div>

              {normalisationResult ? (
                <div className="space-y-3 text-xs">
                  {/* Results Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">
                        Normalized Locality
                      </span>
                      <span className="font-bold text-slate-900 text-xs">
                        {normalisationResult.normalized_locality || (
                          <span className="text-rose-600 font-normal italic">Unmapped / Unknown</span>
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">
                        Resolved Ward
                      </span>
                      <span className="font-mono font-bold text-blue-700 text-xs">
                        {normalisationResult.ward || (
                          <span className="text-slate-400 font-normal italic">No Ward Inferred</span>
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">
                        Review Flag
                      </span>
                      <span className={`font-semibold ${
                        normalisationResult.requires_review ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        {normalisationResult.requires_review ? 'Review Required' : 'Auto-Resolved'}
                      </span>
                    </div>
                  </div>

                  {/* Explainability Box */}
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                      Step-by-step Grounding Trace:
                    </span>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 leading-relaxed font-sans text-xs">
                      {normalisationResult.explanation}
                    </div>
                  </div>

                  {/* Matched Details */}
                  {normalisationResult.matched_alias && (
                    <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px]">
                      <span className="text-slate-500">Matched Alias / Landmark:</span>{' '}
                      <code className="text-blue-700 font-bold">{normalisationResult.matched_alias}</code>
                    </div>
                  )}

                  {/* Alternative Candidates */}
                  {normalisationResult.candidates && normalisationResult.candidates.length > 1 && (
                    <div>
                      <span className="text-[10px] uppercase font-mono text-amber-700 block mb-1">
                        Alternative Candidates ({normalisationResult.candidates.length}):
                      </span>
                      <div className="space-y-1">
                        {normalisationResult.candidates.map((cand, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-slate-400">#{idx + 1}</span>
                              <span className="font-semibold text-slate-800">{cand.locality}</span>
                              <span className="font-mono text-blue-700">({cand.ward || 'No Ward'})</span>
                              <span className="text-slate-400">via {cand.matchedOn}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-700">
                              {Math.round(cand.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-10 text-center text-slate-400 text-xs">
                  Enter a location phrase on the left and run normalisation.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: WARDS & LOCALITIES REGISTRY ================= */}
      {activeSubTab === 'wards' && (
        <div className="space-y-2">
          {wards.map((w) => (
            <div key={w.id} className="bg-white border border-slate-200 rounded-md p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    {w.wardNumber}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{w.wardName}</h4>
                  {w.zone && (
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.2 rounded">
                      {w.zone}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {w.localities?.length || 0} Localities
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {w.localities && w.localities.map((loc) => (
                  <div key={loc.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{loc.name}</span>
                      {loc.latitude && loc.longitude && (
                        <span className="font-mono text-[10px] text-slate-400">
                          {loc.latitude.toFixed(3)}, {loc.longitude.toFixed(3)}
                        </span>
                      )}
                    </div>

                    {loc.aliases && loc.aliases.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {loc.aliases.map((a, i) => (
                          <span key={i} className="px-1 py-0.2 rounded bg-white text-slate-700 text-[10px] border border-slate-200 font-mono">
                            {a}
                          </span>
                        ))}
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
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Gazetteer Collision / Overlap Detector
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {overlaps.length} Collisions Detected
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Terms appearing in multiple wards produce ambiguity and automatically flag complaints for operator review.
          </p>

          {overlaps.length > 0 ? (
            <div className="space-y-1.5">
              {overlaps.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-slate-50 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-800">
                      "{item.term}"
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono">
                      {item.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {item.occurrences.map((occ, oIdx) => (
                      <span
                        key={oIdx}
                        className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-700"
                      >
                        {occ.localityName} ({occ.wardNumber})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-50 rounded border border-slate-200 text-xs text-emerald-700 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero collisions detected. All terms map unambiguously.</span>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: IMPORT GAZETTEER ================= */}
      {activeSubTab === 'import' && (
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-3 max-w-xl mx-auto">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Import Partner Municipal Gazetteer
            </h3>
          </div>

          <p className="text-xs text-slate-600">
            Upload CSV (<code>ward_id,ward_name,locality_name,aliases,spelling_variants,landmark_terms</code>) or paste CSV.
          </p>

          <div className="border-2 border-dashed border-slate-200 rounded p-3 text-center bg-slate-50">
            <input
              type="file"
              accept=".csv,.json"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              id="gazetteer-file-input"
              className="hidden"
            />
            <label htmlFor="gazetteer-file-input" className="cursor-pointer block text-xs">
              <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <span className="text-slate-700 font-medium">
                {file ? file.name : 'Select or drop gazetteer CSV file'}
              </span>
            </label>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase font-semibold mb-1">
              Or paste CSV data:
            </label>
            <textarea
              rows={4}
              value={rawCsv}
              onChange={(e) => setRawCsv(e.target.value)}
              placeholder={`ward_id,ward_name,locality_name,aliases,spelling_variants,landmark_terms\nWard 12,Arera North,Arera Colony,"Arera;Arera Main","अरेरा","10 No Market"`}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          {importStatus && (
            <div className={`p-2 rounded text-xs ${
              importStatus.includes('Error')
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {importStatus}
            </div>
          )}

          <button
            onClick={handleImportGazetteer}
            disabled={importing || (!file && !rawCsv.trim())}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {importing ? 'Importing Gazetteer...' : 'Commit Gazetteer Ingestion'}
          </button>
        </div>
      )}
    </div>
  );
};
