import prisma from '../config/prisma';
import { ReviewSubmissionDTO } from '../types';

export class ReviewService {
  public static async submitReview(complaintId: string, dto: ReviewSubmissionDTO) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      throw new Error(`Complaint not found with ID ${complaintId}`);
    }

    // 1. Create the OperatorReview record
    const review = await prisma.operatorReview.create({
      data: {
        complaintId,
        reviewedBy: dto.reviewedBy || 'Operator-BPL-General',
        decision: dto.decision,
        comments: dto.comments || null,
        modifiedFields: dto.modifiedFields ? (dto.modifiedFields as any) : undefined,
      },
    });

    // 2. Prepare complaint updates
    const updateData: any = {
      requiresHumanReview: false,
    };

    if (dto.decision === 'ACCEPTED') {
      updateData.processingStatus = 'PROCESSED';
    } else if (dto.decision === 'REJECTED') {
      updateData.processingStatus = 'REJECTED';
    } else if (dto.decision === 'MARKED_DUPLICATE') {
      updateData.duplicateStatus = 'CONFIRMED_DUPLICATE';
    } else if (dto.decision === 'MODIFIED' && dto.modifiedFields) {
      updateData.processingStatus = 'PROCESSED';
      if (dto.modifiedFields.department) updateData.department = dto.modifiedFields.department;
      if (dto.modifiedFields.category) updateData.category = dto.modifiedFields.category;
      if (dto.modifiedFields.urgency) updateData.urgency = dto.modifiedFields.urgency;
      if (dto.modifiedFields.ward) updateData.ward = dto.modifiedFields.ward;
      if (dto.modifiedFields.locality) updateData.locality = dto.modifiedFields.locality;
    } else if (dto.decision === 'ESCALATED') {
      updateData.urgency = 'CRITICAL';
      updateData.requiresHumanReview = true;
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: updateData,
    });

    // 3. Log processing timeline entry
    await prisma.complaintProcessing.create({
      data: {
        complaintId,
        stage: 'OPERATOR_REVIEW',
        status: 'COMPLETED',
        outputSummary: `Operator [${dto.reviewedBy}] evaluated decision: ${dto.decision}. ${
          dto.comments ? `Comments: "${dto.comments}"` : 'No comments provided.'
        }`,
        confidence: 1.0,
      },
    });

    return {
      review,
      complaint: updatedComplaint,
    };
  }

  public static async getComplaintReviews(complaintId: string) {
    return prisma.operatorReview.findMany({
      where: { complaintId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
