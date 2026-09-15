import prisma from '../../config/prisma';

export interface NormalisationCandidate {
  locality: string;
  ward: string | null;
  confidence: number;
  matchedOn: string;
  matchType: 'EXACT_NAME' | 'ALIAS' | 'SPELLING_VARIANT' | 'LANDMARK' | 'TOKEN_OVERLAP';
}

export interface NormalisationResult {
  raw_location: string;
  normalized_locality: string | null;
  ward: string | null;
  confidence: number;
  matched_alias: string | null;
  matched_term?: string | null;
  explanation: string;
  requires_review: boolean;
  candidates: NormalisationCandidate[];
}

export class LocalityNormalizer {
  private static cleanText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, ' ') // keep letters, numbers, spaces, and Devanagari
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static removeNoiseWords(text: string): string {
    const noiseWords = [
      'near', 'opp', 'opposite', 'behind', 'in front of', 'next to',
      'ke paas', 'ke samne', 'me', 'mein', 'par', 'road', 'marg',
      'chauraha', 'chowk', 'circle', 'square', 'cross', 'trisection',
      'colony', 'bhopal', 'area', 'ward', 'zone'
    ];

    let cleaned = text;
    for (const nw of noiseWords) {
      const regex = new RegExp(`\\b${nw}\\b`, 'gi');
      cleaned = cleaned.replace(regex, ' ');
    }
    return cleaned.replace(/\s+/g, ' ').trim();
  }

  private static extractExplicitWard(text: string): string | null {
    // Looks for patterns like "ward 47", "ward no. 47", "ward #47", "वार्ड 47", "वार्ड नं 47"
    const regex = /(?:ward|ward\s*no\.?|ward\s*#|वार्ड|वार्ड\s*नं\.?)\s*([0-9]{1,3})/i;
    const match = text.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      const formatted = num < 10 ? `Ward 0${num}` : `Ward ${num}`;
      return formatted;
    }
    return null;
  }

  public static async normalize(rawLocation: string): Promise<NormalisationResult> {
    if (!rawLocation || rawLocation.trim() === '') {
      return {
        raw_location: rawLocation || '',
        normalized_locality: null,
        ward: null,
        confidence: 0.0,
        matched_alias: null,
        matched_term: null,
        explanation: 'Location text is empty or missing. Insufficient evidence to assign ward or locality.',
        requires_review: true,
        candidates: [],
      };
    }

    const cleaned = this.cleanText(rawLocation);
    const stripped = this.removeNoiseWords(cleaned);
    const explicitWard = this.extractExplicitWard(rawLocation);

    // Fetch active gazetteer localities with wards
    const localities = await prisma.locality.findMany({
      where: { active: true },
      include: { ward: true },
    });

    const candidateScores: NormalisationCandidate[] = [];

    for (const loc of localities) {
      const locNameClean = this.cleanText(loc.name);
      const wardNum = loc.ward?.wardNumber || null;

      // 1. Check Exact Primary Name
      if (cleaned === locNameClean || stripped === locNameClean) {
        candidateScores.push({
          locality: loc.name,
          ward: wardNum,
          confidence: 0.96,
          matchedOn: loc.name,
          matchType: 'EXACT_NAME',
        });
        continue;
      }

      if (cleaned.includes(locNameClean) || (locNameClean.length > 3 && stripped.includes(locNameClean))) {
        candidateScores.push({
          locality: loc.name,
          ward: wardNum,
          confidence: 0.93,
          matchedOn: loc.name,
          matchType: 'EXACT_NAME',
        });
        continue;
      }

      // 2. Check Aliases
      for (const alias of loc.aliases || []) {
        const aliasClean = this.cleanText(alias);
        if (aliasClean.length < 3) continue;

        if (cleaned === aliasClean || stripped === aliasClean) {
          candidateScores.push({
            locality: loc.name,
            ward: wardNum,
            confidence: 0.91,
            matchedOn: alias,
            matchType: 'ALIAS',
          });
          break;
        }

        if (cleaned.includes(aliasClean)) {
          candidateScores.push({
            locality: loc.name,
            ward: wardNum,
            confidence: 0.88,
            matchedOn: alias,
            matchType: 'ALIAS',
          });
          break;
        }
      }

      // 3. Check Spelling Variants (Hindi Devanagari & Transliterations)
      for (const variant of loc.spellingVariants || []) {
        const variantClean = this.cleanText(variant);
        if (variantClean.length < 3) continue;

        if (cleaned.includes(variantClean) || rawLocation.includes(variant)) {
          candidateScores.push({
            locality: loc.name,
            ward: wardNum,
            confidence: 0.86,
            matchedOn: variant,
            matchType: 'SPELLING_VARIANT',
          });
          break;
        }
      }

      // 4. Check Landmark Terms
      for (const landmark of loc.landmarkTerms || []) {
        const landmarkClean = this.cleanText(landmark);
        if (landmarkClean.length < 3) continue;

        if (cleaned.includes(landmarkClean)) {
          candidateScores.push({
            locality: loc.name,
            ward: wardNum,
            confidence: 0.82,
            matchedOn: landmark,
            matchType: 'LANDMARK',
          });
          break;
        }
      }
    }

    // Sort candidate scores descending by confidence
    candidateScores.sort((a, b) => b.confidence - a.confidence);

    // Deduplicate candidateScores by locality
    const uniqueCandidates: NormalisationCandidate[] = [];
    const seen = new Set<string>();
    for (const cand of candidateScores) {
      if (!seen.has(cand.locality)) {
        seen.add(cand.locality);
        uniqueCandidates.push(cand);
      }
    }

    // SCENARIO 1: No matches found in gazetteer
    if (uniqueCandidates.length === 0) {
      if (explicitWard) {
        return {
          raw_location: rawLocation,
          normalized_locality: null,
          ward: explicitWard,
          confidence: 0.70,
          matched_alias: null,
          matched_term: explicitWard,
          explanation: `Identified explicit ward '${explicitWard}' directly from text, but locality could not be matched with any gazetteer entry.`,
          requires_review: true,
          candidates: [],
        };
      }

      return {
        raw_location: rawLocation,
        normalized_locality: null,
        ward: null,
        confidence: 0.0,
        matched_alias: null,
        matched_term: null,
        explanation: 'No matching locality, alias, or landmark found in gazetteer. Insufficient evidence to infer ward.',
        requires_review: true,
        candidates: [],
      };
    }

    const top = uniqueCandidates[0];

    // SCENARIO 2: Ambiguous matches (multiple candidates with close confidence)
    const second = uniqueCandidates[1];
    const isAmbiguous =
      second &&
      top.confidence - second.confidence < 0.10 &&
      top.ward !== second.ward;

    if (isAmbiguous) {
      return {
        raw_location: rawLocation,
        normalized_locality: top.locality,
        ward: explicitWard || top.ward,
        confidence: Math.max(0.55, top.confidence - 0.20),
        matched_alias: top.matchedOn,
        matched_term: top.matchedOn,
        explanation: `Ambiguous location input matches multiple potential localities: '${top.locality}' (${top.ward || 'Unknown'}) vs '${second.locality}' (${second.ward || 'Unknown'}). Operator verification required.`,
        requires_review: true,
        candidates: uniqueCandidates.slice(0, 4),
      };
    }

    // SCENARIO 3: Clear Match
    let finalWard = top.ward;
    let explanationNote = '';

    if (explicitWard) {
      if (top.ward && top.ward !== explicitWard) {
        explanationNote = ` Note: Text mentioned '${explicitWard}' while gazetteer mapped '${top.locality}' to '${top.ward}'. Operator verification flagged.`;
        return {
          raw_location: rawLocation,
          normalized_locality: top.locality,
          ward: explicitWard, // respect explicit citizen claim
          confidence: 0.75,
          matched_alias: top.matchedOn,
          matched_term: top.matchedOn,
          explanation: `Matched locality '${top.locality}' on ${top.matchType} ('${top.matchedOn}').${explanationNote}`,
          requires_review: true,
          candidates: uniqueCandidates.slice(0, 3),
        };
      }
      finalWard = explicitWard;
    }

    let finalConfidence = top.confidence;
    if (explicitWard && top.ward === explicitWard) {
      finalConfidence = Math.min(0.98, top.confidence + 0.05); // boost confidence when explicit ward agrees with gazetteer
    }

    const explanation = `Matched ${top.matchType.replace('_', ' ').toLowerCase()} '${top.matchedOn}' with verified gazetteer locality '${top.locality}' mapped to '${finalWard || 'Unassigned Ward'}'.`;

    return {
      raw_location: rawLocation,
      normalized_locality: top.locality,
      ward: finalWard,
      confidence: finalConfidence,
      matched_alias: top.matchedOn,
      matched_term: top.matchedOn,
      explanation,
      requires_review: finalConfidence < 0.85 || !finalWard,
      candidates: uniqueCandidates.slice(0, 3),
    };
  }
}
