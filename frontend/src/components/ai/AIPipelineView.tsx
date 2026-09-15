import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AIProviderConfig, UnifiedPipelineOutput } from '../../types';
import {
  Cpu,
  Play,
  Layers,
  FileText,
  Mic,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  Sparkles,
  ShieldAlert,
  Navigation,
  Tag,
  Flame,
  Check,
} from 'lucide-react';

interface AIPipelineViewProps {
  onInspectComplaint?: (complaintId: string) => void;
  onPipelineExecuted?: () => void;
}

export const AIPipelineView: React.FC<AIPipelineViewProps> = ({
  onPipelineExecuted,
}) => {
  const [aiConfig, setAiConfig] = useState<AIProviderConfig | null>(null);

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
      if (onPipelineExecuted) onPipelineExecuted();
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
      if (onPipelineExecuted) onPipelineExecuted();
    } catch (err) {
      console.error('Batch AI processing error:', err);
    } finally {
      setBatchLoading(false);
    }
  };

  const samplePresets = [
    {
      label: 'Hindi Pipeline Burst',
      text: 'कोलार रोड पर सर्वधर्म पुल के पास मेन वॉटर पाइपलाइन फट गई है। सुबह 6 बजे से भारी मात्रा में पानी बह रहा है और पूरी सड़क पर जलभराव हो गया है।',
      type: 'NONE' as const,
      caption: '',
    },
    {
      label: 'Hinglish Pothole',
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
      label: 'Image + Caption',
      text: 'Bhadbhada road pole lamp fuse',
      type: 'IMAGE' as const,
      caption: 'Dark residential lane at night with completely non-functional streetlight pole',
    },
    {
      label: 'PII Test',
      text: 'Near 10 no market Arera colony House #42, drinking water not coming since yesterday. Call me on 9826012345.',
      type: 'NONE' as const,
      caption: '',
    },
    {
      label: 'Unmapped Location',
      text: 'near unknown hill junction far away in forest hills no landmark visible',
      type: 'NONE' as const,
      caption: '',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner: Integrated AI Processing Engine */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              INTEGRATED AI PROCESSING ENGINE
            </h2>
            {aiConfig && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {aiConfig.mode} ({aiConfig.model})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Multimodal complaint triage, classification, urgency scoring and location grounding.
          </p>
        </div>

        <button
          onClick={handleRunBatch}
          disabled={batchLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{batchLoading ? 'Processing Batch...' : 'Batch Process Queue'}</span>
        </button>
      </div>

      {batchResult && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Batch Processing Completed: {batchResult.successfullyProcessed} of {batchResult.totalBatched} complaints analyzed and routed.
            </span>
          </div>
          <button
            onClick={() => setBatchResult(null)}
            className="text-slate-500 hover:text-slate-800 text-xs font-mono cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Split Layout: Left Input / Right Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: INPUT */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Grievance Input Workspace
              </span>
              <span className="text-[10px] font-mono text-slate-400">INPUT CONSOLE</span>
            </div>

            {/* Quick Test Cases */}
            <div>
              <span className="text-[10px] font-mono text-slate-500 block mb-1.5 uppercase font-semibold">
                Quick Test Cases:
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
                    className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Mode Selector */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">
                Input Mode
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setMediaType('NONE')}
                  className={`py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    mediaType === 'NONE'
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Text</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMediaType('AUDIO')}
                  className={`py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    mediaType === 'AUDIO'
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMediaType('IMAGE')}
                  className={`py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    mediaType === 'IMAGE'
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Image</span>
                </button>
              </div>
            </div>

            {/* Complaint Text Input */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">
                Complaint Input
              </label>
              <textarea
                rows={4}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter citizen grievance in Hindi, Hinglish, or English..."
                className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-900 font-sans focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Optional Caption */}
            {mediaType !== 'NONE' && (
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">
                  Media Note / Attached Caption
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Photo taken near Sarvadharma bridge crossing"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={handleRunPipeline}
              disabled={processing || (!testText.trim() && !caption.trim())}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{processing ? 'Running AI Pipeline...' : 'RUN AI PIPELINE'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: AI PIPELINE RESULT */}
        <div className="lg:col-span-7">
          {pipelineOutput ? (
            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    AI Pipeline Execution Result
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    pipelineOutput.requires_human_review
                      ? 'bg-amber-50 text-amber-800 border border-amber-300'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {pipelineOutput.requires_human_review ? 'HUMAN REVIEW REQUIRED' : 'AUTO-RESOLVED'}
                </span>
              </div>

              {/* 7 Processing Stages */}
              <div className="space-y-2">
                {/* 1. Language Detection */}
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500 mb-1">
                    <span className="font-semibold">1. Language Detection</span>
                    <span className="text-emerald-700 font-bold">MATCHED</span>
                  </div>
                  <div className="text-slate-800 font-medium">
                    Language: <span className="font-mono uppercase font-bold text-slate-900">{pipelineOutput.language}</span>
                    {pipelineOutput.detected_vision_signals.length > 0 && (
                      <span className="ml-2 text-slate-500 font-mono">
                        (Vision: {pipelineOutput.detected_vision_signals.join(', ')})
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Privacy & PII */}
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500 mb-1">
                    <span className="font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-600" />
                      2. Citizen Privacy & PII
                    </span>
                    <span className={pipelineOutput.has_pii ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                      {pipelineOutput.has_pii ? 'MASKED' : 'CLEAN'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-800 bg-white p-1.5 rounded border border-slate-200">
                    {pipelineOutput.masked_text}
                  </div>
                </div>

                {/* 3. Complaint Understanding */}
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500 mb-1">
                    <span className="font-semibold">3. Complaint Understanding</span>
                    <span className="text-blue-700 font-bold font-mono">STRUCTURED</span>
                  </div>
                  <p className="font-medium text-slate-900">{pipelineOutput.summary}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pipelineOutput.keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.2 rounded bg-white text-slate-700 font-mono text-[10px] border border-slate-200"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Department Classification */}
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500 mb-1">
                    <span className="font-semibold">4. Department & Category Classification</span>
                    <span className="text-blue-700 font-mono font-bold">
                      {(pipelineOutput.classification_confidence * 100).toFixed(0)}% CONFIDENCE
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-800 pt-0.5">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Department</span>
                      <strong className="text-blue-800">{pipelineOutput.department || 'Unassigned'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Category</span>
                      <strong className="text-slate-900">{pipelineOutput.category || 'Unassigned'}</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1 italic">
                    Reason: {pipelineOutput.classification_reason}
                  </p>
                </div>

                {/* 5. Urgency Assessment */}
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500 mb-1">
                    <span className="font-semibold">5. Urgency Assessment</span>
                    <span
                      className={`font-mono font-bold ${
                        pipelineOutput.urgency === 'CRITICAL'
                          ? 'text-rose-700'
                          : pipelineOutput.urgency === 'HIGH'
                          ? 'text-amber-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {pipelineOutput.urgency} (SCORE: {pipelineOutput.urgency_score.toFixed(2)})
                    </span>
                  </div>
                  <div className="space-y-0.5 text-slate-600 text-[11px]">
                    {pipelineOutput.urgency_evidence.map((ev, idx) => (
                      <div key={idx} className="font-mono text-[10px]">
                        • {ev}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Location Grounding */}
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500 mb-1">
                    <span className="font-semibold">6. Location Grounding (Gazetteer)</span>
                    <span className="text-blue-700 font-mono font-bold">
                      {(pipelineOutput.locality_confidence * 100).toFixed(0)}% CONFIDENCE
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-800 pt-0.5 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Normalized Locality:</span>{' '}
                      <strong className="text-slate-900">{pipelineOutput.locality || 'Unknown'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Resolved Ward:</span>{' '}
                      <strong className="text-slate-900">{pipelineOutput.ward || 'No Ward Inferred'}</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1 font-sans">
                    {pipelineOutput.locality_explanation}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-md p-10 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1 shadow-xs">
              <Cpu className="w-8 h-8 text-slate-300 mb-1" />
              <p className="text-slate-800 font-semibold">AI Pipeline Workspace Ready</p>
              <p className="text-slate-500 text-[11px] max-w-xs">
                Select a preset on the left or enter custom text and click "RUN AI PIPELINE".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
