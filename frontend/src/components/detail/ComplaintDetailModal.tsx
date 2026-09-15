import React, { useState, useEffect } from 'react';
import { Complaint, Department, ReviewDecision } from '../../types';
import { api } from '../../services/api';
import {
  UrgencyBadge,
  ChannelBadge,
  StatusBadge,
  DuplicateBadge,
} from '../common/Badges';
import {
  X,
  Copy,
  Check,
  FileText,
  Cpu,
  Layers,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  Image as ImageIcon,
  ExternalLink,
  Info,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaintId: string;
  departments: Department[];
  wards: string[];
  localities: string[];
  onClose: () => void;
  onReviewSubmitted: (updated: Complaint) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaintId,
  departments,
  wards,
  localities,
  onClose,
  onReviewSubmitted,
}) => {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Review Form state
  const [reviewedBy, setReviewedBy] = useState('Operator-BPL-ZoneHQ');
  const [decision, setDecision] = useState<ReviewDecision>('ACCEPTED');
  const [comments, setComments] = useState('');
  const [modifiedDept, setModifiedDept] = useState('');
  const [modifiedCat, setModifiedCat] = useState('');
  const [modifiedUrgency, setModifiedUrgency] = useState('');
  const [modifiedWard, setModifiedWard] = useState('');
  const [modifiedLocality, setModifiedLocality] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  // Acknowledgement drafts state
  const [activeDraftIndex, setActiveDraftIndex] = useState<number>(0);
  const [draftTexts, setDraftTexts] = useState<Record<string, string>>({});
  const [updatingDraft, setUpdatingDraft] = useState(false);
  const [draftFeedback, setDraftFeedback] = useState<string | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [complaintId]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaintById(complaintId);
      setComplaint(data);
      if (data) {
        setModifiedDept(data.department || '');
        setModifiedCat(data.category || '');
        setModifiedUrgency(data.urgency || 'MEDIUM');
        setModifiedWard(data.ward || '');
        setModifiedLocality(data.locality || '');

        if (data.acknowledgementDrafts && data.acknowledgementDrafts.length > 0) {
          const map: Record<string, string> = {};
          data.acknowledgementDrafts.forEach((d) => {
            map[d.id] = d.draftedText;
          });
          setDraftTexts(map);
        }
      }
    } catch (err) {
      console.error('Failed to load complaint details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleUpdateDraft = async (draftId: string, status: string = 'OPERATOR_APPROVED') => {
    setUpdatingDraft(true);
    setDraftFeedback(null);
    try {
      const textToSave = draftTexts[draftId] || '';
      await api.updateAcknowledgementDraft(draftId, {
        draftedText: textToSave,
        status,
        editedBy: reviewedBy,
      });
      setDraftFeedback(`Draft status updated to ${status === 'OPERATOR_APPROVED' ? 'Operator Approved' : 'Revised'}.`);
      await loadDetails();
    } catch (err: any) {
      setDraftFeedback(`Failed to update draft: ${err.message}`);
    } finally {
      setUpdatingDraft(false);
    }
  };

  const copyRawText = () => {
    if (complaint) {
      navigator.clipboard.writeText(complaint.rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setSubmittingReview(true);
    setReviewMessage(null);
    try {
      const payload: any = {
        reviewedBy,
        decision,
        comments,
      };

      if (decision === 'MODIFIED') {
        payload.modifiedFields = {
          department: modifiedDept,
          category: modifiedCat,
          urgency: modifiedUrgency,
          ward: modifiedWard,
          locality: modifiedLocality,
        };
      }

      const res = await api.submitReview(complaint.id, payload);
      setReviewMessage('Operator review recorded successfully.');
      onReviewSubmitted(res.complaint);
      await loadDetails();
    } catch (err: any) {
      setReviewMessage(`Error submitting review: ${err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mb-3" />
          <p className="text-sm text-slate-300">Loading complaint details & timeline...</p>
        </div>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-slate-100">
                {complaint.externalId || complaint.id}
              </span>
              <ChannelBadge channel={complaint.sourceChannel} />
              <UrgencyBadge urgency={complaint.urgency} />
              <StatusBadge
                status={complaint.processingStatus}
                requiresHumanReview={complaint.requiresHumanReview}
              />
              <DuplicateBadge duplicateStatus={complaint.duplicateStatus} />
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40">
              SYNTHETIC TEST RECORD
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* PII Detection Alert Banner if detected */}
          {complaint.hasPII && (
            <div className="p-3 bg-amber-950/60 border border-amber-800/70 rounded-lg flex items-center justify-between text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>PII Protection Active:</strong> Personal identifiable data (phone, email, Aadhaar) was detected and masked in publicly accessible views.
                </span>
              </div>
              {complaint.piiDetails && (
                <span className="font-mono text-[11px] text-amber-300 bg-amber-900/50 px-2 py-0.5 rounded border border-amber-800/50">
                  {complaint.piiDetails}
                </span>
              )}
            </div>
          )}

          {/* CLEAR DUAL SPLIT: RAW CITIZEN INPUT vs AI INTERPRETATION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* ================= LEFT PANEL: RAW CITIZEN INPUT ================= */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Raw Citizen Grievance Input
                    </h3>
                  </div>
                  <button
                    onClick={copyRawText}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Channel Source</span>
                    <span className="font-medium text-slate-200">{complaint.sourceChannel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Submission Time</span>
                    <span className="font-mono text-slate-200">
                      {new Date(complaint.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Original Language</span>
                    <span className="font-mono uppercase text-slate-200 font-bold">{complaint.language || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Data Privacy</span>
                    <span className="text-emerald-400 font-medium">Anonymised Export Record</span>
                  </div>
                </div>

                {/* Unaltered Raw Text */}
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-mono text-slate-500 mb-1 block">
                    Unaltered Raw Complaint Text
                  </span>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded font-sans text-sm text-slate-100 leading-relaxed whitespace-pre-wrap select-all">
                    {complaint.rawText}
                  </div>
                </div>

                {/* Media Information */}
                {complaint.mediaType && complaint.mediaType !== 'NONE' && (
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <ImageIcon className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-semibold text-slate-300">
                        Attached Media Reference ({complaint.mediaType})
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400">
                      File: {complaint.mediaUrl || 'Reference in export'}
                    </p>
                    {complaint.caption && (
                      <p className="text-xs text-slate-300 mt-1 italic">
                        Caption / Note: {complaint.caption}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800/80 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Golden source data imported from anonymised municipal export file.</span>
              </div>
            </div>

            {/* ================= RIGHT PANEL: AI STRUCTURED INTERPRETATION ================= */}
            <div className="bg-slate-950/90 border border-sky-900/40 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-sky-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                      Engine Structured Interpretation
                    </h3>
                  </div>
                  {complaint.confidence && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-400">Overall Confidence:</span>
                      <span className="font-mono font-bold text-sky-400">
                        {Math.round(complaint.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Extracted Key Structured Fields */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-sky-950/20 p-2.5 rounded border border-sky-900/30">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Classified Department</span>
                    <span className="font-bold text-sky-200">{complaint.department || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Assigned Category</span>
                    <span className="font-medium text-slate-200">{complaint.category || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Assessed Urgency</span>
                    <div className="mt-0.5">
                      <UrgencyBadge urgency={complaint.urgency} />
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Normalized Ward & Locality</span>
                    <span className="font-mono text-slate-200">
                      {complaint.ward || 'Unknown'} | {complaint.locality || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Explanation Rationale */}
                <div className="mb-3">
                  <span className="text-[10px] uppercase font-mono text-slate-500 mb-1 block">
                    Classification & Routing Rationale
                  </span>
                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded text-xs text-slate-200 leading-relaxed">
                    {complaint.explanation || 'Directly imported from partner export labels.'}
                  </div>
                </div>

                {/* Extracted Entities / Structured Data Payload */}
                {complaint.structuredData && (
                  <div className="mb-3">
                    <span className="text-[10px] uppercase font-mono text-slate-500 mb-1 block">
                      Extracted Entities & Metadata
                    </span>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-300 max-h-32 overflow-y-auto">
                      <pre>{JSON.stringify(complaint.structuredData, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {/* Duplicate / Cluster Linking */}
                {complaint.duplicateCluster && (
                  <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-lg text-xs text-purple-200 mb-3 space-y-2 border-l-4 border-l-purple-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-purple-200">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span>Cluster: {complaint.duplicateCluster.clusterName}</span>
                      </div>
                      {complaint.duplicateCluster.similarityScore && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/60 font-semibold">
                          {Math.round(complaint.duplicateCluster.similarityScore * 100)}% Similarity
                        </span>
                      )}
                    </div>
                    {complaint.duplicateCluster.reason && (
                      <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded border border-purple-900/40 leading-relaxed">
                        <span className="font-semibold text-purple-300 font-mono text-[10px] uppercase block mb-0.5">Clustering Rationale</span>
                        {complaint.duplicateCluster.reason}
                      </p>
                    )}
                    {complaint.duplicateCluster.complaints && complaint.duplicateCluster.complaints.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-mono text-purple-400 block mb-1">
                          Clustered Linked Tickets ({complaint.duplicateCluster.complaints.length})
                        </span>
                        <div className="space-y-1 max-h-28 overflow-y-auto">
                          {complaint.duplicateCluster.complaints.map((c) => (
                            <div
                              key={c.id}
                              className={`p-1.5 rounded flex items-center justify-between text-[11px] font-mono ${
                                c.id === complaint.id
                                  ? 'bg-purple-900/60 border border-purple-500 text-white font-bold'
                                  : 'bg-slate-900/70 border border-slate-800 text-purple-200'
                              }`}
                            >
                              <span>
                                {c.externalId || c.id} ({c.sourceChannel})
                                {c.id === complaint.id && ' [CURRENT]'}
                              </span>
                              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {c.urgency}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {complaint.duplicateOf && !complaint.duplicateCluster && (
                  <div className="p-2.5 bg-indigo-950/40 border border-indigo-800/40 rounded text-xs text-indigo-300 mb-2">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Cluster Match: Near-Duplicate of {complaint.duplicateOf.externalId}</span>
                    </div>
                    <p className="text-[11px] text-indigo-200/80 truncate">
                      "{complaint.duplicateOf.rawText}"
                    </p>
                  </div>
                )}

                {complaint.clusteredDuplicates && complaint.clusteredDuplicates.length > 0 && !complaint.duplicateCluster && (
                  <div className="p-2.5 bg-indigo-950/40 border border-indigo-800/40 rounded text-xs text-indigo-300 mb-2">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Clustered Linked Complaints ({complaint.clusteredDuplicates.length})</span>
                    </div>
                    <div className="space-y-1">
                      {complaint.clusteredDuplicates.map((dup) => (
                        <div key={dup.id} className="text-[11px] text-indigo-200 font-mono">
                          • {dup.externalId} ({dup.sourceChannel})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 text-[10px] text-sky-400/80 border-t border-slate-800/80 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Extracted by processing engine. Pending or subject to operator sign-off.</span>
              </div>
            </div>
          </div>

          {/* PROCESSING STAGE TIMELINE */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-800">
              <Layers className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Processing Pipeline Audit Timeline
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
              {complaint.processingRecords && complaint.processingRecords.length > 0 ? (
                complaint.processingRecords.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] font-bold text-sky-400">
                          STAGE {idx + 1}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          {stage.status}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-200 block truncate">
                        {stage.stage}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {stage.outputSummary || 'Completed'}
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-2 block">
                      {new Date(stage.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 col-span-5">No pipeline stage records logged yet.</p>
              )}
            </div>
          </div>

          {/* OPERATOR ACKNOWLEDGEMENT DRAFT CONSOLE */}
          <div className="bg-slate-950 border border-sky-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  Operator Acknowledgement Draft Console
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-800/50">
                  Read-Only Review Queue
                </span>
              </div>
              <span className="text-[11px] text-slate-400 italic">
                Empathetic bilingual drafts for manual operator dispatch
              </span>
            </div>

            {complaint.acknowledgementDrafts && complaint.acknowledgementDrafts.length > 0 ? (
              <div className="space-y-3">
                {/* Draft Channel / Language Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                  {complaint.acknowledgementDrafts.map((draft, idx) => (
                    <button
                      key={draft.id}
                      type="button"
                      onClick={() => {
                        setActiveDraftIndex(idx);
                        setDraftFeedback(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors border ${
                        activeDraftIndex === idx
                          ? 'bg-sky-600/30 border-sky-500 text-sky-200 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-mono font-semibold">{draft.channel}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 uppercase font-mono text-slate-400">
                        {draft.language}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          draft.status === 'OPERATOR_APPROVED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {draft.status}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Selected Draft Editor Card */}
                {(() => {
                  const currentDraft = complaint.acknowledgementDrafts[activeDraftIndex] || complaint.acknowledgementDrafts[0];
                  if (!currentDraft) return null;
                  const currentText = draftTexts[currentDraft.id] !== undefined ? draftTexts[currentDraft.id] : currentDraft.draftedText;

                  return (
                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Channel:</span>
                          <span className="font-mono font-bold text-slate-200">{currentDraft.channel}</span>
                          <span className="text-slate-500">|</span>
                          <span className="text-slate-400">Language:</span>
                          <span className="font-mono text-slate-200 uppercase">{currentDraft.language}</span>
                          {currentDraft.templateCode && (
                            <>
                              <span className="text-slate-500">|</span>
                              <span className="text-slate-400">Template:</span>
                              <span className="font-mono text-sky-400">{currentDraft.templateCode}</span>
                            </>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyDraft(currentText)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors"
                        >
                          {copiedDraft ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Draft Text</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Textarea for operator editing */}
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
                          Draft Message Content (Operator Editable)
                        </label>
                        <textarea
                          rows={3}
                          value={currentText}
                          onChange={(e) =>
                            setDraftTexts((prev) => ({
                              ...prev,
                              [currentDraft.id]: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 font-sans leading-relaxed focus:border-sky-500 focus:outline-none"
                        />
                      </div>

                      {/* Feedback message */}
                      {draftFeedback && (
                        <div className="p-2 rounded bg-sky-950/60 border border-sky-800 text-xs text-sky-300">
                          {draftFeedback}
                        </div>
                      )}

                      {/* Actions & Disclaimer */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Info className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>No live messages sent automatically. Output is for operator copying & manual dispatch.</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={updatingDraft}
                            onClick={() => handleUpdateDraft(currentDraft.id, 'REVISED')}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs border border-slate-700 transition-colors disabled:opacity-50"
                          >
                            Save Revised Text
                          </button>
                          <button
                            type="button"
                            disabled={updatingDraft}
                            onClick={() => handleUpdateDraft(currentDraft.id, 'OPERATOR_APPROVED')}
                            className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-xs shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{currentDraft.status === 'OPERATOR_APPROVED' ? 'Approved & Ready' : 'Approve Draft'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded text-xs text-slate-500">
                No acknowledgement drafts generated for this complaint record yet.
              </div>
            )}
          </div>

          {/* OPERATOR REVIEW CONSOLE */}
          <div className="bg-slate-950 border border-amber-900/40 rounded-lg p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Operator Decision & Review Console
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {complaint.requiresHumanReview ? (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5" /> Human Review Required
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold">Review Optional / Cleared</span>
                )}
              </span>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Operator ID / Call Sign
                  </label>
                  <input
                    type="text"
                    value={reviewedBy}
                    onChange={(e) => setReviewedBy(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Review Decision
                  </label>
                  <select
                    value={decision}
                    onChange={(e) => setDecision(e.target.value as ReviewDecision)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-semibold focus:border-sky-500"
                  >
                    <option value="ACCEPTED">ACCEPT AS-IS (Approve Engine Routing)</option>
                    <option value="MODIFIED">MODIFY & APPROVE (Override Fields)</option>
                    <option value="ESCALATED">ESCALATE (Mark High Threat / Dispatch Zone Head)</option>
                    <option value="MARKED_DUPLICATE">MARK AS DUPLICATE (Link Cluster)</option>
                    <option value="REJECTED">REJECT (Out of Municipal Scope / Spurious)</option>
                  </select>
                </div>
              </div>

              {/* Editable Overrides if Decision === MODIFIED */}
              {decision === 'MODIFIED' && (
                <div className="p-3 bg-slate-900 border border-amber-800/40 rounded-lg space-y-3">
                  <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wide block">
                    Operator Field Overrides
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Department</label>
                      <select
                        value={modifiedDept}
                        onChange={(e) => setModifiedDept(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      >
                        {departments.map((d) => (
                          <option key={d.code} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Urgency</label>
                      <select
                        value={modifiedUrgency}
                        onChange={(e) => setModifiedUrgency(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Ward</label>
                      <select
                        value={modifiedWard}
                        onChange={(e) => setModifiedWard(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      >
                        {wards.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Operator Comments & Operational Notes
                </label>
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Record rationale, field officer dispatch notes, or reason for modification..."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-500"
                />
              </div>

              {reviewMessage && (
                <div
                  className={`p-2.5 rounded text-xs ${
                    reviewMessage.includes('Error')
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {reviewMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs border border-slate-700 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded text-xs shadow-md transition-colors disabled:opacity-50"
                >
                  {submittingReview ? 'Recording Review...' : 'Commit Operator Review'}
                </button>
              </div>
            </form>

            {/* Previous Review Audit History */}
            {complaint.reviews && complaint.reviews.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-500 block mb-2">
                  Review Audit Trail ({complaint.reviews.length})
                </span>
                <div className="space-y-1.5">
                  {complaint.reviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-2 rounded bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-200">{r.reviewedBy}</span>
                        <span className="text-slate-400 ml-2">Decision: {r.decision}</span>
                        {r.comments && (
                          <p className="text-slate-400 italic text-[11px] mt-0.5">"{r.comments}"</p>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
