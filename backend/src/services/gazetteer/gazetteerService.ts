import csvParser from 'csv-parser';
import { Readable } from 'stream';
import prisma from '../../config/prisma';

export interface AliasOverlap {
  term: string;
  type: 'ALIAS' | 'LANDMARK' | 'SPELLING_VARIANT';
  occurrences: Array<{
    localityName: string;
    wardNumber: string;
    wardName: string;
  }>;
}

export class GazetteerService {
  public static async getWards() {
    return prisma.ward.findMany({
      orderBy: { wardNumber: 'asc' },
      include: {
        localities: {
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  public static async getLocalities() {
    return prisma.locality.findMany({
      orderBy: { name: 'asc' },
      include: {
        ward: true,
      },
    });
  }

  public static async detectOverlappingAliases(): Promise<AliasOverlap[]> {
    const localities = await prisma.locality.findMany({
      where: { active: true },
      include: { ward: true },
    });

    const aliasMap = new Map<string, Array<{ localityName: string; wardNumber: string; wardName: string }>>();
    const landmarkMap = new Map<string, Array<{ localityName: string; wardNumber: string; wardName: string }>>();

    localities.forEach((loc) => {
      const wardNum = loc.ward?.wardNumber || 'Unassigned';
      const wardName = loc.ward?.wardName || 'Unknown';

      // Check aliases & spelling variants
      const allAliases = [...(loc.aliases || []), ...(loc.spellingVariants || [])];
      allAliases.forEach((alias) => {
        const clean = alias.trim().toLowerCase();
        if (clean.length < 3) return; // ignore trivial 1-2 char words
        if (!aliasMap.has(clean)) {
          aliasMap.set(clean, []);
        }
        const list = aliasMap.get(clean)!;
        if (!list.some((item) => item.localityName === loc.name && item.wardNumber === wardNum)) {
          list.push({ localityName: loc.name, wardNumber: wardNum, wardName });
        }
      });

      // Check landmarks
      (loc.landmarkTerms || []).forEach((landmark) => {
        const clean = landmark.trim().toLowerCase();
        if (clean.length < 3) return;
        if (!landmarkMap.has(clean)) {
          landmarkMap.set(clean, []);
        }
        const list = landmarkMap.get(clean)!;
        if (!list.some((item) => item.localityName === loc.name && item.wardNumber === wardNum)) {
          list.push({ localityName: loc.name, wardNumber: wardNum, wardName });
        }
      });
    });

    const overlaps: AliasOverlap[] = [];

    aliasMap.forEach((occurrences, term) => {
      if (occurrences.length > 1) {
        overlaps.push({
          term,
          type: 'ALIAS',
          occurrences,
        });
      }
    });

    landmarkMap.forEach((occurrences, term) => {
      if (occurrences.length > 1) {
        overlaps.push({
          term,
          type: 'LANDMARK',
          occurrences,
        });
      }
    });

    return overlaps;
  }

  public static async parseGazetteerCSV(csvContent: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from([csvContent]);
      stream
        .pipe(
          csvParser({
            mapHeaders: ({ header }) => header.trim().toLowerCase().replace(/\s+/g, '_'),
          })
        )
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }

  public static async importGazetteerRecords(records: any[]) {
    let wardCount = 0;
    let localityCount = 0;

    for (const row of records) {
      const wardNumber = (row.ward_id || row.ward_number || row.ward || '').trim();
      const wardName = (row.ward_name || row.name || `Ward ${wardNumber}`).trim();
      const zone = (row.zone || '').trim() || null;
      const localityName = (row.locality_name || row.locality || '').trim();

      if (!wardNumber && !localityName) continue;

      let wardId: string | null = null;
      if (wardNumber) {
        const savedWard = await prisma.ward.upsert({
          where: { wardNumber },
          update: {
            wardName,
            zone,
            active: true,
          },
          create: {
            wardNumber,
            wardName,
            zone,
            active: true,
          },
        });
        wardId = savedWard.id;
        wardCount++;
      }

      if (localityName) {
        const parseList = (val: any): string[] => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          return String(val)
            .split(/[;,|]/)
            .map((s) => s.trim())
            .filter(Boolean);
        };

        const aliases = parseList(row.aliases);
        const spellingVariants = parseList(row.spelling_variants);
        const landmarkTerms = parseList(row.landmark_terms || row.landmarks);
        const latitude = row.latitude ? parseFloat(row.latitude) : null;
        const longitude = row.longitude ? parseFloat(row.longitude) : null;

        const existing = await prisma.locality.findFirst({
          where: { name: localityName, wardId },
        });

        if (existing) {
          await prisma.locality.update({
            where: { id: existing.id },
            data: {
              aliases: Array.from(new Set([...existing.aliases, ...aliases])),
              spellingVariants: Array.from(new Set([...existing.spellingVariants, ...spellingVariants])),
              landmarkTerms: Array.from(new Set([...existing.landmarkTerms, ...landmarkTerms])),
              latitude: latitude || existing.latitude,
              longitude: longitude || existing.longitude,
              active: true,
            },
          });
        } else {
          await prisma.locality.create({
            data: {
              name: localityName,
              wardId,
              aliases,
              spellingVariants,
              landmarkTerms,
              latitude,
              longitude,
              active: true,
              isSynthetic: true,
            },
          });
        }
        localityCount++;
      }
    }

    return {
      success: true,
      importedWards: wardCount,
      importedLocalities: localityCount,
    };
  }
}
