import { Request, Response } from 'express';
import { LocalityNormalizer } from '../services/locality/localityNormalizer';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export class LocalityController {
  public static async normalizeLocation(req: Request, res: Response) {
    try {
      const location = req.body.location || req.body.text || req.body.raw_location || '';
      const result = await LocalityNormalizer.normalize(location);
      return sendSuccess(res, result, 'Location normalisation completed');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  public static async lookup(req: Request, res: Response) {
    try {
      const q = (req.query.q as string || '').trim().toLowerCase();
      if (!q) {
        const all = await prisma.locality.findMany({
          take: 20,
          include: { ward: true },
        });
        return sendSuccess(res, all);
      }

      const results = await prisma.locality.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { aliases: { has: q } },
            { spellingVariants: { has: q } },
            { landmarkTerms: { has: q } },
          ],
        },
        include: { ward: true },
      });

      return sendSuccess(res, results, 'Lookup completed');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
