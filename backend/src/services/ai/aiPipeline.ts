import prisma from '../../config/prisma';
import { MultimodalIntake } from './multimodalIntake';
import { PIIDetector } from './piiDetector';
import { IssueExtractor } from './issueExtractor';
import { TaxonomyClassifier } from './taxonomyClassifier';
import { UrgencyScorer } from './urgencyScorer';
import { LocalityNormalizer } from '../locality/localityNormalizer';
import { AIService } from './aiService';

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
  audit_entry_id?: string;
}

export class AIPipeline {
  /**
   * Runs the complete, integrated 7-stage processing pipeline for a single complaint.
   */
  public static async processComplaint(complaintIdOrRecord: string | any): Promise<UnifiedPipelineOutput> {
    let complaint: any;

    if (typeof complaintIdOrRecord === 'string') {
      complaint = await prisma.complaint.findUnique({
        where: { id: complaintIdOrRecord },
      });
      if (!complaint) {
        throw new Error(`Complaint not found with ID: ${complaintIdOrRecord}`);
      }
    } else {
      complaint = complaintIdOrRecord;
    }

    // STAGE 1: MULTIMODAL INTAKE & PRE-PROCESSING
    const intake = MultimodalIntake.processIntake({
      rawText: complaint.rawText,
      mediaType: complaint.mediaType,
      mediaUrl: complaint.mediaUrl,
      caption: complaint.caption,
    });

    // STAGE 2: PII DETECTION & MASKING
    const piiResult = PIIDetector.inspectAndMask(intake.effectiveText);

    // STAGE 3: ISSUE & ENTITY EXTRACTION
    const extraction = IssueExtractor.extract(intake.effectiveText, intake.detectedLanguage);

    // STAGE 4: TAXONOMY CLASSIFICATION (PARTNER TAXONOMY ONLY)
    const classification = await TaxonomyClassifier.classify(intake.effectiveText);

    // STAGE 5: URGENCY SCORING (SAFETY, OUTAGE, DURATION CRITERIA ONLY)
    const urgencyResult = UrgencyScorer.evaluateUrgency({
      text: intake.effectiveText,
      safetySignals: extraction.safety_signals,
      serviceOutageSignals: extraction.service_outage_signals,
      durationText: extraction.duration,
    });

    // STAGE 6: LOCALITY + WARD NORMALISATION (GAZETTEER ONLY - NO WARD INVENTED)
    const locationQuery = complaint.locality || intake.effectiveText;
    const localityResult = await LocalityNormalizer.normalize(locationQuery);

    // STAGE 7: CONSOLIDATE HUMAN REVIEW REQUIREMENT
    const requiresReview =
      intake.requiresHumanReview ||
      classification.requires_human_review ||
      urgencyResult.requires_human_review ||
      localityResult.requires_review ||
      piiResult.hasPII ||
      urgencyResult.urgency === 'CRITICAL' ||
      !classification.department ||
      !localityResult.ward;

    const overallConfidence = parseFloat(
      (
        (classification.confidence * 0.4 +
          urgencyResult.confidence * 0.3 +
          localityResult.confidence * 0.3)
      ).toFixed(2)
    );

    // PERSISTENCE: Save processing records and update complaint
    if (complaint.id) {
      // 1. Log pipeline stages
      const stages = [
        { stage: 'MULTIMODAL_INTAKE', status: 'COMPLETED', summary: intake.mediaAnalysisSummary || `Detected ${intake.detectedLanguage.toUpperCase()}` },
        { stage: 'EXTRACTION', status: 'COMPLETED', summary: `Extracted ${extraction.keywords.length} keywords, duration: ${extraction.duration || 'unknown'}` },
        { stage: 'CLASSIFICATION', status: classification.department ? 'COMPLETED' : 'REQUIRES_REVIEW', summary: `${classification.department || 'Unassigned'} / ${classification.category || 'Unassigned'}` },
        { stage: 'URGENCY_ASSESSMENT', status: 'COMPLETED', summary: `${urgencyResult.urgency} (Score: ${urgencyResult.score.toFixed(2)})` },
        { stage: 'LOCALITY_NORMALISATION', status: localityResult.ward ? 'COMPLETED' : 'REQUIRES_REVIEW', summary: `${localityResult.normalized_locality || 'Unmapped'} -> ${localityResult.ward || 'No Ward'}` },
      ];

      for (const st of stages) {
        await prisma.complaintProcessing.create({
          data: {
            complaintId: complaint.id,
            stage: st.stage,
            status: st.status,
            outputSummary: st.summary,
            confidence: overallConfidence,
          },
        });
      }

      // 2. Upsert ProcessingResult
      await prisma.processingResult.upsert({
        where: { complaintId: complaint.id },
        update: {
          detectedLanguage: intake.detectedLanguage,
          extractedLocality: localityResult.normalized_locality,
          extractedWard: localityResult.ward,
          classifiedDepartment: classification.department,
          classifiedCategory: classification.category,
          assessedUrgency: urgencyResult.urgency,
          confidenceScore: overallConfidence,
          reasoningSummary: `${classification.reason} | ${urgencyResult.reason} | ${localityResult.explanation}`,
          entitiesExtracted: {
            summary: extraction.summary,
            duration: extraction.duration,
            safetySignals: extraction.safety_signals,
            serviceOutageSignals: extraction.service_outage_signals,
            keywords: extraction.keywords,
            piiMasked: piiResult.hasPII,
          },
        },
        create: {
          complaintId: complaint.id,
          detectedLanguage: intake.detectedLanguage,
          extractedLocality: localityResult.normalized_locality,
          extractedWard: localityResult.ward,
          classifiedDepartment: classification.department,
          classifiedCategory: classification.category,
          assessedUrgency: urgencyResult.urgency,
          confidenceScore: overallConfidence,
          reasoningSummary: `${classification.reason} | ${urgencyResult.reason} | ${localityResult.explanation}`,
          entitiesExtracted: {
            summary: extraction.summary,
            duration: extraction.duration,
            safetySignals: extraction.safety_signals,
            serviceOutageSignals: extraction.service_outage_signals,
            keywords: extraction.keywords,
            piiMasked: piiResult.hasPII,
          },
        },
      });

      // 3. Update Complaint record with structured fields
      await prisma.complaint.update({
        where: { id: complaint.id },
        data: {
          language: intake.detectedLanguage,
          department: classification.department || complaint.department,
          category: classification.category || complaint.category,
          urgency: urgencyResult.urgency,
          ward: localityResult.ward || complaint.ward,
          locality: localityResult.normalized_locality || complaint.locality,
          confidence: overallConfidence,
          requiresHumanReview: requiresReview,
          processingStatus: requiresReview ? 'REQUIRES_REVIEW' : 'PROCESSED',
          processedAt: new Date(),
          transcription: intake.transcription,
          transcriptionConfidence: intake.transcriptionConfidence,
          detectedVisionSignals: intake.detectedVisionSignals,
          safetySignals: extraction.safety_signals,
          serviceOutageSignals: extraction.service_outage_signals,
          durationText: extraction.duration,
          hasPII: piiResult.hasPII,
          piiDetails: piiResult.flaggedEntities,
          explanation: `${classification.reason}\n${urgencyResult.reason}\n${localityResult.explanation}`,
          structuredData: {
            summary: extraction.summary,
            issueDescription: extraction.issue_description,
            keywords: extraction.keywords,
            classificationEvidence: classification.evidence,
            urgencyEvidence: urgencyResult.evidence,
            localityEvidence: localityResult.matched_alias,
            intakeAnalysis: intake.mediaAnalysisSummary,
          },
        },
      });

      // 4. Audit Log Entry
      await prisma.auditLog.create({
        data: {
          complaintId: complaint.id,
          action: 'AI_PIPELINE_PROCESSING',
          actor: 'SYSTEM_AI_ENGINE',
          details: `Processed via integrated 7-stage engine. Routing: ${classification.department || 'Unassigned'} / ${classification.category || 'Unassigned'} (${(classification.confidence * 100).toFixed(0)}%). Urgency: ${urgencyResult.urgency}. Locality: ${localityResult.normalized_locality || 'Unmapped'} (${localityResult.ward || 'No Ward'}). Review required: ${requiresReview}.`,
          newVal: {
            department: classification.department,
            category: classification.category,
            urgency: urgencyResult.urgency,
            ward: localityResult.ward,
            locality: localityResult.normalized_locality,
            confidence: overallConfidence,
          },
        },
      });
    }

    return {
      complaintId: complaint.id || 'unpersisted',
      externalId: complaint.externalId || null,
      language: intake.detectedLanguage,
      summary: extraction.summary,
      issue_description: extraction.issue_description,
      department: classification.department,
      category: classification.category,
      classification_confidence: classification.confidence,
      classification_evidence: classification.evidence,
      classification_reason: classification.reason,
      urgency: urgencyResult.urgency,
      urgency_score: urgencyResult.score,
      urgency_confidence: urgencyResult.confidence,
      urgency_evidence: urgencyResult.evidence,
      urgency_reason: urgencyResult.reason,
      locality: localityResult.normalized_locality,
      ward: localityResult.ward,
      locality_confidence: localityResult.confidence,
      locality_explanation: localityResult.explanation,
      duration: extraction.duration,
      safety_signals: extraction.safety_signals,
      service_outage_signals: extraction.service_outage_signals,
      detected_vision_signals: intake.detectedVisionSignals,
      transcription: intake.transcription || null,
      keywords: extraction.keywords,
      has_pii: piiResult.hasPII,
      masked_text: piiResult.maskedText,
      requires_human_review: requiresReview,
    };
  }

  /**
   * Batch processes all complaints with processingStatus 'UNPROCESSED'.
   */
  public static async batchProcessUnprocessed(limit: number = 25) {
    const unprocessed = await prisma.complaint.findMany({
      where: { processingStatus: 'UNPROCESSED' },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const results: UnifiedPipelineOutput[] = [];
    for (const c of unprocessed) {
      try {
        const out = await this.processComplaint(c);
        results.push(out);
      } catch (err: any) {
        console.error(`[AIPipeline] Error processing complaint ${c.id}:`, err);
      }
    }

    return {
      totalBatched: unprocessed.length,
      successfullyProcessed: results.length,
      items: results,
    };
  }
}
