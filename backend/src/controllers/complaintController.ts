import { Request, Response } from 'express';
import { ComplaintService } from '../services/complaintService';
import { sendSuccess, sendError } from '../utils/response';

export class ComplaintController {
  public static async listComplaints(req: Request, res: Response) {
    try {
      const filters = req.query;
      const result = await ComplaintService.listComplaints(filters);
      return sendSuccess(res, result, 'Complaints retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async getComplaintById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const complaint = await ComplaintService.getComplaintById(id);
      if (!complaint) {
        return sendError(res, `Complaint not found with ID or reference '${id}'`, 404);
      }
      return sendSuccess(res, complaint, 'Complaint details retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async updateComplaint(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await ComplaintService.updateComplaint(id, req.body);
      return sendSuccess(res, updated, 'Complaint updated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async updateAcknowledgementDraft(req: Request, res: Response) {
    try {
      const { draftId } = req.params;
      const updated = await ComplaintService.updateAcknowledgementDraft(draftId, req.body);
      return sendSuccess(res, updated, 'Draft updated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
