import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { ImportService } from '../services/importService';
import { sendSuccess, sendError } from '../utils/response';

export class ImportController {
  public static async importJSON(req: Request, res: Response) {
    try {
      const records = req.body.records || req.body;
      if (!Array.isArray(records)) {
        return sendError(res, 'Invalid JSON body: expected an array of complaint objects', 400);
      }

      const result = await ImportService.importFromJSON(records);
      return sendSuccess(res, result, `Successfully processed ${result.importedCount} records`);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async importCSV(req: Request, res: Response) {
    try {
      let csvContent = '';

      if (req.file) {
        csvContent = fs.readFileSync(req.file.path, 'utf-8');
        // Clean up uploaded temp file
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {}
      } else if (req.body.csvData) {
        csvContent = req.body.csvData;
      } else if (typeof req.body === 'string') {
        csvContent = req.body;
      } else {
        return sendError(res, 'No CSV file uploaded or CSV text provided', 400);
      }

      const result = await ImportService.importFromCSVString(csvContent);
      return sendSuccess(res, result, `Successfully processed ${result.importedCount} records from CSV`);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async importSampleCSV(req: Request, res: Response) {
    try {
      const samplePath = path.resolve(__dirname, '../../../data/sample_anonymised_export.csv');
      if (!fs.existsSync(samplePath)) {
        return sendError(res, 'Sample CSV file not found on server', 404);
      }

      const csvContent = fs.readFileSync(samplePath, 'utf-8');
      const result = await ImportService.importFromCSVString(csvContent);
      return sendSuccess(res, result, `Imported ${result.importedCount} sample records`);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
