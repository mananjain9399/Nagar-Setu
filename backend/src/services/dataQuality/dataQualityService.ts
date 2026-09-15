import prisma from '../../config/prisma';
import { LocalityNormalizer } from '../locality/localityNormalizer';

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

export class DataQualityService {
  public static async analyzeDatasetQuality(): Promise<DataQualitySummary> {
    const complaints = await prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const issues: DataQualityIssue[] = [];
    const externalIdCounts = new Map<string, number>();

    // Pass 1: count external IDs for duplicate detection
    for (const c of complaints) {
      if (c.externalId) {
        externalIdCounts.set(c.externalId, (externalIdCounts.get(c.externalId) || 0) + 1);
      }
    }

    let missingLocationsCount = 0;
    let ambiguousLocalitiesCount = 0;
    let unknownAliasesCount = 0;
    let invalidTimestampsCount = 0;
    let missingTextCount = 0;
    let unsupportedMediaCount = 0;
    let duplicateExternalIdsCount = 0;

    const supportedMediaExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.mp3', '.m4a', '.wav'];

    // Pass 2: Inspect each record
    for (const c of complaints) {
      // 1. Missing Complaint Text
      if (!c.rawText || c.rawText.trim().length < 5) {
        missingTextCount++;
        issues.push({
          complaintId: c.id,
          externalId: c.externalId,
          issueType: 'MISSING_TEXT',
          severity: 'HIGH',
          description: 'Grievance record has empty or insufficient complaint text (< 5 characters).',
          field: 'rawText',
          sampleValue: c.rawText,
        });
      }

      // 2. Duplicate External ID
      if (c.externalId && (externalIdCounts.get(c.externalId) || 0) > 1) {
        duplicateExternalIdsCount++;
        issues.push({
          complaintId: c.id,
          externalId: c.externalId,
          issueType: 'DUPLICATE_EXTERNAL_ID',
          severity: 'MEDIUM',
          description: `External reference '${c.externalId}' is duplicated across multiple records in dataset.`,
          field: 'externalId',
          sampleValue: c.externalId,
        });
      }

      // 3. Invalid Timestamps
      const timestamp = new Date(c.createdAt).getTime();
      const now = Date.now() + 86400000; // allow 24h grace for tz differences
      if (isNaN(timestamp) || timestamp > now || timestamp < 946684800000) {
        // before year 2000 or future
        invalidTimestampsCount++;
        issues.push({
          complaintId: c.id,
          externalId: c.externalId,
          issueType: 'INVALID_TIMESTAMP',
          severity: 'MEDIUM',
          description: 'Timestamp is unparseable or outside expected temporal bounds.',
          field: 'createdAt',
          sampleValue: String(c.createdAt),
        });
      }

      // 4. Unsupported / Malformed Media
      if (c.mediaUrl && c.mediaType !== 'NONE') {
        const url = c.mediaUrl.toLowerCase();
        const hasKnownExt = supportedMediaExts.some((ext) => url.endsWith(ext));
        if (!hasKnownExt && !url.startsWith('data:')) {
          unsupportedMediaCount++;
          issues.push({
            complaintId: c.id,
            externalId: c.externalId,
            issueType: 'UNSUPPORTED_MEDIA',
            severity: 'LOW',
            description: `Media attachment format is unsupported or missing valid file extension.`,
            field: 'mediaUrl',
            sampleValue: c.mediaUrl,
          });
        }
      }

      // 5. Missing Location
      const hasLocality = c.locality && c.locality.trim() !== '' && c.locality !== 'Unknown Locality';
      const hasWard = c.ward && c.ward.trim() !== '';

      if (!hasLocality && !hasWard) {
        missingLocationsCount++;
        issues.push({
          complaintId: c.id,
          externalId: c.externalId,
          issueType: 'MISSING_LOCATION',
          severity: 'HIGH',
          description: 'Complaint does not specify any geographic locality or municipal ward.',
          field: 'locality',
          sampleValue: c.locality,
        });
      } else {
        // Check for ambiguous or unknown locations using LocalityNormalizer
        const locationQuery = `${c.locality || ''} ${c.ward || ''}`.trim();
        const normalisation = await LocalityNormalizer.normalize(locationQuery);

        if (normalisation.candidates.length > 1 && normalisation.confidence < 0.85) {
          ambiguousLocalitiesCount++;
          issues.push({
            complaintId: c.id,
            externalId: c.externalId,
            issueType: 'AMBIGUOUS_LOCALITY',
            severity: 'MEDIUM',
            description: `Location '${locationQuery}' matches multiple competing gazetteer candidates (${normalisation.candidates.map((x) => x.locality).join(', ')}).`,
            field: 'locality',
            sampleValue: locationQuery,
          });
        } else if (normalisation.confidence === 0.0) {
          unknownAliasesCount++;
          issues.push({
            complaintId: c.id,
            externalId: c.externalId,
            issueType: 'UNKNOWN_ALIAS',
            severity: 'LOW',
            description: `Location label '${c.locality}' has no recognized alias or spelling variant in the gazetteer.`,
            field: 'locality',
            sampleValue: c.locality,
          });
        }
      }
    }

    const uniqueFlaggedComplaints = new Set(issues.map((i) => i.complaintId));
    const cleanCount = Math.max(0, complaints.length - uniqueFlaggedComplaints.size);
    const scorePct = complaints.length > 0 ? Math.round((cleanCount / complaints.length) * 100) : 100;

    return {
      totalRecords: complaints.length,
      cleanRecordsCount: cleanCount,
      qualityScorePercentage: scorePct,
      issuesSummary: {
        missingLocations: missingLocationsCount,
        ambiguousLocalities: ambiguousLocalitiesCount,
        unknownAliases: unknownAliasesCount,
        invalidTimestamps: invalidTimestampsCount,
        missingText: missingTextCount,
        unsupportedMedia: unsupportedMediaCount,
        duplicateExternalIds: duplicateExternalIdsCount,
      },
      detectedIssues: issues.slice(0, 50), // Return top 50 issues
    };
  }
}
