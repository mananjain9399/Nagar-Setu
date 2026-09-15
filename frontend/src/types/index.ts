export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProcessingStatus = 'UNPROCESSED' | 'PROCESSED' | 'REQUIRES_REVIEW' | 'DUPLICATE' | 'REJECTED';
export type DuplicateStatus = 'UNIQUE' | 'POSSIBLE_DUPLICATE' | 'CONFIRMED_DUPLICATE';
export type ReviewDecision = 'ACCEPTED' | 'REJECTED' | 'MODIFIED' | 'ESCALATED' | 'MARKED_DUPLICATE';

export interface ComplaintProcessing {
  id: string;
  complaintId: string;
  stage: string;
  status: string;
  outputSummary: string | null;
  confidence: number | null;
  createdAt: string;
}

export interface OperatorReview {
  id: string;
  complaintId: string;
  reviewedBy: string;
  decision: ReviewDecision;
  comments: string | null;
  modifiedFields?: {
    department?: string;
    category?: string;
    urgency?: string;
    ward?: string;
    locality?: string;
  };
  createdAt: string;
}

export interface DuplicateCluster {
  id: string;
  clusterName: string;
  primaryComplaintId: string | null;
  similarityScore: number | null;
  reason: string | null;
  status: string;
  complaints?: Array<{
    id: string;
    externalId: string | null;
    rawText: string;
    urgency: UrgencyLevel;
    sourceChannel: string;
  }>;
}

