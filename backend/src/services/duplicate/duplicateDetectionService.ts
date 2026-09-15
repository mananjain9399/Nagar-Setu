import prisma from '../../config/prisma';

export interface DuplicateDetectionResult {
  complaintId: string;
  duplicate_status: 'UNIQUE' | 'POSSIBLE_DUPLICATE' | 'CONFIRMED_DUPLICATE';
  master_complaint_id: string | null;
  cluster_id: string | null;
  cluster_name?: string | null;
  similarity_score: number;
  signals: {
    semanticSimilarity: number;
    locationMatch: boolean;
    sameWard: boolean;
    sameCategory: boolean;
    sameDepartment: boolean;
    timeDeltaHours: number;
  };
  reason: string;
  requires_human_review: boolean;
}

export class DuplicateDetectionService {
  /**
   * Tokenizes and computes Jaccard / n-gram token overlap between two texts.
   */
  private static computeSemanticSimilarity(textA: string, textB: string): number {
    const clean = (t: string) =>
      t
        .toLowerCase()
        .replace(/[^\w\s\u0900-\u097F]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2);

    const tokensA = new Set(clean(textA));
    const tokensB = new Set(clean(textB));

    if (tokensA.size === 0 || tokensB.size === 0) return 0.0;

    let intersection = 0;
    tokensA.forEach((tok) => {
      if (tokensB.has(tok)) intersection++;
    });

    const union = new Set([...tokensA, ...tokensB]).size;
    return union > 0 ? parseFloat((intersection / union).toFixed(2)) : 0.0;
  }

