import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { ComplaintFilterQuery } from '../types';

export class ComplaintService {
  public static async listComplaints(filters: ComplaintFilterQuery) {
    const page = Math.max(1, parseInt(filters.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.ComplaintWhereInput = {};

    // 1. Department filter
    if (filters.department && filters.department !== 'ALL') {
      if (filters.department === 'UNASSIGNED') {
        where.department = null;
      } else {
        where.department = filters.department;
      }
    }

    // 2. Category filter
    if (filters.category && filters.category !== 'ALL') {
      where.category = filters.category;
    }

    // 3. Urgency filter
    if (filters.urgency && filters.urgency !== 'ALL') {
      where.urgency = filters.urgency;
    }

    // 4. Ward filter
    if (filters.ward && filters.ward !== 'ALL') {
      where.ward = filters.ward;
    }

    // 5. Locality filter
    if (filters.locality && filters.locality !== 'ALL') {
      where.locality = filters.locality;
    }

    // 6. Source Channel filter
    if (filters.sourceChannel && filters.sourceChannel !== 'ALL') {
      where.sourceChannel = filters.sourceChannel;
    }

    // 7. Language filter
    if (filters.language && filters.language !== 'ALL') {
      where.language = filters.language;
    }

    // 8. Duplicate Status filter
    if (filters.duplicateStatus && filters.duplicateStatus !== 'ALL') {
      where.duplicateStatus = filters.duplicateStatus;
    }

    // 9. Review Status filter
    if (filters.reviewStatus && filters.reviewStatus !== 'ALL') {
      if (filters.reviewStatus === 'REQUIRES_HUMAN_REVIEW') {
        where.requiresHumanReview = true;
      } else if (filters.reviewStatus === 'REVIEWED') {
        where.reviews = { some: {} };
      } else if (filters.reviewStatus === 'PENDING_REVIEW') {
        where.requiresHumanReview = true;
        where.reviews = { none: {} };
      }
    }

    // 10. Processing Status filter
    if (filters.processingStatus && filters.processingStatus !== 'ALL') {
      where.processingStatus = filters.processingStatus;
    }

    // 11. Text search
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.trim();
      where.OR = [
        { externalId: { contains: q, mode: 'insensitive' } },
        { rawText: { contains: q, mode: 'insensitive' } },
        { locality: { contains: q, mode: 'insensitive' } },
        { ward: { contains: q, mode: 'insensitive' } },
        { caption: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ComplaintOrderByWithRelationInput = {};
    if (filters.sortBy) {
      const order = filters.sortOrder === 'asc' ? 'asc' : 'desc';
      (orderBy as any)[filters.sortBy] = order;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [items, totalCount] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          reviews: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              reviews: true,
              processingRecords: true,
            },
          },
        },
      }),
      prisma.complaint.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  public static async getComplaintById(idOrExternalId: string) {
    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [{ id: idOrExternalId }, { externalId: idOrExternalId }],
      },
      include: {
        processingRecords: {
          orderBy: { createdAt: 'asc' },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
        acknowledgementDrafts: {
          orderBy: { createdAt: 'desc' },
        },
        duplicateCluster: {
          include: {
            complaints: {
              select: {
                id: true,
                externalId: true,
                rawText: true,
                urgency: true,
                sourceChannel: true,
              },
            },
          },
        },
        processingResult: true,
      },
    });

    if (!complaint) return null;

    let duplicateOf = null;
    if (complaint.duplicateOfId) {
      duplicateOf = await prisma.complaint.findFirst({
        where: {
          OR: [{ id: complaint.duplicateOfId }, { externalId: complaint.duplicateOfId }],
        },
        select: {
          id: true,
          externalId: true,
          sourceChannel: true,
          rawText: true,
          urgency: true,
          createdAt: true,
          department: true,
        },
      });
    }

    // Also check if other complaints consider this as duplicateOfId
    const clusteredDuplicates = await prisma.complaint.findMany({
      where: {
        duplicateOfId: complaint.externalId || complaint.id,
      },
      select: {
        id: true,
        externalId: true,
        sourceChannel: true,
        rawText: true,
        urgency: true,
        createdAt: true,
        department: true,
        confidence: true,
      },
    });

    return {
      ...complaint,
      duplicateOf,
      clusteredDuplicates,
    };
  }

  public static async updateComplaint(id: string, data: Prisma.ComplaintUpdateInput) {
    return prisma.complaint.update({
      where: { id },
      data,
    });
  }

  public static async updateAcknowledgementDraft(
    draftId: string,
    data: { draftedText?: string; status?: string; editedBy?: string }
  ) {
    return prisma.acknowledgementDraft.update({
      where: { id: draftId },
      data,
    });
  }
}
