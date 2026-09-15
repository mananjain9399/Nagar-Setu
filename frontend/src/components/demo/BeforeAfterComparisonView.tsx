import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Building2,
  Tag,
  MapPin,
  Clock,
  Volume2,
  Camera,
  CheckCircle2,
  Copy,
  Layers,
  Fingerprint,
  RefreshCw,
} from 'lucide-react';

interface PresetCase {
  id: string;
  title: string;
  channel: string;
  language: string;
  mediaType: 'text' | 'audio' | 'image';
  raw: {
    text: string;
    sender: string;
    channel: string;
    timestamp: string;
    mediaNote?: string;
  };
  structured: {
    ticketId: string;
    maskedSummary: string;
    languageDetected: string;
    transcription?: {
      text: string;
      confidence: number;
      flagged: boolean;
    };
    visionSignals?: {
      labels: string[];
      confidence: number;
    };
    piiSummary: {
      hasPII: boolean;
      maskedTypes: string[];
    };
    taxonomy: {
      department: string;
      category: string;
      confidence: number;
      reason: string;
    };
    urgency: {
      level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      score: number;
      safety: string;
      outage: string;
      duration: string;
    };
    location: {
      raw: string;
      normalizedLocality: string;
      assignedWard: string;
      confidence: number;
      isAmbiguous: boolean;
    };
    cluster: {
      clusterId: string;
      duplicateScore: number;
      clusterSize: number;
      status: string;
    };
    draftResponse: string;
  };
}

