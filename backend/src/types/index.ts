export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProcessingStatus = 'UNPROCESSED' | 'PROCESSED' | 'REQUIRES_REVIEW' | 'DUPLICATE';
export type DuplicateStatus = 'UNIQUE' | 'POSSIBLE_DUPLICATE' | 'CONFIRMED_DUPLICATE';
export type ReviewDecision = 'ACCEPTED' | 'REJECTED' | 'MODIFIED' | 'ESCALATED' | 'MARKED_DUPLICATE';

export interface ComplaintFilterQuery {
  department?: string;
  category?: string;
  urgency?: string;
  ward?: string;
  locality?: string;
  sourceChannel?: string;
  language?: string;
  duplicateStatus?: string;
  reviewStatus?: string; // 'ALL' | 'PENDING_REVIEW' | 'REVIEWED' | 'REQUIRES_HUMAN_REVIEW'
  processingStatus?: string;
  search?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewSubmissionDTO {
  reviewedBy: string;
  decision: ReviewDecision;
  comments?: string;
  modifiedFields?: {
    department?: string;
    category?: string;
    urgency?: string;
    ward?: string;
    locality?: string;
  };
}

export interface DashboardStatsResponse {
  summary: {
    totalComplaints: number;
    unprocessedCount: number;
    processedCount: number;
    possibleDuplicatesCount: number;
    requiresHumanReviewCount: number;
    criticalOrHighUrgencyCount: number;
    criticalCount: number;
    highCount: number;
    reviewedCount: number;
  };
  byDepartment: Array<{ name: string; count: number }>;
  byCategory: Array<{ name: string; count: number }>;
  byLocality: Array<{ name: string; count: number }>;
  byWard: Array<{ name: string; count: number }>;
  bySourceChannel: Array<{ channel: string; count: number }>;
  byUrgency: Array<{ urgency: string; count: number }>;
  byLanguage: Array<{ language: string; count: number }>;
}

export interface ImportResultSummary {
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}
