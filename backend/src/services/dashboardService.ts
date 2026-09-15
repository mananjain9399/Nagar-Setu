import prisma from '../config/prisma';
import { DashboardStatsResponse } from '../types';

export class DashboardService {
  public static async getDashboardStats(): Promise<DashboardStatsResponse> {
    const [
      totalComplaints,
      unprocessedCount,
      processedCount,
      possibleDuplicatesCount,
      requiresHumanReviewCount,
      criticalCount,
      highCount,
      reviewedCount,
    ] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { processingStatus: 'UNPROCESSED' } }),
      prisma.complaint.count({ where: { processingStatus: 'PROCESSED' } }),
      prisma.complaint.count({
        where: {
          duplicateStatus: {
            in: ['POSSIBLE_DUPLICATE', 'CONFIRMED_DUPLICATE'],
          },
        },
      }),
      prisma.complaint.count({ where: { requiresHumanReview: true } }),
      prisma.complaint.count({ where: { urgency: 'CRITICAL' } }),
      prisma.complaint.count({ where: { urgency: 'HIGH' } }),
      prisma.operatorReview.count(),
    ]);

    // Breakdown by Department
    const deptGroups = await prisma.complaint.groupBy({
      by: ['department'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const byDepartment = deptGroups.map((g) => ({
      name: g.department || 'Unassigned / Triage Needed',
      count: g._count.id,
    }));

    // Breakdown by Category
    const categoryGroups = await prisma.complaint.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const byCategory = categoryGroups.map((g) => ({
      name: g.category || 'Uncategorized',
      count: g._count.id,
    }));

    // Breakdown by Locality
    const localityGroups = await prisma.complaint.groupBy({
      by: ['locality'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const byLocality = localityGroups.map((g) => ({
      name: g.locality || 'Unknown Locality',
      count: g._count.id,
    }));

    // Breakdown by Ward
    const wardGroups = await prisma.complaint.groupBy({
      by: ['ward'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const byWard = wardGroups.map((g) => ({
      name: g.ward || 'Unknown Ward',
      count: g._count.id,
    }));

    // Breakdown by Source Channel
    const channelGroups = await prisma.complaint.groupBy({
      by: ['sourceChannel'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const bySourceChannel = channelGroups.map((g) => ({
      channel: g.sourceChannel,
      count: g._count.id,
    }));

    // Breakdown by Urgency
    const urgencyGroups = await prisma.complaint.groupBy({
      by: ['urgency'],
      _count: { id: true },
    });

    const byUrgency = urgencyGroups.map((g) => ({
      urgency: g.urgency,
      count: g._count.id,
    }));

    // Breakdown by Language
    const langGroups = await prisma.complaint.groupBy({
      by: ['language'],
      _count: { id: true },
    });

    const byLanguage = langGroups.map((g) => ({
      language: g.language || 'Unknown',
      count: g._count.id,
    }));

    return {
      summary: {
        totalComplaints,
        unprocessedCount,
        processedCount,
        possibleDuplicatesCount,
        requiresHumanReviewCount,
        criticalOrHighUrgencyCount: criticalCount + highCount,
        criticalCount,
        highCount,
        reviewedCount,
      },
      byDepartment,
      byCategory,
      byLocality,
      byWard,
      bySourceChannel,
      byUrgency,
      byLanguage,
    };
  }
}
