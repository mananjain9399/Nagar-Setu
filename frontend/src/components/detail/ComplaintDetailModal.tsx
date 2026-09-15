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
  Info,
  MessageSquare,
  CheckCircle2,
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
      setDraftFeedback(`Draft updated to ${status === 'OPERATOR_APPROVED' ? 'Approved' : 'Revised'}.`);
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
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-md p-6 max-w-sm w-full text-center shadow-xl">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
          <p className="text-xs text-slate-700 font-medium">Loading case file from municipal database...</p>
        </div>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-md max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Navy Header */}
        <div className="bg-[#0b1329] px-4 py-3 border-b border-[#1b2640] flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-sm font-bold text-white tracking-wide">
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

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#f8fafc]">
          {/* PII Alert Banner */}
          {complaint.hasPII && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>PII Protection Active:</strong> Citizen contact data (phone/email/ID) masked in public view.
                </span>
              </div>
              {complaint.piiDetails && (
                <span className="font-mono text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {complaint.piiDetails}
                </span>
              )}
            </div>
          )}

          {/* TWO-COLUMN PROFESSIONAL CASE-REVIEW LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* LEFT: COMPLAINT INFORMATION */}
            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Citizen Complaint Information
                  </h3>
                </div>
                <button
                  onClick={copyRawText}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Case Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-200/80">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Source Channel</span>
                  <span className="font-semibold text-slate-800">{complaint.sourceChannel}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Registered Timestamp</span>
                  <span className="font-mono text-slate-800 text-[11px]">
                    {new Date(complaint.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Detected Language</span>
                  <span className="font-mono uppercase font-bold text-slate-800">{complaint.language || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Ground Location</span>
                  <span className="font-medium text-slate-800">{complaint.locality || 'Unknown'} ({complaint.ward || 'No Ward'})</span>
                </div>
              </div>

              {/* Original Complaint Text */}
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                  Original Grievance Text
                </span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded font-sans text-xs text-slate-900 leading-relaxed whitespace-pre-wrap select-all">
                  {complaint.rawText}
                </div>
              </div>

              {/* Attached Media */}
              {complaint.mediaType && complaint.mediaType !== 'NONE' && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Attached Media Reference ({complaint.mediaType})</span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-600 truncate">
                    URL / Path: {complaint.mediaUrl || 'Referenced in dataset'}
                  </p>
                  {complaint.caption && (
                    <p className="text-slate-700 italic text-[11px]">
                      Caption: "{complaint.caption}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: AI ANALYSIS & ROUTING */}
            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    AI Analysis & Routing
                  </h3>
                </div>
                {complaint.confidence && (
                  <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    CONFIDENCE: {Math.round(complaint.confidence * 100)}%
                  </span>
                )}
              </div>

              {/* AI Classification Summary */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-200/80">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Assigned Department</span>
                  <span className="font-bold text-blue-800">{complaint.department || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Grievance Category</span>
                  <span className="font-medium text-slate-800">{complaint.category || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Assessed Urgency</span>
                  <div className="mt-0.5">
                    <UrgencyBadge urgency={complaint.urgency} />
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Resolved Ward</span>
                  <span className="font-mono text-slate-800 font-semibold">{complaint.ward || 'No Ward Inferred'}</span>
                </div>
              </div>

              {/* Rationale */}
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                  AI Recommendation & Rationale
                </span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 leading-relaxed">
                  {complaint.explanation || 'Automatically routed using multi-lingual lexical rules and gazetteer lookup.'}
                </div>
              </div>

              {/* Duplicate Detection */}
              {complaint.duplicateCluster && (
                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded text-xs text-purple-900 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-700" />
                      <span>Cluster: {complaint.duplicateCluster.clusterName}</span>
                    </div>
                    {complaint.duplicateCluster.similarityScore && (
                      <span className="font-mono text-[10px] font-bold">
                        {Math.round(complaint.duplicateCluster.similarityScore * 100)}% Match
                      </span>
                    )}
                  </div>
                  {complaint.duplicateCluster.reason && (
                    <p className="text-[11px] text-purple-800">
                      {complaint.duplicateCluster.reason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DRAFT RESPONSE CONSOLE */}
          {complaint.acknowledgementDrafts && complaint.acknowledgementDrafts.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Bilingual Citizen Acknowledgement Draft
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  MANUAL DISPATCH CONSOLE
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {complaint.acknowledgementDrafts.map((draft, idx) => (
                    <button
                      key={draft.id}
                      type="button"
                      onClick={() => {
                        setActiveDraftIndex(idx);
                        setDraftFeedback(null);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors border cursor-pointer ${
                        activeDraftIndex === idx
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="font-mono">{draft.channel}</span>
                      <span className="text-[10px] uppercase font-mono text-slate-400">({draft.language})</span>
                    </button>
                  ))}
                </div>

                {(() => {
                  const currentDraft = complaint.acknowledgementDrafts[activeDraftIndex] || complaint.acknowledgementDrafts[0];
                  if (!currentDraft) return null;
                  const currentText = draftTexts[currentDraft.id] !== undefined ? draftTexts[currentDraft.id] : currentDraft.draftedText;

                  return (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={currentText}
                        onChange={(e) =>
                          setDraftTexts((prev) => ({
                            ...prev,
                            [currentDraft.id]: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-900 font-sans leading-relaxed focus:border-blue-600 focus:bg-white focus:outline-none"
                      />

                      {draftFeedback && (
                        <div className="p-2 rounded bg-blue-50 border border-blue-200 text-xs text-blue-800">
                          {draftFeedback}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-[11px] text-slate-400">
                          Draft is ready for copying to SMS gateway or officer terminal.
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyDraft(currentText)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200 font-semibold cursor-pointer"
                          >
                            {copiedDraft ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                            <span>{copiedDraft ? 'Copied' : 'Copy Message'}</span>
                          </button>
                          <button
                            type="button"
                            disabled={updatingDraft}
                            onClick={() => handleUpdateDraft(currentDraft.id, 'OPERATOR_APPROVED')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            Approve Draft
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* HUMAN DECISION & OPERATOR REVIEW */}
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Operator Decision & Review
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {complaint.requiresHumanReview ? (
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5 text-amber-600" /> Human Review Required
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold">Review Cleared</span>
                )}
              </span>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">
                    Operator ID
                  </label>
                  <input
                    type="text"
                    value={reviewedBy}
                    onChange={(e) => setReviewedBy(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 font-mono text-xs focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">
                    Human Decision
                  </label>
                  <select
                    value={decision}
                    onChange={(e) => setDecision(e.target.value as ReviewDecision)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 font-semibold text-xs focus:border-blue-600 focus:outline-none"
                  >
                    <option value="ACCEPTED">APPROVE (Accept AI Classification & Route)</option>
                    <option value="MODIFIED">EDIT (Override Department / Ward / Urgency)</option>
                    <option value="ESCALATED">ESCALATE (Mark Emergency to Zone Officer)</option>
                    <option value="MARKED_DUPLICATE">MARK AS DUPLICATE (Link Existing Ticket)</option>
                    <option value="REJECTED">REJECT (Spurious / Out of Scope)</option>
                  </select>
                </div>
              </div>

              {/* Editable Overrides if Decision === MODIFIED */}
              {decision === 'MODIFIED' && (
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded space-y-2">
                  <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">
                    Field Overrides
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Department</label>
                      <select
                        value={modifiedDept}
                        onChange={(e) => setModifiedDept(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 text-xs"
                      >
                        {departments.map((d) => (
                          <option key={d.code} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Urgency</label>
                      <select
                        value={modifiedUrgency}
                        onChange={(e) => setModifiedUrgency(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 text-xs"
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Ward</label>
                      <select
                        value={modifiedWard}
                        onChange={(e) => setModifiedWard(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 text-xs"
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
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">
                  Operator Notes / Dispatch Comments
                </label>
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Record rationale, field team dispatch instructions, or review notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              {reviewMessage && (
                <div
                  className={`p-2 rounded text-xs ${
                    reviewMessage.includes('Error')
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {reviewMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs border border-slate-200 font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submittingReview ? 'Recording...' : 'Commit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
