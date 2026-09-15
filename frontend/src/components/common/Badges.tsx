import React from 'react';
import { UrgencyLevel, ProcessingStatus, DuplicateStatus } from '../../types';

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel | string }> = ({ urgency }) => {
  const u = urgency?.toUpperCase();

  if (u === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        CRITICAL
      </span>
    );
  }
  if (u === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        HIGH
      </span>
    );
  }
  if (u === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        MEDIUM
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      LOW
    </span>
  );
};

export const ChannelBadge: React.FC<{ channel: string }> = ({ channel }) => {
  const c = channel?.toUpperCase();

  if (c === 'CM_HELPLINE_181') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
        CM 181
      </span>
    );
  }
  if (c === 'MUNICIPAL_APP') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
        Bhopal 311
      </span>
    );
  }
  if (c === 'ELECTED_REP') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Elected Rep
      </span>
    );
  }
  if (c === 'SOCIAL_MEDIA') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        Social Media
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
        <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Needs Review
      </span>
    );
  }

  if (s === 'PROCESSED') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Processed
      </span>
    );
  }
  if (s === 'UNPROCESSED') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        Unprocessed
      </span>
    );
  }
  if (s === 'REJECTED') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
      {status}
    </span>
  );
};

export const DuplicateBadge: React.FC<{ duplicateStatus: DuplicateStatus | string }> = ({ duplicateStatus }) => {
  if (duplicateStatus === 'POSSIBLE_DUPLICATE') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Possible Duplicate
      </span>
    );
  }
  if (duplicateStatus === 'CONFIRMED_DUPLICATE') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
        Duplicate (Linked)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
      Unique
    </span>
  );
};
