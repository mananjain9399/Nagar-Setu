import { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService';
import { sendSuccess, sendError } from '../utils/response';

export class ReviewController {
  public static async submitReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reviewedBy, decision, comments, modifiedFields } = req.body;

      if (!decision) {
        return sendError(res, 'Review decision is required', 400);
      }

      const result = await ReviewService.submitReview(id, {
        reviewedBy: reviewedBy || 'Operator-BPL-General',
        decision,
        comments,
        modifiedFields,
      });

      return sendSuccess(res, result, 'Operator review registered successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async getReviews(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const reviews = await ReviewService.getComplaintReviews(id);
      return sendSuccess(res, reviews, 'Reviews retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
