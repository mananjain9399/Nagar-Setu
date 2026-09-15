import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';
import { sendSuccess, sendError } from '../utils/response';

export class DashboardController {
  public static async getStats(req: Request, res: Response) {
    try {
      const stats = await DashboardService.getDashboardStats();
      return sendSuccess(res, stats, 'Dashboard statistics loaded successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
