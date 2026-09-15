import fs from 'fs';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import prisma from '../config/prisma';
import { ImportResultSummary } from '../types';

export interface RawImportRecord {
  complaint_id?: string;
  external_id?: string;
  id?: string;
  ticket_no?: string;

  source_channel?: string;
  channel?: string;
  source?: string;

  complaint_text?: string;
  text?: string;
  raw_text?: string;
  description?: string;

  language?: string;
  lang?: string;

  image_reference?: string;
  media_url?: string;
  media_reference?: string;
  image_url?: string;

  caption?: string;
  image_caption?: string;

  timestamp?: string;
  date?: string;
  created_at?: string;

  locality?: string;
  location?: string;
  area?: string;

  ward?: string;
  ward_no?: string;

  partner_department?: string;
  department?: string;

  partner_category?: string;
  category?: string;

  partner_urgency?: string;
  urgency?: string;
  priority?: string;
}

export class ImportService {
  public static normalizeRecord(raw: any, index: number) {
    // 1. External ID
    const externalId =
      raw.complaint_id ||
      raw.external_id ||
      raw.id ||
      raw.ticket_no ||
      `IMP-${Date.now().toString().slice(-6)}-${index + 1}`;

    // 2. Source Channel
    let sourceChannel = (raw.source_channel || raw.channel || raw.source || 'MANUAL_IMPORT').toUpperCase();
    if (sourceChannel.includes('181') || sourceChannel.includes('CM')) {
      sourceChannel = 'CM_HELPLINE_181';
    } else if (sourceChannel.includes('APP')) {
      sourceChannel = 'MUNICIPAL_APP';
    } else if (sourceChannel.includes('REP') || sourceChannel.includes('MLA') || sourceChannel.includes('VIP')) {
      sourceChannel = 'ELECTED_REP';
    } else if (sourceChannel.includes('TWITTER') || sourceChannel.includes('SOCIAL') || sourceChannel.includes('FB')) {
      sourceChannel = 'SOCIAL_MEDIA';
    }

    // 3. Raw Text
    const rawText = (
      raw.complaint_text ||
      raw.text ||
      raw.raw_text ||
      raw.description ||
      ''
    ).trim();

    if (!rawText) {
      throw new Error(`Record at line ${index + 1} is missing mandatory complaint text.`);
    }

    // 4. Language detection fallback
    let language = (raw.language || raw.lang || '').toLowerCase().trim();
    if (!language) {
      // Basic heuristic: check for Devanagari Unicode range
      const hasDevanagari = /[\u0900-\u097F]/.test(rawText);
      language = hasDevanagari ? 'hi' : 'en';
    }

    // 5. Media info
    const mediaUrl = raw.image_reference || raw.media_url || raw.media_reference || raw.image_url || null;
    const mediaType = mediaUrl ? (mediaUrl.endsWith('.pdf') ? 'DOCUMENT' : 'IMAGE') : 'NONE';
    const caption = raw.caption || raw.image_caption || (mediaUrl ? `Imported media reference: ${mediaUrl}` : null);

    // 6. Timestamp
    let createdAt = new Date();
    const rawDate = raw.timestamp || raw.date || raw.created_at;
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        createdAt = parsed;
      }
    }

    // 7. Location & Ward
    const locality = raw.locality || raw.location || raw.area || 'Unknown Locality';
    const ward = raw.ward || raw.ward_no || null;

    // 8. Partner Labels (if provided in export)
    const department = raw.partner_department || raw.department || null;
    const category = raw.partner_category || raw.category || null;
    let urgency = (raw.partner_urgency || raw.urgency || raw.priority || 'MEDIUM').toUpperCase();
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(urgency)) {
      urgency = 'MEDIUM';
    }

    // Processing status: If department and category are known from export, mark as PROCESSED or REQUIRES_REVIEW
    const isCategorized = !!(department && category);
    const processingStatus = isCategorized ? 'PROCESSED' : 'UNPROCESSED';
    const requiresHumanReview = !isCategorized || urgency === 'CRITICAL';

    return {
      externalId,
      sourceChannel,
      rawText,
      language,
      mediaType,
      mediaUrl,
      caption,
      createdAt,
      locality,
      ward,
      department,
      category,
      urgency,
      processingStatus,
      confidence: isCategorized ? 0.85 : null,
      requiresHumanReview,
      duplicateStatus: 'UNIQUE',
      isSynthetic: true,
      explanation: isCategorized
        ? `Imported with partner-provided labels [${department} / ${category}].`
        : 'Imported from external export dataset. Pending operator review and zone pipeline classification.',
    };
  }

  public static async processRecords(records: any[]): Promise<ImportResultSummary> {
    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < records.length; i++) {
      try {
        const normalized = this.normalizeRecord(records[i], i);

        // Check for duplicate external ID
        const existing = await prisma.complaint.findFirst({
          where: { externalId: normalized.externalId },
        });

        if (existing) {
          skippedCount++;
          errors.push(`Record ${normalized.externalId} skipped: already exists in database.`);
          continue;
        }

        const created = await prisma.complaint.create({
          data: normalized,
        });

        // Record initial Ingestion stage
        await prisma.complaintProcessing.create({
          data: {
            complaintId: created.id,
            stage: 'INGESTION',
            status: 'COMPLETED',
            outputSummary: `Dataset import completed. Source: ${normalized.sourceChannel}. Length: ${normalized.rawText.length} chars.`,
            confidence: 1.0,
          },
        });

        importedCount++;
      } catch (err: any) {
        skippedCount++;
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return {
      totalRows: records.length,
      importedCount,
      skippedCount,
      errors: errors.slice(0, 10), // return top 10 error snippets
    };
  }

  public static async importFromCSVString(csvContent: string): Promise<ImportResultSummary> {
    return new Promise((resolve, reject) => {
      const records: any[] = [];
      const stream = Readable.from([csvContent]);

      stream
        .pipe(
          csvParser({
            mapHeaders: ({ header }) => header.trim().toLowerCase().replace(/\s+/g, '_'),
          })
        )
        .on('data', (data) => records.push(data))
        .on('end', async () => {
          try {
            const summary = await this.processRecords(records);
            resolve(summary);
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => reject(err));
    });
  }

  public static async importFromJSON(data: any[]): Promise<ImportResultSummary> {
    if (!Array.isArray(data)) {
      throw new Error('Expected a JSON array of complaint records');
    }
    return this.processRecords(data);
  }
}
