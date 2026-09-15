import React from 'react';
import { UrgencyLevel, ProcessingStatus, DuplicateStatus } from '../../types';

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel | string }> = ({ urgency }) => {
  const u = urgency?.toUpperCase();

  if (u === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
        CRITICAL
      </span>
    );
  }
  if (u === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        HIGH
      </span>
    );
  }
  if (u === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30">
        MEDIUM
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/40">
      LOW
    </span>
  );
};

export const ChannelBadge: React.FC<{ channel: string }> = ({ channel }) => {
  const c = channel?.toUpperCase();

  if (c === 'CM_HELPLINE_181') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
        CM 181
      </span>
    );
  }
  if (c === 'MUNICIPAL_APP') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30">
        Bhopal App
      </span>
    );
  }
  if (c === 'ELECTED_REP') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        Elected Rep
      </span>
    );
  }
  if (c === 'SOCIAL_MEDIA') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
        Social Media
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
      {channel || 'Direct'}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ProcessingStatus | string; requiresHumanReview?: boolean }> = ({
  status,
  requiresHumanReview,
}) => {
  const s = status?.toUpperCase();

  if (requiresHumanReview) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Needs Review
      </span>
    );
  }

  if (s === 'PROCESSED') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        Processed
      </span>
    );
  }
  if (s === 'UNPROCESSED') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700/60 text-slate-300 border border-slate-600/50">
        Unprocessed
      </span>
    );
  }
  if (s === 'REJECTED') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">
      {status}
    </span>
  );
};

export const DuplicateBadge: React.FC<{ duplicateStatus: DuplicateStatus | string }> = ({ duplicateStatus }) => {
  if (duplicateStatus === 'POSSIBLE_DUPLICATE') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
        Possible Duplicate
      </span>
    );
  }
  if (duplicateStatus === 'CONFIRMED_DUPLICATE') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
        Duplicate (Linked)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
      Unique
    </span>
  );
};
