import { Request, Response } from 'express';
import { TaxonomyManager } from '../services/taxonomy/taxonomyManager';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export class TaxonomyController {
  public static async getTaxonomy(req: Request, res: Response) {
    try {
      const taxonomy = await TaxonomyManager.getFullTaxonomy();
      return sendSuccess(res, taxonomy, 'Partner taxonomy retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async getDepartments(req: Request, res: Response) {
    try {
      const departments = await prisma.department.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
        include: { categories: true },
      });
      return sendSuccess(res, departments, 'Departments retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async getLocations(req: Request, res: Response) {
    try {
      const [wards, localities] = await Promise.all([
        prisma.ward.findMany({ where: { active: true }, select: { wardNumber: true } }),
        prisma.locality.findMany({ where: { active: true }, select: { name: true } }),
      ]);
      return sendSuccess(res, {
        wards: wards.map((w) => w.wardNumber),
        localities: localities.map((l) => l.name),
      }, 'Locations retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async validateTaxonomy(req: Request, res: Response) {
    try {
      let records = req.body.records || req.body;
      if (req.file) {
        const fs = await import('fs');
        const content = fs.readFileSync(req.file.path, 'utf-8');
        try { fs.unlinkSync(req.file.path); } catch (e) {}
        records = await TaxonomyManager.parseCSVString(content);
      } else if (req.body.csvData) {
        records = await TaxonomyManager.parseCSVString(req.body.csvData);
      }

      const report = TaxonomyManager.validateTaxonomyPayload(records);
      return sendSuccess(res, report, 'Taxonomy validation report generated');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async importTaxonomy(req: Request, res: Response) {
    try {
      let records = req.body.records || req.body;
      if (req.file) {
        const fs = await import('fs');
        const content = fs.readFileSync(req.file.path, 'utf-8');
        try { fs.unlinkSync(req.file.path); } catch (e) {}
        records = await TaxonomyManager.parseCSVString(content);
      } else if (req.body.csvData) {
        records = await TaxonomyManager.parseCSVString(req.body.csvData);
      }

      if (!Array.isArray(records)) {
        return sendError(res, 'Expected an array of taxonomy records or valid CSV file', 400);
      }

      const result = await TaxonomyManager.importTaxonomy(records);
      return sendSuccess(res, result, 'Partner taxonomy imported successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
