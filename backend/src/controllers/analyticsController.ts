import { Request, Response } from 'express';
import { WeeklyDigestService } from '../services/analytics/weeklyDigestService';
import { EvaluationService } from '../services/evaluation/evaluationService';
import { DuplicateDetectionService } from '../services/duplicate/duplicateDetectionService';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export class AnalyticsController {
  public static async getWeeklyDigest(req: Request, res: Response) {
    try {
      const digest = await WeeklyDigestService.generateDigest();
      return sendSuccess(res, digest, 'Weekly municipal digest retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async runEvaluation(req: Request, res: Response) {
    try {
      const evaluation = await EvaluationService.runBenchmark();
      return sendSuccess(res, evaluation, 'Held-out evaluation benchmark completed successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async getClusters(req: Request, res: Response) {
    try {
      const clusters = await DuplicateDetectionService.listClusters();
      return sendSuccess(res, clusters, 'Duplicate clusters retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async manageCluster(req: Request, res: Response) {
    try {
      const result = await DuplicateDetectionService.manageCluster(req.body);
      return sendSuccess(res, result, 'Cluster action recorded successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async getAuditLogs(req: Request, res: Response) {
    try {
      const { complaintId, limit = 50 } = req.query;
      const where: any = {};
      if (complaintId) where.complaintId = String(complaintId);

      const logs = await prisma.auditLog.findMany({
        where,
        take: parseInt(String(limit), 10),
        orderBy: { createdAt: 'desc' },
      });
      return sendSuccess(res, logs, 'Audit logs retrieved');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async exportData(req: Request, res: Response) {
    try {
      const { format = 'json' } = req.params;
      const complaints = await prisma.complaint.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          duplicateCluster: true,
          processingResult: true,
          acknowledgementDrafts: true,
        },
      });

      if (format.toLowerCase() === 'csv') {
        const headers = [
          'id',
          'externalId',
          'sourceChannel',
          'department',
          'category',
          'urgency',
          'locality',
          'ward',
          'duplicateStatus',
          'confidence',
          'createdAt',
        ];
        const rows = complaints.map((c) =>
          [
            c.id,
            c.externalId || '',
            c.sourceChannel,
            c.department || 'Unassigned',
            c.category || 'Unassigned',
            c.urgency,
            c.locality || '',
            c.ward || '',
            c.duplicateStatus,
            c.confidence || '',
            c.createdAt.toISOString(),
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(',')
        );

        const csvContent = [headers.join(','), ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="bhopal_civic_tickets_export.csv"');
        return res.send(csvContent);
      }

      return sendSuccess(res, complaints, 'Dataset export completed');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
