export interface StructuredIntakeOutput {
  language: 'hi' | 'en' | 'hi-en';
  summary: string;
  issue_description: string;
  location_text: string | null;
  duration: string | null;
  safety_signals: string[];
  service_outage_signals: string[];
  affected_people_signal: string | null;
  keywords: string[];
  category_candidate: string | null;
  confidence: number;
  missing_information: string[];
  requires_human_review: boolean;
}

export class IssueExtractor {
  public static extract(text: string, language: 'hi' | 'en' | 'hi-en'): StructuredIntakeOutput {
    if (!text || text.trim().length < 5) {
      return {
        language,
        summary: 'Insufficient complaint details provided.',
        issue_description: 'Record text empty or truncated.',
        location_text: null,
        duration: null,
        safety_signals: [],
        service_outage_signals: [],
        affected_people_signal: null,
        keywords: [],
        category_candidate: null,
        confidence: 0.2,
        missing_information: ['Complaint text', 'Location', 'Issue category'],
        requires_human_review: true,
      };
    }

    const lower = text.toLowerCase();
    const missing: string[] = [];
    const safetySignals: string[] = [];
    const serviceOutageSignals: string[] = [];
    let affectedPeopleSignal: string | null = null;
    let duration: string | null = null;
    let locationText: string | null = null;

    // 1. Duration extraction
    // Looks for phrases like "past 3 days", "last 2 weeks", "since yesterday", "15 दिनों से", "3 दिन से", "subah se"
    const durationRegex = /(?:past|last|for|since)?\s*(\d{1,3}\s*(?:days?|weeks?|months?|hours?|din|mahine|ghante)|\b(?:yesterday|subah se|kal se|aaj subah|morning)\b)/i;
    const durationMatch = text.match(durationRegex);
    if (durationMatch) {
      duration = durationMatch[0].trim();
    } else {
      // Do NOT invent duration!
      duration = null;
    }

    // 2. Safety Signals
    if (
      lower.includes('electric') || lower.includes('wire') || lower.includes('current') ||
      lower.includes('spark') || lower.includes('taar') || lower.includes('current') ||
      lower.includes('short circuit') || lower.includes('shock')
    ) {
      safetySignals.push('EXPOSED_ELECTRICAL_HAZARD');
    }
    if (
      lower.includes('accident') || lower.includes('gir gaye') || lower.includes('slip') ||
      lower.includes('cave-in') || lower.includes('dhans gayi') || lower.includes('danger') ||
      lower.includes('khatra') || lower.includes('deep pothole') || lower.includes('chot')
    ) {
      safetySignals.push('TRAFFIC_ACCIDENT_OR_CAVEIN_RISK');
    }
    if (
      lower.includes('gas') || lower.includes('fire') || lower.includes('aag') ||
      lower.includes('toxic') || lower.includes('dhua') || lower.includes('smoke')
    ) {
      safetySignals.push('FIRE_OR_TOXIC_EMISSION');
    }

    // 3. Service Outage Signals
    if (
      lower.includes('no water') || lower.includes('pani nahi') || lower.includes('paani band') ||
      lower.includes('water supply') || lower.includes('drinking water') || lower.includes('pipeline burst')
    ) {
      serviceOutageSignals.push('DRINKING_WATER_OUTAGE');
    }
    if (
      lower.includes('power cut') || lower.includes('no power') || lower.includes('bijli gul') ||
      lower.includes('light nahi') || lower.includes('transformer') || lower.includes('dark street') ||
      lower.includes('andhera')
    ) {
      serviceOutageSignals.push('ELECTRICITY_OUTAGE');
    }
    if (
      lower.includes('sewage overflow') || lower.includes('ganda pani') || lower.includes('nali overflow') ||
      lower.includes('drain blocked') || lower.includes('choked drain')
    ) {
      serviceOutageSignals.push('SANITATION_SEWAGE_OUTAGE');
    }

    // 4. Affected people signal
    const peopleMatch = text.match(/(\d{1,5}\s*(?:people|residents|families|log|parivar|gharon))/i);
    if (peopleMatch) {
      affectedPeopleSignal = peopleMatch[0];
    } else if (lower.includes('entire colony') || lower.includes('puri colony') || lower.includes('pura mohalla') || lower.includes('all residents')) {
      affectedPeopleSignal = 'Neighborhood-wide (Colony-level)';
    }

    // 5. Location Extraction Heuristics
    const locPatterns = [
      /(?:near|at|in|behind|opp|opposite|ke paas|ke samne|road|colony|nagar|market|bhopal)\s+([A-Z0-9\u0900-\u097F][A-Za-z0-9\u0900-\u097F\s\-\/]{3,35})/i,
      /(?:वार्ड|ward)\s*([0-9]{1,3})/i
    ];

    for (const pat of locPatterns) {
      const m = text.match(pat);
      if (m && m[0]) {
        locationText = m[0].trim();
        break;
      }
    }

    if (!locationText) {
      missing.push('Clear Location Evidence');
    }

    // 6. Keywords Extraction
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with', 'from',
      'hai', 'ke', 'ki', 'ko', 'se', 'me', 'mein', 'par', 'aur', 'kya', 'tha', 'thi', 'ho', 'gaya'
    ]);
    const words = text
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    const freqMap = new Map<string, number>();
    for (const w of words) {
      freqMap.set(w, (freqMap.get(w) || 0) + 1);
    }
    const keywords = Array.from(freqMap.keys()).slice(0, 7);

    // Summary generation (first 1-2 clean sentences)
    const sentences = text.split(/[.!?।\n]+/).map((s) => s.trim()).filter(Boolean);
    const summary = sentences[0] || text.slice(0, 120);
    const issueDescription = sentences.slice(0, 3).join('. ') || text;

    // Determine initial category candidate
    let categoryCandidate: string | null = null;
    if (lower.includes('water') || lower.includes('pani') || lower.includes('leak') || lower.includes('pipeline')) {
      categoryCandidate = 'Pipeline Burst / Leakage';
    } else if (lower.includes('pothole') || lower.includes('gaddha') || lower.includes('sadak') || lower.includes('road')) {
      categoryCandidate = 'Potholes / Road Repair';
    } else if (lower.includes('garbage') || lower.includes('kachra') || lower.includes('safai') || lower.includes('dump')) {
      categoryCandidate = 'Garbage Collection / Dumping';
    } else if (lower.includes('light') || lower.includes('pole') || lower.includes('bijli') || lower.includes('dark')) {
      categoryCandidate = 'Streetlight Non-functional';
    } else if (lower.includes('drain') || lower.includes('nali') || lower.includes('sewage') || lower.includes('overflow')) {
      categoryCandidate = 'Blocked Drain / Overflow';
    }

    const confidence = missing.length === 0 ? 0.92 : 0.65;

    return {
      language,
      summary,
      issue_description: issueDescription,
      location_text: locationText,
      duration,
      safety_signals: safetySignals,
      service_outage_signals: serviceOutageSignals,
      affected_people_signal: affectedPeopleSignal,
      keywords,
      category_candidate: categoryCandidate,
      confidence,
      missing_information: missing,
      requires_human_review: confidence < 0.75 || safetySignals.length > 0 || missing.length > 0,
    };
  }
}
