import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING ENHANCED DATABASE SEEDING ---');

  // 1. Seed Departments & Categories from Configurable Taxonomy
  const taxonomyPath = path.resolve(__dirname, '../src/config/taxonomy.config.json');
  if (!fs.existsSync(taxonomyPath)) {
    throw new Error(`Taxonomy config file not found at ${taxonomyPath}`);
  }

  const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf-8'));
  console.log(`[Seed] Loading ${taxonomy.departments.length} departments & categories...`);

  for (const dept of taxonomy.departments) {
    const savedDept = await prisma.department.upsert({
      where: { code: dept.code },
      update: {
        name: dept.name,
        description: dept.description,
        active: true,
      },
      create: {
        code: dept.code,
        name: dept.name,
        description: dept.description,
        active: true,
      },
    });

    if (dept.categories && Array.isArray(dept.categories)) {
      for (const catName of dept.categories) {
        const catCode = `${dept.code}_${catName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase().slice(0, 20)}`;
        await prisma.category.upsert({
          where: { code: catCode },
          update: {
            name: catName,
            departmentId: savedDept.id,
            active: true,
          },
          create: {
            code: catCode,
            name: catName,
            departmentId: savedDept.id,
            active: true,
          },
        });
      }
    }
  }

  // 2. Seed Wards & Localities from Synthetic Bhopal Gazetteer
  const gazetteerPath = path.resolve(__dirname, '../../data/synthetic_bhopal_gazetteer.json');
  if (fs.existsSync(gazetteerPath)) {
    const gazetteer = JSON.parse(fs.readFileSync(gazetteerPath, 'utf-8'));
    console.log(`[Seed] Loading ${gazetteer.wards.length} gazetteer wards...`);

    for (const w of gazetteer.wards) {
      const savedWard = await prisma.ward.upsert({
        where: { wardNumber: w.wardNumber },
        update: {
          wardName: w.wardName,
          zone: w.zone || null,
          active: w.active ?? true,
        },
        create: {
          wardNumber: w.wardNumber,
          wardName: w.wardName,
          zone: w.zone || null,
          active: w.active ?? true,
        },
      });

      if (w.localities && Array.isArray(w.localities)) {
        for (const loc of w.localities) {
          const existingLoc = await prisma.locality.findFirst({
            where: { name: loc.name, wardId: savedWard.id },
          });

          if (existingLoc) {
            await prisma.locality.update({
              where: { id: existingLoc.id },
              data: {
                aliases: loc.aliases || [],
                spellingVariants: loc.spellingVariants || [],
                landmarkTerms: loc.landmarkTerms || [],
                latitude: loc.latitude || null,
                longitude: loc.longitude || null,
                active: loc.active ?? true,
                isSynthetic: true,
              },
            });
          } else {
            await prisma.locality.create({
              data: {
                name: loc.name,
                wardId: savedWard.id,
                aliases: loc.aliases || [],
                spellingVariants: loc.spellingVariants || [],
                landmarkTerms: loc.landmarkTerms || [],
                latitude: loc.latitude || null,
                longitude: loc.longitude || null,
                active: loc.active ?? true,
                isSynthetic: true,
              },
            });
          }
        }
      }
    }
  }

  // 3. Seed Synthetic Complaints
  const syntheticDataPath = path.resolve(__dirname, '../../data/synthetic_bhopal_complaints.json');
  if (fs.existsSync(syntheticDataPath)) {
    const syntheticData = JSON.parse(fs.readFileSync(syntheticDataPath, 'utf-8'));
    console.log(`[Seed] Syncing ${syntheticData.records.length} synthetic complaints...`);

    for (const item of syntheticData.records) {
      const existing = await prisma.complaint.findFirst({
        where: { externalId: item.externalId },
      });

      let complaintId = existing?.id;

      if (existing) {
        await prisma.complaint.update({
          where: { id: existing.id },
          data: {
            sourceChannel: item.sourceChannel,
            rawText: item.rawText,
            mediaType: item.mediaType,
            mediaUrl: item.mediaUrl,
            caption: item.caption,
            language: item.language,
            department: item.department,
            category: item.category,
            urgency: item.urgency,
            ward: item.ward,
            locality: item.locality,
            createdAt: new Date(item.createdAt),
            processedAt: item.processedAt ? new Date(item.processedAt) : null,
            processingStatus: item.processingStatus,
            confidence: item.confidence,
            requiresHumanReview: item.requiresHumanReview,
            duplicateStatus: item.duplicateStatus,
            duplicateOfId: item.duplicateOfId,
            explanation: item.explanation,
            structuredData: item.structuredData,
            isSynthetic: true,
          },
        });
      } else {
        const created = await prisma.complaint.create({
          data: {
            externalId: item.externalId,
            sourceChannel: item.sourceChannel,
            rawText: item.rawText,
            mediaType: item.mediaType,
            mediaUrl: item.mediaUrl,
            caption: item.caption,
            language: item.language,
            department: item.department,
            category: item.category,
            urgency: item.urgency,
            ward: item.ward,
            locality: item.locality,
            createdAt: new Date(item.createdAt),
            processedAt: item.processedAt ? new Date(item.processedAt) : null,
            processingStatus: item.processingStatus,
            confidence: item.confidence,
            requiresHumanReview: item.requiresHumanReview,
            duplicateStatus: item.duplicateStatus,
            duplicateOfId: item.duplicateOfId,
            explanation: item.explanation,
            structuredData: item.structuredData,
            isSynthetic: true,
          },
        });
        complaintId = created.id;
      }

      // Processing Records
      if (complaintId && item.processingStages && item.processingStages.length > 0) {
        await prisma.complaintProcessing.deleteMany({
          where: { complaintId },
        });

        for (const stage of item.processingStages) {
          await prisma.complaintProcessing.create({
            data: {
              complaintId,
              stage: stage.stage,
              status: stage.status,
              outputSummary: stage.outputSummary,
              confidence: stage.confidence,
            },
          });
        }
      }

      // ProcessingResult record
      if (complaintId) {
        await prisma.processingResult.upsert({
          where: { complaintId },
          update: {
            detectedLanguage: item.language || 'hi-en',
            extractedLocality: item.locality,
            extractedWard: item.ward,
            classifiedDepartment: item.department,
            classifiedCategory: item.category,
            assessedUrgency: item.urgency,
            confidenceScore: item.confidence,
            isPotentialDuplicate: item.duplicateStatus === 'POSSIBLE_DUPLICATE',
            reasoningSummary: item.explanation,
            entitiesExtracted: item.structuredData || {},
          },
          create: {
            complaintId,
            detectedLanguage: item.language || 'hi-en',
            extractedLocality: item.locality,
            extractedWard: item.ward,
            classifiedDepartment: item.department,
            classifiedCategory: item.category,
            assessedUrgency: item.urgency,
            confidenceScore: item.confidence,
            isPotentialDuplicate: item.duplicateStatus === 'POSSIBLE_DUPLICATE',
            reasoningSummary: item.explanation,
            entitiesExtracted: item.structuredData || {},
          },
        });

        // AcknowledgementDraft template
        const hasDraft = await prisma.acknowledgementDraft.findFirst({
          where: { complaintId },
        });

        if (!hasDraft) {
          const isHindi = item.language === 'hi';
          const draftText = isHindi
            ? `प्रिय नागरिक, आपकी शिकायत [${item.externalId}] नगर निगम भोपाल द्वारा दर्ज कर ली गई है। विषय: ${item.category || 'नागरिक समस्या'} (${item.locality || 'वार्ड क्षेत्र'})। संबंधित विभाग: ${item.department || 'क्षेत्रीय कार्यालय'}। त्वरित निरीक्षण हेतु फील्ड टीम को प्रेषित किया गया है। - भोपाल नगर निगम`
            : `Dear Citizen, your complaint [${item.externalId}] regarding ${item.category || 'civic issue'} at ${item.locality || 'your ward'} has been registered with Bhopal Municipal Corporation. Assigned to: ${item.department || 'Zonal Office'}. Field team dispatched. - BMC Zone Operations`;

          await prisma.acknowledgementDraft.create({
            data: {
              complaintId,
              channel: item.sourceChannel === 'CM_HELPLINE_181' ? 'SMS' : 'APP_NOTIFICATION',
              language: item.language || 'hi-en',
              templateCode: 'ACK_GRIEVANCE_INTAKE',
              draftedText: draftText,
              status: item.processingStatus === 'PROCESSED' ? 'DRAFT' : 'DRAFT',
            },
          });
        }
      }
    }
  }

  // 4. DuplicateCluster linking for Kolar Road complaints
  const kolar1 = await prisma.complaint.findFirst({ where: { externalId: 'CM181-2026-08191' } });
  const kolar2 = await prisma.complaint.findFirst({ where: { externalId: 'CM181-2026-08194' } });

  if (kolar1 && kolar2) {
    let cluster = await prisma.duplicateCluster.findFirst({
      where: { clusterName: 'Kolar Road Sarvadharma Water Pipeline Rupture' },
    });

    if (!cluster) {
      cluster = await prisma.duplicateCluster.create({
        data: {
          clusterName: 'Kolar Road Sarvadharma Water Pipeline Rupture',
          primaryComplaintId: kolar1.id,
          similarityScore: 0.93,
          reason: 'Identical grievance location within 50m of Sarvadharma Bridge and submitted within 15-minute window via CM Helpline 181.',
          status: 'ACTIVE',
        },
      });
    }

    await prisma.complaint.update({
      where: { id: kolar1.id },
      data: { duplicateClusterId: cluster.id },
    });

    await prisma.complaint.update({
      where: { id: kolar2.id },
      data: { duplicateClusterId: cluster.id, duplicateOfId: kolar1.id },
    });
  }

  // 5. Sample Operator Review
  const reviewedComplaint = await prisma.complaint.findFirst({
    where: { externalId: 'REP-2026-00441' },
  });

  if (reviewedComplaint) {
    await prisma.operatorReview.deleteMany({
      where: { complaintId: reviewedComplaint.id },
    });

    await prisma.operatorReview.create({
      data: {
        complaintId: reviewedComplaint.id,
        reviewedBy: 'Operator-BPL-Zone3',
        decision: 'ACCEPTED',
        comments: 'Verified with Ward 28 Corporator office. Emergency super sucker jetting truck approved for immediate dispatch.',
        modifiedFields: {
          urgency: 'HIGH',
          department: 'Drainage & Sewerage Operations',
        },
      },
    });

    // Mark acknowledgement draft as approved
    await prisma.acknowledgementDraft.updateMany({
      where: { complaintId: reviewedComplaint.id },
      data: {
        status: 'OPERATOR_APPROVED',
        editedBy: 'Operator-BPL-Zone3',
      },
    });
  }

  console.log('--- ENHANCED SEEDING COMPLETED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error('[Seed Error]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
