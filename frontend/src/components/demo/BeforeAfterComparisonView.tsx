import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Building2,
  Tag,
  MapPin,
  Volume2,
  Camera,
  CheckCircle2,
  Copy,
  Layers,
  ShieldAlert,
  ShieldCheck,
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
    title: 'Severe Water Contamination & Pipeline Burst',
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
    title: 'Hazardous Road Pothole & Dark Streetlight',
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
    title: 'Solid Waste Accumulation & Animal Menace',
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
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                BEFORE / AFTER INTELLIGENCE TRANSFORMATION
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison between raw citizen grievances and structured municipal tickets grounded in Bhopal's gazetteer and taxonomy.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">Select Case:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded px-2.5 py-1 font-medium focus:border-blue-600"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
          {PRESETS.map((p) => {
            const isSelected = p.id === selectedCaseId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedCaseId(p.id)}
                className={`text-left p-2.5 rounded border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border-blue-400 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-0.5">
                  <span className="uppercase text-blue-700 font-bold">{p.channel}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                    {p.language}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {p.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* COLUMN 1: BEFORE (RAW CITIZEN INTAKE) */}
        <div className="bg-white border border-rose-200 rounded-md overflow-hidden shadow-xs flex flex-col">
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                BEFORE: Raw Citizen Intake (Unstructured)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
              {activeCase.raw.channel}
            </span>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between text-slate-500 font-mono text-[10px] mb-1 uppercase">
                <span>Original Grievance Text:</span>
                <span>{activeCase.raw.timestamp}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                {activeCase.raw.text}
              </div>
            </div>

            {activeCase.raw.mediaNote && (
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-200 text-slate-700">
                {activeCase.mediaType === 'audio' ? (
                  <Volume2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                )}
                <span className="text-[11px] font-mono">{activeCase.raw.mediaNote}</span>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1.5">
              <div className="text-[10px] font-mono font-bold text-slate-600 uppercase">
                Unstructured Data Bottlenecks:
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-600 font-bold">✗</span>
                  <span><strong>Exposed PII:</strong> Phone number/email exposed in plain text.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-600 font-bold">✗</span>
                  <span><strong>Unclassified:</strong> Department and category are completely unassigned.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-600 font-bold">✗</span>
                  <span><strong>Informal Location:</strong> Vague phrasing with no municipal ward ID.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-600 font-bold">✗</span>
                  <span><strong>No Urgency Metric:</strong> No objective score for dispatch priority.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* COLUMN 2: AFTER (STRUCTURED CIVIC INTELLIGENCE) */}
        <div className="bg-white border border-emerald-200 rounded-md overflow-hidden shadow-xs flex flex-col">
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                AFTER: Structured Municipal Intelligence
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold">
              {activeCase.structured.ticketId}
            </span>
          </div>

          <div className="p-4 space-y-3 text-xs">
            {/* Sanitized Summary */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Sanitized AI Summary:</span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 font-bold">
                  <ShieldCheck className="w-3 h-3" /> PII Protected
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-900 font-medium">
                {activeCase.structured.maskedSummary}
              </div>
            </div>

            {/* Department & Category */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase font-mono mb-0.5">
                  <Building2 className="w-3 h-3 text-blue-600" />
                  <span>Target Department</span>
                </div>
                <div className="font-bold text-blue-800 text-xs">
                  {activeCase.structured.taxonomy.department}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase font-mono mb-0.5">
                  <Tag className="w-3 h-3 text-emerald-600" />
                  <span>Category</span>
                </div>
                <div className="font-bold text-slate-900 text-xs truncate">
                  {activeCase.structured.taxonomy.category}
                </div>
              </div>
            </div>

            {/* Urgency & Location */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                <div className="text-[10px] font-mono uppercase text-slate-500 mb-0.5 font-semibold">
                  3-Criteria Urgency
                </div>
                <div className="font-mono font-bold text-xs text-rose-700">
                  {activeCase.structured.urgency.level} ({activeCase.structured.urgency.score}/100)
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  Safety: {activeCase.structured.urgency.safety}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-500 mb-0.5 font-semibold">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>Grounded Location</span>
                </div>
                <div className="font-bold text-slate-900 text-xs">
                  {activeCase.structured.location.normalizedLocality}
                </div>
                <div className="text-[10px] font-mono text-blue-700 font-semibold mt-0.5">
                  {activeCase.structured.location.assignedWard}
                </div>
              </div>
            </div>

            {/* Cluster Link & Draft */}
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-purple-700 font-semibold uppercase">
                  <Layers className="w-3 h-3" />
                  <span>Incident Cluster:</span>
                </div>
                <div className="text-[11px] text-slate-700 font-medium mt-0.5">
                  {activeCase.structured.cluster.status}
                </div>
              </div>
              <span className="font-mono text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {activeCase.structured.cluster.clusterId}
              </span>
            </div>

            {/* Operator Draft */}
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500">
                <span>Citizen Acknowledgement Draft:</span>
                <button
                  onClick={handleCopyDraft}
                  className="flex items-center gap-1 text-blue-700 font-semibold hover:underline cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedDraft ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-800 leading-snug">
                "{activeCase.structured.draftResponse}"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
