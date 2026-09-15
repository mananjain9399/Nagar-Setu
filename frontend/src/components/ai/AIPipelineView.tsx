import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AIProviderConfig, UnifiedPipelineOutput } from '../../types';
import {
  Cpu,
  Play,
  Layers,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Mic,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AIPipelineViewProps {
  onInspectComplaint?: (complaintId: string) => void;
  onPipelineExecuted?: () => void;
}

export const AIPipelineView: React.FC<AIPipelineViewProps> = ({
  onInspectComplaint,
  onPipelineExecuted,
}) => {
  const [aiConfig, setAiConfig] = useState<AIProviderConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Playground state
  const [testText, setTestText] = useState(
    'Kolar road sarvadharma pul ke paas main water pipeline phat gayi hai paani sadak par beh raha hai subah 6 baje se'
  );
  const [mediaType, setMediaType] = useState<'NONE' | 'AUDIO' | 'IMAGE'>('NONE');
  const [caption, setCaption] = useState('');
  const [processing, setProcessing] = useState(false);
  const [pipelineOutput, setPipelineOutput] = useState<UnifiedPipelineOutput | null>(null);

  // Batch state
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<any | null>(null);

  useEffect(() => {
    loadAIStatus();
  }, []);

  const loadAIStatus = async () => {
    try {
      const data = await api.getAIStatus();
      setAiConfig(data);
    } catch (err) {
      console.error('Failed to load AI status:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleRunPipeline = async () => {
    if (!testText.trim() && !caption.trim()) return;
    setProcessing(true);
    setPipelineOutput(null);
    try {
      const res = await api.analyzeRawTextWithAI({
        rawText: testText,
        mediaType: mediaType === 'NONE' ? undefined : mediaType,
        caption: caption || undefined,
      });
      setPipelineOutput(res);
    } catch (err) {
      console.error('Pipeline execution error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRunBatch = async () => {
    setBatchLoading(true);
    setBatchResult(null);
    try {
      const res = await api.batchProcessAI(20);
      setBatchResult(res);
    } catch (err) {
      console.error('Batch AI processing error:', err);
    } finally {
      setBatchLoading(false);
    }
  };

  const samplePresets = [
    {
      label: 'Hindi Pipeline Burst (Critical)',
      text: 'कोलार रोड पर सर्वधर्म पुल के पास मेन वॉटर पाइपलाइन फट गई है। सुबह 6 बजे से भारी मात्रा में पानी बह रहा है और पूरी सड़क पर जलभराव हो गया है।',
      type: 'NONE' as const,
      caption: '',
    },
    {
      label: 'Hinglish Pothole (Safety Risk)',
      text: 'MP nagar zone 1 me bada pothole hai sadak par, bike wale slip ho rahe hain bahut khatra hai.',
      type: 'NONE' as const,
      caption: '',
    },
    {
      label: 'Audio Voice Complaint',
      text: 'नाली का गंदा पानी सड़क पर बह रहा है, बदबू से सांस लेना मुश्किल है।',
      type: 'AUDIO' as const,
      caption: 'Voice note recorded by resident via municipal app',
    },
    {
      label: 'Image + Caption (Streetlight)',
      text: 'Bhadbhada road pole lamp fuse',
      type: 'IMAGE' as const,
      caption: 'Dark residential lane at night with completely non-functional streetlight pole',
    },
    {
      label: 'PII Test (Phone + House Number)',
      text: 'Near 10 no market Arera colony House #42, drinking water not coming since yesterday. Call me on 9826012345.',
      type: 'NONE' as const,
      caption: '',
    },
    {
      label: 'Unmapped Location (Responsible AI)',
      text: 'near unknown hill junction far away in forest hills no landmark visible',
      type: 'NONE' as const,
      caption: '',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Status & Batch Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-slate-100">Integrated AI Processing Engine</h2>
            {aiConfig && (
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  aiConfig.mode === 'LIVE_AI'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}
              >
                MODE: {aiConfig.mode} ({aiConfig.model})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multimodal intake (Text, Voice, Image) with Hindi/English/Hinglish language detection, partner taxonomy classification, urgency grading, and gazetteer grounding.
          </p>
        </div>

        <button
          onClick={handleRunBatch}
          disabled={batchLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded shadow transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{batchLoading ? 'Processing Batch...' : 'Batch Process Queue'}</span>
        </button>
      </div>

      {batchResult && (
        <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-lg text-xs text-sky-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>
              Batch Processing Completed: {batchResult.successfullyProcessed} of {batchResult.totalBatched} unprocessed complaints analyzed and routed.
            </span>
          </div>
          <button
            onClick={() => setBatchResult(null)}
            className="text-slate-400 hover:text-slate-200 text-xs font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Interactive Playground & Quick Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Intake Controls & Presets */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                1. Multimodal Intake Input
              </span>
              <span className="text-[10px] font-mono text-slate-400">Interactive Triage</span>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 block mb-1.5 uppercase">
                Quick Test Cases (SIH / Demo Presets)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTestText(preset.text);
                      setMediaType(preset.type);
                      setCaption(preset.caption);
                      setPipelineOutput(null);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-sky-600 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Type Selector */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Grievance Channel Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMediaType('NONE')}
                  className={`py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 border transition-colors ${
                    mediaType === 'NONE'
                      ? 'bg-sky-600/30 border-sky-500 text-sky-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Text Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMediaType('AUDIO')}
                  className={`py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 border transition-colors ${
                    mediaType === 'AUDIO'
                      ? 'bg-sky-600/30 border-sky-500 text-sky-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice / Audio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMediaType('IMAGE')}
                  className={`py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 border transition-colors ${
                    mediaType === 'IMAGE'
                      ? 'bg-sky-600/30 border-sky-500 text-sky-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Image + Note</span>
                </button>
              </div>
            </div>

            {/* Raw Text Input */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                {mediaType === 'AUDIO' ? 'Simulated Audio Transcript / Spoken Utterance' : 'Grievance Text (Hindi, Hinglish, or English)'}
              </label>
              <textarea
                rows={4}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter unstructured civic grievance description..."
                className="w-full bg-slate-950 border border-slate-750 rounded p-2.5 text-xs text-slate-100 font-sans focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Optional Caption */}
            {mediaType !== 'NONE' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Citizen Media Caption / Attachment Reference
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Photo taken near Sarvadharma bridge crossing"
                  className="w-full bg-slate-950 border border-slate-750 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:border-sky-500"
                />
              </div>
            )}

            <button
              onClick={handleRunPipeline}
              disabled={processing || (!testText.trim() && !caption.trim())}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{processing ? 'Running 7-Stage Pipeline...' : 'Run Complete AI Pipeline'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: 7-Stage Step-by-Step Pipeline Trace */}
        <div className="lg:col-span-7">
          {pipelineOutput ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">
                    Execution Trace: 7-Stage Processing Pipeline
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    pipelineOutput.requires_human_review
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {pipelineOutput.requires_human_review ? 'HUMAN REVIEW REQUIRED' : 'AUTO-CLEARED'}
                </span>
              </div>

              {/* STAGES BREAKDOWN */}
              <div className="space-y-3">
                {/* Stage 1: Multimodal Intake & Language */}
                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase">
                    <span>Stage 1: Multimodal Intake & Language Identification</span>
                    <span className="text-sky-400 font-bold">COMPLETED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Detected Language:</span>
                      <span className="font-mono font-bold uppercase text-slate-200">
                        {pipelineOutput.language}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Vision Signals:</span>
                      <span className="font-mono text-slate-200">
                        {pipelineOutput.detected_vision_signals.length > 0
                          ? pipelineOutput.detected_vision_signals.join(', ')
                          : 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stage 2: PII Safeguards */}
                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      Stage 2: Citizen Privacy Safeguards & PII Flagging
                    </span>
                    <span className={pipelineOutput.has_pii ? 'text-amber-400' : 'text-emerald-400 font-bold'}>
                      {pipelineOutput.has_pii ? 'PII DETECTED & MASKED' : 'CLEAN'}
                    </span>
                  </div>
                  <div className="pt-1 text-slate-300 font-mono text-[11px] bg-slate-900 p-2 rounded border border-slate-800">
                    {pipelineOutput.masked_text}
                  </div>
                </div>

                {/* Stage 3: Issue Extraction */}
                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase">
                    <span>Stage 3: Issue Extraction & Civic Signals</span>
                    <span className="text-sky-400 font-bold">COMPLETED</span>
                  </div>
                  <p className="text-slate-200 font-semibold">{pipelineOutput.summary}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {pipelineOutput.keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-800"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stage 4: Partner Taxonomy Routing */}
                <div className="p-3 rounded bg-slate-950 border border-sky-900/40 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase">
                    <span>Stage 4: Department & Category Classification (Partner Taxonomy)</span>
                    <span className="text-sky-400 font-mono font-bold">
                      {(pipelineOutput.classification_confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-200 pt-1">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Department:</span>
                      <span className="font-bold text-sky-300">
                        {pipelineOutput.department || 'Unassigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Category:</span>
                      <span className="font-medium text-slate-200">
                        {pipelineOutput.category || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 italic">
                    Reason: {pipelineOutput.classification_reason}
                  </p>
                </div>

                {/* Stage 5: Urgency Scoring */}
                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase">
                    <span>Stage 5: Urgency Scoring (Safety + Outage + Duration)</span>
                    <span
                      className={`font-mono font-bold ${
                        pipelineOutput.urgency === 'CRITICAL'
                          ? 'text-rose-400'
                          : pipelineOutput.urgency === 'HIGH'
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {pipelineOutput.urgency} (Score: {pipelineOutput.urgency_score.toFixed(2)})
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-300 text-[11px] pt-1">
                    {pipelineOutput.urgency_evidence.map((ev, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="text-slate-500">•</span>
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stage 6: Gazetteer Locality Grounding */}
                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase">
                    <span>Stage 6: Locality & Ward Normalisation (Gazetteer Grounding)</span>
                    <span className="text-sky-400 font-mono font-bold">
                      {(pipelineOutput.locality_confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-200 pt-1 font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Normalized Locality:</span>
                      <span className="font-bold text-slate-100">
                        {pipelineOutput.locality || 'Unmapped / Unknown'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Assigned Ward:</span>
                      <span className="font-bold text-slate-100">
                        {pipelineOutput.ward || 'No Ward Inferred'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    {pipelineOutput.locality_explanation}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <Cpu className="w-8 h-8 text-slate-700" />
              <p className="text-slate-400 font-medium">No pipeline output generated yet.</p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Select a preset on the left or enter a custom grievance text and click "Run Complete AI Pipeline".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
