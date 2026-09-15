import prisma from '../../config/prisma';

export interface ClassificationResult {
  department: string | null;
  category: string | null;
  confidence: number;
  evidence: string[];
  reason: string;
  alternative_candidates: Array<{ department: string; category: string; confidence: number }>;
  requires_human_review: boolean;
}

export class TaxonomyClassifier {
  /**
   * Classifies complaint text against active database taxonomy only.
   */
  public static async classify(text: string): Promise<ClassificationResult> {
    if (!text || text.trim().length < 5) {
      return {
        department: null,
        category: null,
        confidence: 0.0,
        evidence: [],
        reason: 'Complaint text is empty or insufficient for department routing.',
        alternative_candidates: [],
        requires_human_review: true,
      };
    }

    const departments = await prisma.department.findMany({
      where: { active: true },
      include: {
        categories: {
          where: { active: true },
        },
      },
    });

    const lower = text.toLowerCase();
    const candidates: Array<{
      deptName: string;
      catName: string;
      confidence: number;
      matchedTerms: string[];
      reason: string;
    }> = [];

    // Category-specific keyword profiles
    const categoryProfiles: Record<string, { keywords: string[]; weight: number }> = {
      'Pothole Repair': { keywords: ['pothole', 'gaddha', 'khada', 'crater', 'pit', 'bike wale gir'], weight: 0.85 },
      'Damaged Footpath / Pavement': { keywords: ['footpath', 'pavement', 'paver block', 'paver tiles', 'tiles tooti'], weight: 0.85 },
      'Waterlogged Road Surface': { keywords: ['waterlogged', 'jalbharao', 'jalbhor', 'pani bhara'], weight: 0.80 },
      'Pipeline Burst / Leakage': { keywords: ['pipeline', 'burst', 'phat gayi', 'leakage', 'leak', 'water leak', 'line leak'], weight: 0.90 },
      'Low Water Pressure': { keywords: ['drinking water', 'supply band', 'pani nahi', 'water supply', 'pressure kam', 'peene ka pani'], weight: 0.85 },
      'Contaminated / Turbid Water': { keywords: ['contaminated', 'ganda pani', 'turbid', 'badboo wala pani', 'peela pani'], weight: 0.85 },
      'Streetlight Not Glowing': { keywords: ['streetlight', 'street light', 'pole fuse', 'andhera', 'dark', 'not glowing', 'tube light', 'light band'], weight: 0.85 },
      'Hanging / Exposed Cable': { keywords: ['live wire', 'wire latak', 'hanging cable', 'taar latak', 'sparks', 'current', 'wire'], weight: 0.90 },
      'Damaged Electric Pole': { keywords: ['electric pole', 'pole damaged', 'khamba toot', 'pole bent'], weight: 0.85 },
      'Sewage Backflow in Residential Area': { keywords: ['chamber overflow', 'sewage overflow', 'sewage backflow', 'ganda pani raste par', 'sewer overflow'], weight: 0.85 },
      'Open / Missing Manhole Cover': { keywords: ['manhole', 'manhole cover', 'chamber cover missing', 'dhakkan nahi'], weight: 0.90 },
      'Stormwater Drain Clogged': { keywords: ['drainage nali', 'drain blocked', 'nali jam', 'stormwater', 'nali blocked'], weight: 0.85 },
      'Illegal Roadside Dumping': { keywords: ['kachre ka dher', 'roadside dumping', 'kachra fek', 'illegal dump', 'kachra gaadi nahi'], weight: 0.85 },
      'Garbage Bin Overflow': { keywords: ['garbage clearing', 'garbage bin', 'kachra peti', 'dustbin overflow', 'kachra overflow'], weight: 0.85 },
      'Debris / Malba Removal': { keywords: ['malba', 'construction debris', 'malba road par', 'cement debris'], weight: 0.85 },
      'Dangerous / Fallen Tree Branch': { keywords: ['ped ki daal', 'tree fall', 'branch fall', 'fallen tree', 'ped gir'], weight: 0.90 },
      'Unclassified Triage': { keywords: ['unknown', 'general inquiry', 'admin'], weight: 0.40 },
    };

    for (const dept of departments) {
      for (const cat of dept.categories) {
        let score = 0;
        const matchedTerms: string[] = [];

        // Check category-specific profile
        const profile = categoryProfiles[cat.name];
        if (profile) {
          for (const kw of profile.keywords) {
            if (lower.includes(kw)) {
              score += profile.weight;
              matchedTerms.push(kw);
              break; // one primary keyword hit from profile
            }
          }
        }

        // Secondary token overlap from category name
        const catTokens = cat.name.toLowerCase().split(/[\s\/,&-]+/).filter((t) => t.length > 2);
        for (const token of catTokens) {
          if (lower.includes(token) && !matchedTerms.includes(token)) {
            score += 0.20;
            matchedTerms.push(token);
          }
        }

        if (score > 0) {
          const normalizedScore = Math.min(0.96, Math.max(0.45, score));
          candidates.push({
            deptName: dept.name,
            catName: cat.name,
            confidence: normalizedScore,
            matchedTerms,
            reason: `Grievance text matched key civic terms: ${matchedTerms.map((m) => `"${m}"`).join(', ')}.`,
          });
        }
      }
    }

    candidates.sort((a, b) => b.confidence - a.confidence);

    if (candidates.length === 0) {
      // Default to general triage under General Civic Services if no domain keyword matched
      const generalDept = departments.find((d) => d.name.includes('General')) || departments[0];
      const generalCat = generalDept?.categories[0];
      return {
        department: generalDept?.name || 'General Civic Services',
        category: generalCat?.name || 'Unclassified Triage',
        confidence: 0.45,
        evidence: ['No specific domain keywords identified'],
        reason: 'Grievance description does not align with specific municipal functional keywords. Routed to General Civic Services for human triage.',
        alternative_candidates: [],
        requires_human_review: true,
      };
    }

    const top = candidates[0];
    const alternatives = candidates.slice(1, 4).map((c) => ({
      department: c.deptName,
      category: c.catName,
      confidence: c.confidence,
    }));

    const isAmbiguous = candidates.length > 1 && top.confidence - candidates[1].confidence < 0.08;
    const requiresReview = top.confidence < 0.75 || isAmbiguous;

    return {
      department: top.deptName,
      category: top.catName,
      confidence: top.confidence,
      evidence: top.matchedTerms,
      reason: top.reason,
      alternative_candidates: alternatives,
      requires_human_review: requiresReview,
    };
  }
}
