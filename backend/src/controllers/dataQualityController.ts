import { Request, Response } from 'express';
import { DataQualityService } from '../services/dataQuality/dataQualityService';
import { sendSuccess, sendError } from '../utils/response';

export class DataQualityController {
  public static async getQualityStats(req: Request, res: Response) {
    try {
      const summary = await DataQualityService.analyzeDatasetQuality();
      return sendSuccess(res, summary, 'Data quality summary generated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async getQualityIssues(req: Request, res: Response) {
    try {
      const summary = await DataQualityService.analyzeDatasetQuality();
      return sendSuccess(res, summary.detectedIssues, 'Data quality issues retrieved');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