  /**
   * Detects duplicates for a given complaint against the existing active dataset.
   */
  public static async evaluateDuplicates(complaintId: string): Promise<DuplicateDetectionResult> {
    const target = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { duplicateCluster: true },
    });

    if (!target) {
      throw new Error(`Complaint not found: ${complaintId}`);
    }

    // Fetch other complaints in same department or locality or within recent window
    const candidates = await prisma.complaint.findMany({
      where: {
        id: { not: target.id },
      },
      include: { duplicateCluster: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    let bestMatch: any = null;
    let highestCompositeScore = 0;
    let bestSignals = {
      semanticSimilarity: 0,
      locationMatch: false,
      sameWard: false,
      sameCategory: false,
      sameDepartment: false,
      timeDeltaHours: 9999,
    };

    for (const cand of candidates) {
      const semanticSim = this.computeSemanticSimilarity(target.rawText, cand.rawText);

      const locMatch = Boolean(
        target.locality &&
        cand.locality &&
        target.locality.trim().toLowerCase() === cand.locality.trim().toLowerCase()
      );

      const wardMatch = Boolean(
        target.ward &&
        cand.ward &&
        target.ward.trim().toLowerCase() === cand.ward.trim().toLowerCase()
      );

      const catMatch = Boolean(
        target.category &&
        cand.category &&
        target.category.trim().toLowerCase() === cand.category.trim().toLowerCase()
      );

      const deptMatch = Boolean(
        target.department &&
        cand.department &&
        target.department.trim().toLowerCase() === cand.department.trim().toLowerCase()
      );

      const timeDeltaMs = Math.abs(new Date(target.createdAt).getTime() - new Date(cand.createdAt).getTime());
      const timeDeltaHours = parseFloat((timeDeltaMs / (1000 * 60 * 60)).toFixed(1));

      // Multi-signal weighted score
      let score = 0;
      score += semanticSim * 0.40;
      if (locMatch) score += 0.25;
      else if (wardMatch) score += 0.12;

      if (catMatch) score += 0.20;
      else if (deptMatch) score += 0.10;

      // Time proximity boost (within 24 hours)
      if (timeDeltaHours <= 12) score += 0.15;
      else if (timeDeltaHours <= 48) score += 0.08;

      if (score > highestCompositeScore) {
        highestCompositeScore = score;
        bestMatch = cand;
        bestSignals = {
          semanticSimilarity: semanticSim,
          locationMatch: locMatch,
          sameWard: wardMatch,
          sameCategory: catMatch,
          sameDepartment: deptMatch,
          timeDeltaHours,
        };
      }
    }

    // Determine status based on multi-signal composite score
    let duplicateStatus: 'UNIQUE' | 'POSSIBLE_DUPLICATE' | 'CONFIRMED_DUPLICATE' = 'UNIQUE';
    let reason = 'Complaint appears unique across geographic location, civic category, and intake timeline.';
    let clusterId = target.duplicateClusterId || null;
    let masterId = target.duplicateOfId || null;

    if (highestCompositeScore >= 0.85 && bestMatch) {
      duplicateStatus = 'CONFIRMED_DUPLICATE';
      masterId = bestMatch.id;
      clusterId = bestMatch.duplicateClusterId || clusterId;
      reason = `Near-identical grievance detected (Score: ${(highestCompositeScore * 100).toFixed(0)}%) in same locality ('${target.locality || 'Unknown'}'), category ('${target.category || 'Unknown'}'), and intake window (${bestSignals.timeDeltaHours}h apart). Linked with master ticket ${bestMatch.externalId || bestMatch.id}.`;
    } else if (highestCompositeScore >= 0.58 && bestMatch) {
      duplicateStatus = 'POSSIBLE_DUPLICATE';
      masterId = bestMatch.id;
      clusterId = bestMatch.duplicateClusterId || clusterId;
      reason = `Potential incident overlap detected (Score: ${(highestCompositeScore * 100).toFixed(0)}%) sharing ${bestSignals.locationMatch ? 'identical locality' : 'same ward'} and ${bestSignals.sameCategory ? 'category' : 'department'}. Human review required to confirm clustering.`;
    }

    // Persist duplicate assessment onto target complaint
    await prisma.complaint.update({
      where: { id: target.id },
      data: {
        duplicateStatus,
        duplicateOfId: masterId,
        duplicateClusterId: clusterId,
        requiresHumanReview: duplicateStatus === 'POSSIBLE_DUPLICATE' ? true : target.requiresHumanReview,
      },
    });

    return {
      complaintId: target.id,
      duplicate_status: duplicateStatus,
      master_complaint_id: masterId,
      cluster_id: clusterId,
      cluster_name: target.duplicateCluster?.clusterName,
      similarity_score: parseFloat(highestCompositeScore.toFixed(2)),
      signals: bestSignals,
      reason,
      requires_human_review: duplicateStatus === 'POSSIBLE_DUPLICATE',
    };
  }

  /**
   * Clusters complaints or confirms a cluster relationship.
   */
  public static async manageCluster(params: {
    complaintId: string;
    action: 'CONFIRM_DUPLICATE' | 'REJECT_DUPLICATE' | 'SEPARATE' | 'MERGE_CLUSTER';
    masterComplaintId?: string;
    clusterName?: string;
    operatorCallSign?: string;
  }) {
    const { complaintId, action, masterComplaintId, clusterName, operatorCallSign } = params;

    if (action === 'CONFIRM_DUPLICATE' && masterComplaintId) {
      // Find master or create cluster
      const master = await prisma.complaint.findUnique({
        where: { id: masterComplaintId },
        include: { duplicateCluster: true },
      });

      let clusterId = master?.duplicateClusterId;
      if (!clusterId) {
        const newCluster = await prisma.duplicateCluster.create({
          data: {
            clusterName: clusterName || `Incident Cluster: ${master?.locality || 'Bhopal'} (${master?.category || 'Civic Issue'})`,
            primaryComplaintId: master?.id,
            status: 'ACTIVE',
            similarityScore: 0.90,
            reason: `Grouped by operator ${operatorCallSign || 'Console'} after multi-channel review.`,
          },
        });
        clusterId = newCluster.id;
        if (master) {
          await prisma.complaint.update({
            where: { id: master.id },
            data: { duplicateClusterId: clusterId },
          });
        }
      }

      await prisma.complaint.update({
        where: { id: complaintId },
        data: {
          duplicateStatus: 'CONFIRMED_DUPLICATE',
          duplicateOfId: masterComplaintId,
          duplicateClusterId: clusterId,
        },
      });

      await prisma.auditLog.create({
        data: {
          complaintId,
          action: 'CLUSTER_CONFIRM_DUPLICATE',
          actor: operatorCallSign || 'Operator',
          details: `Confirmed as duplicate of master ${masterComplaintId}. Attached to cluster ${clusterId}.`,
        },
      });

      return { success: true, clusterId, duplicateStatus: 'CONFIRMED_DUPLICATE' };
    }

    if (action === 'REJECT_DUPLICATE' || action === 'SEPARATE') {
      await prisma.complaint.update({
        where: { id: complaintId },
        data: {
          duplicateStatus: 'UNIQUE',
          duplicateOfId: null,
          duplicateClusterId: null,
        },
      });

      await prisma.auditLog.create({
        data: {
          complaintId,
          action: 'CLUSTER_SEPARATE',
          actor: operatorCallSign || 'Operator',
          details: `Separated from duplicate cluster. Marked as unique ticket.`,
        },
      });

      return { success: true, duplicateStatus: 'UNIQUE' };
    }

    return { success: false, message: 'Invalid cluster action specified.' };
  }

  public static async listClusters() {
    return prisma.duplicateCluster.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        complaints: {
          select: {
            id: true,
            externalId: true,
            sourceChannel: true,
            rawText: true,
            urgency: true,
            locality: true,
            ward: true,
            createdAt: true,
          },
        },
      },
    });
  }
}