const PRESETS: PresetCase[] = [
  {
    id: 'case-water-leak',
    title: 'Severe Water Contamination & Main Pipeline Rupture',
    channel: 'CM_HELPLINE_181',
    language: 'Hindi',
    mediaType: 'audio',
    raw: {
      text: 'हमारे यहाँ जोन 4 एमपी नगर जोन 2 में पिछले 4 दिन से गंदा पानी आ रहा है और मुख्य पाइपलाइन फूट गई है। सड़क पर पानी भर गया है। कृपया रमेश कुमार को 9826012345 पर कॉल करें।',
      sender: 'Ramesh Kumar (9826012345)',
      channel: 'CM Helpline 181 (Audio Export)',
      timestamp: 'Today, 08:30 AM',
      mediaNote: 'Audio recording: 42s MP3 (Hindi dialect speech)',
    },
    structured: {
      ticketId: 'BMC-2026-09281',
      maskedSummary: 'MP Nagar Zone-II main water pipeline rupture and drinking water contamination for 4 days',
      languageDetected: 'Hindi (Devanagari)',
      transcription: {
        text: 'हमारे यहाँ जोन 4 एमपी नगर जोन 2 में पिछले 4 दिन से गंदा पानी आ रहा है और मुख्य पाइपलाइन फूट गई है...',
        confidence: 0.94,
        flagged: false,
      },
      piiSummary: {
        hasPII: true,
        maskedTypes: ['Phone (+91 98260***** masked)', 'Citizen Name anonymized in public logs'],
      },
      taxonomy: {
        department: 'Water Works & Supply',
        category: 'Pipeline Leakage & Ruptures',
        confidence: 0.95,
        reason: 'Detected primary terms: "गंदा पानी", "मुख्य पाइपलाइन फूट गई", "पानी भर गया". High municipal risk.',
      },
      urgency: {
        level: 'CRITICAL',
        score: 95,
        safety: 'Contaminated water supply poses acute cholera/diarrheal pathogen risk to residential cluster.',
        outage: 'Active pipeline burst disrupting ward drinking supply.',
        duration: '4 days (explicitly stated in complaint text).',
      },
      location: {
        raw: 'जोन 4 एमपी नगर जोन 2',
        normalizedLocality: 'MP Nagar Zone-II',
        assignedWard: 'Ward 28',
        confidence: 0.98,
        isAmbiguous: false,
      },
      cluster: {
        clusterId: 'CLUSTER-WTR-28-091',
        duplicateScore: 0.88,
        clusterSize: 4,
        status: 'Linked to existing water pipeline incident cluster',
      },
      draftResponse:
        'प्रिय नागरिक, आपका शिकायत संदर्भ क्रमांक BMC-2026-09281 जल कार्य विभाग (वार्ड 28, एमपी नगर) को त्वरित जांच हेतु प्रेषित किया गया है।',
    },
  },
  {
    id: 'case-pothole-light',
    title: 'Hazardous Road Pothole with Broken Streetlight',
    channel: 'SOCIAL_MEDIA',
    language: 'Hinglish',
    mediaType: 'image',
    raw: {
      text: 'Bittan market main road pe dangerous deep gaddha hai and streetlights bhi off hai. Kal raat 2 two-wheelers slip ho gaye. Aadhaar 4829-1029-3841 for reference. Fix before fatal accident!',
      sender: 'Citizen via Twitter/X export',
      channel: 'Social Media Export',
      timestamp: 'Yesterday, 10:15 PM',
      mediaNote: 'Photograph: 1.8MB JPEG showing pothole waterlogged under unlit pole',
    },
    structured: {
      ticketId: 'BMC-2026-09282',
      maskedSummary: 'Hazardous deep pothole and malfunctioning streetlight causing vehicle skids on Bittan Market road',
      languageDetected: 'Hinglish (Latin script)',
      visionSignals: {
        labels: ['Pothole / Road Depression (0.93)', 'Damaged/Unlit Street Pole (0.87)', 'Vehicle Skidding Hazard (0.82)'],
        confidence: 0.91,
      },
      piiSummary: {
        hasPII: true,
        maskedTypes: ['Aadhaar pattern (XXXX-XXXX-3841 masked)'],
      },
      taxonomy: {
        department: 'Roads & Civil Infrastructure',
        category: 'Potholes & Road Repairs',
        confidence: 0.92,
        reason: 'Detected primary terms: "deep gaddha", "pothole", "slip ho gaye". Secondary cross-department signal for Street Lighting.',
      },
      urgency: {
        level: 'HIGH',
        score: 85,
        safety: 'Direct vehicular safety hazard with recorded two-wheeler skids under dark street conditions.',
        outage: 'Arterial road surface integrity compromised.',
        duration: 'Multiple incidents noted since previous night.',
      },
      location: {
        raw: 'Bittan market main road',
        normalizedLocality: 'Bittan Market',
        assignedWard: 'Ward 45',
        confidence: 0.96,
        isAmbiguous: false,
      },
      cluster: {
        clusterId: 'CLUSTER-RD-45-014',
        duplicateScore: 0.76,
        clusterSize: 2,
        status: 'Potential duplicate with existing Bittan Market road repair ticket',
      },
      draftResponse:
        'Dear Citizen, complaint BMC-2026-09282 regarding road surface repair at Bittan Market (Ward 45) has been routed to Roads & Civil Infrastructure.',
    },
  },
  {
    id: 'case-garbage-shahpura',
    title: 'Overflowing Garbage Dump & Stray Dog Menace',
    channel: 'MUNICIPAL_APP',
    language: 'English',
    mediaType: 'text',
    raw: {
      text: 'Massive solid waste accumulation at Sector A Shahpura near community park for 6 days. Stray dogs ripping open bags across the road. Please dispatch garbage tipper truck urgently. Email: resident.shahpura@gmail.com',
      sender: 'App User (resident.shahpura@gmail.com)',
      channel: 'Bhopal 311 App Export',
      timestamp: 'Today, 06:45 AM',
    },
    structured: {
      ticketId: 'BMC-2026-09283',
      maskedSummary: 'Solid waste accumulation and stray animal disturbance at Sector A Shahpura near community park',
      languageDetected: 'English',
      piiSummary: {
        hasPII: true,
        maskedTypes: ['Email (r***@gmail.com masked)'],
      },
      taxonomy: {
        department: 'Solid Waste & Sanitation',
        category: 'Garbage Dump & Waste Collection',
        confidence: 0.96,
        reason: 'Explicit terms: "solid waste accumulation", "garbage dump", "tipper truck". Cross-department note: Stray Animal Control.',
      },
      urgency: {
        level: 'MEDIUM',
        score: 65,
        safety: 'Vector attraction and stray animal aggregation; secondary health concern.',
        outage: 'Routine doorstep collection missed in sub-sector.',
        duration: '6 days (explicitly stated in citizen text).',
      },
      location: {
        raw: 'Sector A Shahpura near community park',
        normalizedLocality: 'Shahpura Sector-A',
        assignedWard: 'Ward 52',
        confidence: 0.94,
        isAmbiguous: false,
      },
      cluster: {
        clusterId: 'CLUSTER-SWM-52-109',
        duplicateScore: 0.89,
        clusterSize: 6,
        status: 'Active hotspot cluster (6 complaints in 48 hours for Shahpura Sector A)',
      },
      draftResponse:
        'Dear Citizen, complaint BMC-2026-09283 regarding waste clearance at Shahpura Sector A (Ward 52) has been queued for morning sanitation beat.',
    },
  },
  {
    id: 'case-ambiguous-audio',
    title: 'Low-Confidence Ambiguous Audio (Operator Review Flagged)',
    channel: 'CM_HELPLINE_181',
    language: 'Hindi (Muffled)',
    mediaType: 'audio',
    raw: {
      text: '...गली में तार टूट गया है... पानी भी... (अस्पष्ट आवाज)',
      sender: 'Anonymous Caller (CM Helpline 181 Audio Export)',
      channel: 'CM Helpline 181',
      timestamp: 'Today, 11:20 AM',
      mediaNote: 'Audio recording: 14s (Signal-to-noise ratio low, background traffic noise)',
    },
    structured: {
      ticketId: 'BMC-2026-09284',
      maskedSummary: 'Potential wire breakage or water issue with low-confidence audio requiring human operator review',
      languageDetected: 'Hindi (Low SNR)',
      transcription: {
        text: '...गली में तार टूट गया है... पानी भी...',
        confidence: 0.42,
        flagged: true,
      },
      piiSummary: {
        hasPII: false,
        maskedTypes: [],
      },
      taxonomy: {
        department: 'Street Lighting & Electricals',
        category: 'Live Wire / Electrical Hazard',
        confidence: 0.54,
        reason: 'Possible wire breakage detected ("तार टूट गया"), but high ambiguity between electrical wire and water pipe.',
      },
      urgency: {
        level: 'HIGH',
        score: 80,
        safety: 'Potential live overhead wire snap hazard in residential lane; prioritized precautionary review.',
        outage: 'Local supply interruption uncertain.',
        duration: 'Data unavailable (not stated).',
      },
      location: {
        raw: 'गली में',
        normalizedLocality: 'Indeterminate (Ambiguous)',
        assignedWard: 'Requires Operator Clarification',
        confidence: 0.2,
        isAmbiguous: true,
      },
      cluster: {
        clusterId: 'UNCLUSTERED',
        duplicateScore: 0.0,
        clusterSize: 1,
        status: 'Cannot cluster due to indeterminate location coordinates',
      },
      draftResponse:
        'नागरिक महोदय, आपकी शिकायत में स्थान की सटीक जानकारी स्पष्ट नहीं है। कृपया नजदीकी लैंडमार्क या वार्ड संख्या दर्ज करवाएं।',
    },
  },
];

