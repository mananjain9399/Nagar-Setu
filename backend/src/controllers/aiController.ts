import { Request, Response } from 'express';
import { AIPipeline } from '../services/ai/aiPipeline';
import { AIService } from '../services/ai/aiService';
import { sendSuccess, sendError } from '../utils/response';

export class AIController {
  public static async getStatus(req: Request, res: Response) {
    try {
      const config = AIService.getConfiguration();
      return sendSuccess(res, config, 'AI service status retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async processComplaint(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await AIPipeline.processComplaint(id);
      return sendSuccess(res, result, 'Complaint processed through AI pipeline successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async processRawText(req: Request, res: Response) {
    try {
      const { rawText, mediaType, mediaUrl, caption } = req.body;
      if (!rawText && !caption) {
        return sendError(res, 'rawText or caption is required for live AI analysis', 400);
      }
      const result = await AIPipeline.processComplaint({
        rawText: rawText || caption || '',
        mediaType,
        mediaUrl,
        caption,
      });
      return sendSuccess(res, result, 'Interactive AI analysis completed successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async batchProcess(req: Request, res: Response) {
    try {
      const limit = parseInt(String(req.query.limit || '25'), 10);
      const result = await AIPipeline.batchProcessUnprocessed(limit);
      return sendSuccess(res, result, 'Batch processing completed');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
