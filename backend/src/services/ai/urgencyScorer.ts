export type UrgencyTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface UrgencyScoreResult {
  urgency: UrgencyTier;
  score: number;
  public_safety: boolean;
  service_outage: boolean;
  duration: string | null;
  evidence: string[];
  reason: string;
  confidence: number;
  requires_human_review: boolean;
}

export class UrgencyScorer {
  /**
   * Scores urgency based STRICTLY on the three agreed criteria:
   * 1. Public safety risk
   * 2. Essential municipal service outage
   * 3. Problem duration
   */
  public static evaluateUrgency(params: {
    text: string;
    safetySignals: string[];
    serviceOutageSignals: string[];
    durationText: string | null;
  }): UrgencyScoreResult {
    const { text, safetySignals, serviceOutageSignals, durationText } = params;
    const lower = text.toLowerCase();
    const evidence: string[] = [];

    let hasPublicSafety = safetySignals.length > 0;
    let hasServiceOutage = serviceOutageSignals.length > 0;

    // Safety evidence check
    if (safetySignals.includes('EXPOSED_ELECTRICAL_HAZARD')) {
      evidence.push('Exposed live electrical hazard / wire spark reported (Public Safety)');
    }
    if (safetySignals.includes('TRAFFIC_ACCIDENT_OR_CAVEIN_RISK')) {
      evidence.push('Severe road cave-in / accident risk reported (Public Safety)');
    }
    if (safetySignals.includes('FIRE_OR_TOXIC_EMISSION')) {
      evidence.push('Smoke, fire, or toxic fumes reported (Public Safety)');
    }

    // Outage evidence check
    if (serviceOutageSignals.includes('DRINKING_WATER_OUTAGE')) {
      evidence.push('Drinking water supply disrupted or main pipeline burst (Service Outage)');
    }
    if (serviceOutageSignals.includes('ELECTRICITY_OUTAGE')) {
      evidence.push('Electrical blackout / transformer failure (Service Outage)');
    }
    if (serviceOutageSignals.includes('SANITATION_SEWAGE_OUTAGE')) {
      evidence.push('Severe sewage inundation / health hazard (Service Outage)');
    }

    // Duration check - strictly do NOT invent duration if absent
    let durationWeight = 0;
    if (durationText) {
      evidence.push(`Issue continuing for: ${durationText} (Duration)`);
      const daysMatch = durationText.match(/(\d{1,3})\s*(?:days?|din)/i);
      const weeksMatch = durationText.match(/(\d{1,2})\s*(?:weeks?|hafte)/i);
      const monthsMatch = durationText.match(/(\d{1,2})\s*(?:months?|mahine)/i);

      if (monthsMatch || (weeksMatch && parseInt(weeksMatch[1], 10) >= 2) || (daysMatch && parseInt(daysMatch[1], 10) >= 14)) {
        durationWeight = 3; // chronic (>14 days)
      } else if (weeksMatch || (daysMatch && parseInt(daysMatch[1], 10) >= 3)) {
        durationWeight = 2; // extended (3-14 days)
      } else {
        durationWeight = 1; // recent
      }
    } else {
      evidence.push('Duration: Not mentioned in grievance text (Preserved as unknown)');
    }

    // Explicit critical keywords check
    const isImminentHazard =
      lower.includes('emergency') ||
      lower.includes('janleva') ||
      lower.includes('life threatening') ||
      lower.includes('sparking') ||
      lower.includes('deep pothole causing accident') ||
      lower.includes('main pipeline burst') ||
      lower.includes('flooding roadway');

    // Rule-based deterministic urgency grading
    let urgency: UrgencyTier = 'MEDIUM';
    let numericScore = 0.50;
    let reason = '';

    if (hasPublicSafety && (hasServiceOutage || isImminentHazard || durationWeight >= 2)) {
      urgency = 'CRITICAL';
      numericScore = 0.95;
      reason = 'Immediate public safety risk combined with essential service outage or chronic duration requires expedited field dispatch.';
    } else if (hasPublicSafety) {
      urgency = 'HIGH';
      numericScore = 0.82;
      reason = 'Direct public safety hazard detected requiring priority municipal attention.';
    } else if (hasServiceOutage && durationWeight >= 2) {
      urgency = 'HIGH';
      numericScore = 0.80;
      reason = 'Prolonged municipal service outage (>3 days) impacting resident welfare.';
    } else if (hasServiceOutage) {
      urgency = 'MEDIUM';
      numericScore = 0.65;
      reason = 'Municipal service disruption reported within standard operational turnaround window.';
    } else if (durationWeight >= 3) {
      urgency = 'MEDIUM';
      numericScore = 0.60;
      reason = 'Chronic grievance duration (>14 days) warrants elevation to standard active queue.';
    } else {
      urgency = 'LOW';
      numericScore = 0.40;
      reason = 'Routine civic maintenance grievance with no immediate safety hazard or service disruption noted.';
    }

    const confidence = evidence.length > 0 ? 0.92 : 0.70;

    return {
      urgency,
      score: numericScore,
      public_safety: hasPublicSafety,
      service_outage: hasServiceOutage,
      duration: durationText,
      evidence,
      reason,
      confidence,
      requires_human_review: urgency === 'CRITICAL' || confidence < 0.75,
    };
  }
}