export const BeforeAfterComparisonView: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(PRESETS[0].id);
  const activeCase = PRESETS.find((c) => c.id === selectedCaseId) || PRESETS[0];
  const [copiedDraft, setCopiedDraft] = useState(false);

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(activeCase.structured.draftResponse);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-100">
                AI Pipeline: Before vs After Transformation Demo
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded font-mono font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                INTERACTIVE COMPARISON
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Inspect how messy, multilingual, unstructured citizen complaints (raw text, dialect audio, or photos) are converted into structured, audited municipal tickets grounded strictly in the Bhopal gazetteer and partner taxonomy.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Select Test Preset:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              aria-label="Select test preset comparison"
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.language})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preset Selector Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-5 pt-5 border-t border-slate-800">
          {PRESETS.map((p) => {
            const isSelected = p.id === selectedCaseId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedCaseId(p.id)}
                className={`text-left p-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-600 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-mono uppercase">{p.channel}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {p.language}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {p.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ================= COLUMN 1: BEFORE (RAW CITIZEN INTAKE) ================= */}
        <div className="bg-slate-900/90 border border-rose-900/40 rounded-xl overflow-hidden shadow-sm flex flex-col">
          {/* Header */}
          <div className="bg-rose-950/50 border-b border-rose-800/40 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-sm font-bold text-rose-200 uppercase tracking-wide">
                BEFORE: Raw Citizen Intake (Unstructured)
              </h3>
            </div>
            <span className="text-xs font-mono text-rose-300 bg-rose-900/40 px-2 py-0.5 rounded border border-rose-700/50">
              CHANNEL: {activeCase.raw.channel}
            </span>
          </div>

          <div className="p-5 space-y-4 text-xs">
            {/* Raw Text Box */}
            <div>
              <div className="flex items-center justify-between text-slate-400 font-medium mb-1.5">
                <span>Original Citizen Text (Direct Export):</span>
                <span className="font-mono text-[11px] text-slate-500">
                  {activeCase.raw.timestamp}
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 font-mono text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                {activeCase.raw.text}
              </div>
            </div>

            {/* Media Attachment Note */}
            {activeCase.raw.mediaNote && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
                {activeCase.mediaType === 'audio' ? (
                  <Volume2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                ) : (
                  <Camera className="w-4 h-4 text-sky-400 flex-shrink-0" />
                )}
                <span className="text-[11px] font-mono">{activeCase.raw.mediaNote}</span>
              </div>
            )}

            {/* Raw Citizen Deficiencies Checklist */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Unstructured Data Bottlenecks:
              </div>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>
                    <strong className="text-slate-300">Exposed PII:</strong> Phone number, email, or Aadhaar unmasked in database.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>
                    <strong className="text-slate-300">Unclassified:</strong> Department and category are completely unassigned.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>
                    <strong className="text-slate-300">Informal Location:</strong> Informal phrasing with no standardized ward ID.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>
                    <strong className="text-slate-300">No Priority Metric:</strong> No objective urgency score for dispatchers.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>
                    <strong className="text-slate-300">No Duplicate Awareness:</strong> Multiple callers clog up call centers for same issue.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: AFTER (STRUCTURED CIVIC ENGINE INTELLIGENCE) ================= */}
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-xl overflow-hidden shadow-sm flex flex-col">
          {/* Header */}
          <div className="bg-emerald-950/50 border-b border-emerald-800/40 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-200 uppercase tracking-wide">
                AFTER: Structured Civic Engine Intelligence
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-700/50">
              {activeCase.structured.ticketId}
            </span>
          </div>

          <div className="p-5 space-y-4 text-xs">
            {/* 1. Masked Summary & PII */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Sanitized AI Summary:</span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> PII Protected
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-medium">
                {activeCase.structured.maskedSummary}
              </div>
              {activeCase.structured.piiSummary.hasPII && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeCase.structured.piiSummary.maskedTypes.map((pt, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/70 text-amber-300 border border-amber-800/60"
                    >
                      🛡️ {pt}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Multimodal Vision / Audio Extraction */}
            {(activeCase.structured.transcription || activeCase.structured.visionSignals) && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  Multimodal Intake Signals
                </div>
                {activeCase.structured.transcription && (
                  <div className="text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Audio Transcription Confidence:</span>
                      <span
                        className={`font-mono font-bold ${
                          activeCase.structured.transcription.confidence < 0.6
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {(activeCase.structured.transcription.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    {activeCase.structured.transcription.flagged && (
                      <div className="p-1.5 rounded bg-amber-950/60 border border-amber-800/50 text-amber-300 text-[10px] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        Flagged for human operator review (low acoustic confidence)
                      </div>
                    )}
                  </div>
                )}
                {activeCase.structured.visionSignals && (
                  <div className="space-y-1 pt-1">
                    <div className="text-slate-400 text-[11px]">Civic Vision Detections:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeCase.structured.visionSignals.labels.map((lbl, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800"
                        >
                          📷 {lbl}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Taxonomy Routing & Grounded Evidence */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Target Department:</span>
                </div>
                <div className="text-xs font-bold text-slate-100">
                  {activeCase.structured.taxonomy.department}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Confidence: {(activeCase.structured.taxonomy.confidence * 100).toFixed(0)}%
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  <span>Category:</span>
                </div>
                <div className="text-xs font-bold text-slate-100 truncate">
                  {activeCase.structured.taxonomy.category}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {activeCase.structured.taxonomy.reason}
                </div>
              </div>
            </div>

            {/* 4. Strict 3-Criteria Urgency Scoring */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Strict 3-Criteria Urgency
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    activeCase.structured.urgency.level === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : activeCase.structured.urgency.level === 'HIGH'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}
                >
                  {activeCase.structured.urgency.level} ({activeCase.structured.urgency.score}/100)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-500 uppercase font-semibold">1. Safety:</div>
                  <div className="text-slate-300 mt-0.5 leading-snug">{activeCase.structured.urgency.safety}</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-500 uppercase font-semibold">2. Outage:</div>
                  <div className="text-slate-300 mt-0.5 leading-snug">{activeCase.structured.urgency.outage}</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-500 uppercase font-semibold">3. Duration:</div>
                  <div className="text-slate-300 mt-0.5 leading-snug">{activeCase.structured.urgency.duration}</div>
                </div>
              </div>
            </div>

            {/* 5. Locality Normalisation & Ward Grounding */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Grounded Locality & Ward:</span>
                </div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">
                  {activeCase.structured.location.normalizedLocality}
                  {activeCase.structured.location.assignedWard && (
                    <span className="ml-2 font-mono text-emerald-400">
                      ({activeCase.structured.location.assignedWard})
                    </span>
                  )}
                </div>
              </div>
              <div>
                {activeCase.structured.location.isAmbiguous ? (
                  <span className="px-2 py-1 rounded bg-amber-950 text-amber-300 text-[10px] font-mono border border-amber-800">
                    Locality Ambiguous
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-800">
                    Gazetteer Matched
                  </span>
                )}
              </div>
            </div>

            {/* 6. Semantic Duplicate & Cluster Detection */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Incident Cluster Link:</span>
                </div>
                <div className="text-xs font-medium text-slate-300 mt-0.5">
                  {activeCase.structured.cluster.status}
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[11px] font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  {activeCase.structured.cluster.clusterId}
                </span>
              </div>
            </div>

            {/* 7. Operator-Controlled Acknowledgement Draft */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="font-semibold text-slate-300">Draft Citizen Acknowledgement (Read-Only):</span>
                <button
                  onClick={handleCopyDraft}
                  className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300"
                >
                  <Copy className="w-3 h-3" />
                  {copiedDraft ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-sans text-slate-300 text-xs leading-relaxed">
                "{activeCase.structured.draftResponse}"
              </div>
              <p className="text-[10px] text-slate-500 italic">
                * Note: System never sends live SMS/WhatsApp messages. Draft is generated for operator review & copy only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