export interface AcknowledgementDraft {
  id: string;
  complaintId: string;
  channel: string;
  language: string;
  templateCode: string | null;
  draftedText: string;
  status: string;
  editedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingResult {
  id: string;
  complaintId: string;
  detectedLanguage: string | null;
  extractedLocality: string | null;
  extractedWard: string | null;
  classifiedDepartment: string | null;
  classifiedCategory: string | null;
  assessedUrgency: string | null;
  confidenceScore: number | null;
  isPotentialDuplicate: boolean;
  duplicateClusterId: string | null;
  reasoningSummary: string | null;
  entitiesExtracted: any | null;
  createdAt: string;
}

export interface Complaint {
  id: string;
  externalId: string | null;
  sourceChannel: string;
  rawText: string;
  mediaType: string | null;
  mediaUrl: string | null;
  caption: string | null;
  language: string | null;
  department: string | null;
  category: string | null;
  urgency: UrgencyLevel;
  ward: string | null;
  locality: string | null;
  createdAt: string;
  processedAt: string | null;
  processingStatus: ProcessingStatus;
  confidence: number | null;
  requiresHumanReview: boolean;
  duplicateStatus: DuplicateStatus;
  duplicateOfId: string | null;
  duplicateClusterId?: string | null;
  duplicateCluster?: DuplicateCluster | null;
  acknowledgementDrafts?: AcknowledgementDraft[];
  processingResult?: ProcessingResult | null;
  explanation: string | null;
  structuredData: any | null;
  isSynthetic: boolean;
  hasPII?: boolean;
  piiDetails?: string | null;
  transcription?: string | null;
  transcriptionConfidence?: number | null;
  detectedVisionSignals?: string[] | null;
  safetySignals?: string | null;
  serviceOutageSignals?: string | null;
  durationText?: string | null;
  isResolved?: boolean;
  resolvedAt?: string | null;
  processingRecords?: ComplaintProcessing[];
  reviews?: OperatorReview[];
  duplicateOf?: Partial<Complaint> | null;
  clusteredDuplicates?: Partial<Complaint>[];
  _count?: {
    reviews: number;
    processingRecords: number;
  };
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description: string | null;
  departmentId: string;
  active: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  active: boolean;
  description: string | null;
  categories?: Category[];
}

export interface Ward {
  id: string;
  wardNumber: string;
  wardName: string;
  zone: string | null;
  active: boolean;
  localities?: Locality[];
}

export interface Locality {
  id: string;
  name: string;
  wardId: string | null;
  ward?: Ward | null;
  aliases: string[];
  spellingVariants: string[];
  landmarkTerms: string[];
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  isSynthetic?: boolean;
}

export interface AliasOverlap {
  term: string;
  type: 'ALIAS' | 'LANDMARK' | 'SPELLING_VARIANT';
  occurrences: Array<{
    localityName: string;
    wardNumber: string;
    wardName: string;
  }>;
}

export interface NormalisationCandidate {
  locality: string;
  ward: string | null;
  confidence: number;
  matchedOn: string;
  matchType: string;
}

export interface NormalisationResult {
  raw_location: string;
  normalized_locality: string | null;
  ward: string | null;
  confidence: number;
  matched_alias: string | null;
  matched_term?: string | null;
  explanation: string;
  requires_review: boolean;
  candidates: NormalisationCandidate[];
}

export interface DataQualityIssue {
  complaintId: string;
  externalId: string | null;
  issueType:
    | 'MISSING_LOCATION'
    | 'AMBIGUOUS_LOCALITY'
    | 'UNKNOWN_ALIAS'
    | 'INVALID_TIMESTAMP'
    | 'MISSING_TEXT'
    | 'UNSUPPORTED_MEDIA'
    | 'DUPLICATE_EXTERNAL_ID';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  field: string;
  sampleValue?: string | null;
}

export interface DataQualitySummary {
  totalRecords: number;
  cleanRecordsCount: number;
  qualityScorePercentage: number;
  issuesSummary: {
    missingLocations: number;
    ambiguousLocalities: number;
    unknownAliases: number;
    invalidTimestamps: number;
    missingText: number;
    unsupportedMedia: number;
    duplicateExternalIds: number;
  };
  detectedIssues: DataQualityIssue[];
}

export interface DashboardStats {
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

export interface ComplaintFilterQuery {
  department?: string;
  category?: string;
  urgency?: string;
  ward?: string;
  locality?: string;
  sourceChannel?: string;
  language?: string;
  duplicateStatus?: string;
  reviewStatus?: string;
  processingStatus?: string;
  mediaType?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedComplaints {
  items: Complaint[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface ImportResult {
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}

export interface AIProviderConfig {
  provider: string;
  model: string;
  hasApiKey: boolean;
  mode: 'LIVE_AI' | 'DETERMINISTIC_FALLBACK';
}

export interface UnifiedPipelineOutput {
  complaintId: string;
  externalId: string | null;
  language: 'hi' | 'en' | 'hi-en';
  summary: string;
  issue_description: string;
  department: string | null;
  category: string | null;
  classification_confidence: number;
  classification_evidence: string[];
  classification_reason: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  urgency_score: number;
  urgency_confidence: number;
  urgency_evidence: string[];
  urgency_reason: string;
  locality: string | null;
  ward: string | null;
  locality_confidence: number;
  locality_explanation: string;
  duration: string | null;
  safety_signals: string[];
  service_outage_signals: string[];
  detected_vision_signals: string[];
  transcription: string | null;
  keywords: string[];
  has_pii: boolean;
  masked_text: string;
  requires_human_review: boolean;
}

export interface DepartmentDigestEntry {
  departmentCode: string;
  departmentName: string;
  complaintsReceived: number;
  complaintsResolved: number | 'Data unavailable';
  resolutionRatePercentage: number | 'Data unavailable';
  medianResolutionTimeHours: number | 'Data unavailable';
  repeatLocalities: Array<{ locality: string; count: number }>;
}

export interface WeeklyDigestResult {
  reportPeriod: {
    currentWeekStart: string;
    currentWeekEnd: string;
    previousWeekStart: string;
    previousWeekEnd: string;
  };
  summary: {
    totalComplaintsReceived: number;
    totalResolved: number | 'Data unavailable';
    overallMedianResolutionHours: number | 'Data unavailable';
  };
  departmentDigests: DepartmentDigestEntry[];
  weekComparison: {
    volumeChangePercentage: number | 'Previous week data unavailable.';
    resolvedChangePercentage: number | 'Previous week data unavailable.';
    currentWeekCount: number;
    previousWeekCount: number;
    comparisonNote: string;
  };
  repeatLocalitiesHotspots: Array<{
    locality: string;
    ward: string | null;
    complaintCount: number;
    topCategories: Array<{ name: string; count: number }>;
    trend: 'SURGING' | 'STABLE' | 'DECLINING';
  }>;
  emergingClusters: Array<{
    id: string;
    alertTitle: string;
    locality: string;
    ward: string | null;
    category: string;
    complaintCount: number;
    evidence: string;
    severity: 'HIGH' | 'MEDIUM';
    detectedAt: string;
  }>;
}

export interface EvaluationBenchmarkResult {
  datasetInfo: {
    datasetName: string;
    totalTestRecords: number;
    evaluationTimestamp: string;
  };
  routingMetrics: {
    overallDepartmentAccuracy: number;
    perDepartmentAccuracy: Record<string, { total: number; correct: number; accuracy: number }>;
    categoryAccuracy: number;
    confusionMatrix: Record<string, Record<string, number>>;
  };
  urgencyMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    tierBreakdown: Record<string, { precision: number; recall: number; f1: number }>;
    confusionMatrix: Record<string, Record<string, number>>;
  };
  duplicateMetrics: {
    precision: number;
    recall: number;
    f1Score: number;
    ticketReductionPercentage: number;
    identifiedDuplicatesCount: number;
  };
  localityMetrics: {
    localityMatchAccuracy: number;
    wardMatchAccuracy: number;
    unknownOrReviewRate: number;
  };
  humanReviewMetrics: {
    reviewRequiredRate: number;
    acceptedWithoutChangesEstimate: number;
    modifiedByOperatorEstimate: number;
    rejectedEstimate: number;
  };
  pipelineFunnel: {
    totalImported: number;
    processed: number;
    classified: number;
    localityMapped: number;
    duplicateChecked: number;
    humanReviewed: number;
    finalTickets: number;
    failureCount: number;
  };
}

export interface AuditLogEntry {
  id: string;
  complaintId: string | null;
  action: string;
  actor: string;
  previousVal: any;
  newVal: any;
  details: string | null;
  createdAt: string;
}

