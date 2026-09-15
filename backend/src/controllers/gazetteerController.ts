import { Request, Response } from 'express';
import { GazetteerService } from '../services/gazetteer/gazetteerService';
import { sendSuccess, sendError } from '../utils/response';

export class GazetteerController {
  public static async getWards(req: Request, res: Response) {
    try {
      const wards = await GazetteerService.getWards();
      return sendSuccess(res, wards, 'Wards retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async getLocalities(req: Request, res: Response) {
    try {
      const localities = await GazetteerService.getLocalities();
      return sendSuccess(res, localities, 'Localities retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async getOverlaps(req: Request, res: Response) {
    try {
      const overlaps = await GazetteerService.detectOverlappingAliases();
      return sendSuccess(res, overlaps, 'Overlapping alias detection completed');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async importGazetteer(req: Request, res: Response) {
    try {
      let records = req.body.records || req.body;
      if (req.file) {
        const fs = await import('fs');
        const content = fs.readFileSync(req.file.path, 'utf-8');
        try { fs.unlinkSync(req.file.path); } catch (e) {}
        records = await GazetteerService.parseGazetteerCSV(content);
      } else if (req.body.csvData) {
        records = await GazetteerService.parseGazetteerCSV(req.body.csvData);
      }

      if (!Array.isArray(records)) {
        return sendError(res, 'Expected an array of gazetteer records or CSV file', 400);
      }

      const result = await GazetteerService.importGazetteerRecords(records);
      return sendSuccess(res, result, 'Gazetteer records imported successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
