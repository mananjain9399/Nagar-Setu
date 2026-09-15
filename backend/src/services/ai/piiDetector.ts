export interface PIIFlagResult {
  hasPII: boolean;
  maskedText: string;
  flaggedEntities: Array<{
    type: 'PHONE' | 'EMAIL' | 'AADHAAR' | 'HOUSE_NUMBER';
    original: string;
    masked: string;
  }>;
}

export class PIIDetector {
  public static inspectAndMask(text: string): PIIFlagResult {
    if (!text) {
      return { hasPII: false, maskedText: '', flaggedEntities: [] };
    }

    const flaggedEntities: PIIFlagResult['flaggedEntities'] = [];
    let maskedText = text;

    // 1. Phone numbers (10 digits with optional +91 or prefix)
    const phoneRegex = /(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}/g;
    maskedText = maskedText.replace(phoneRegex, (match) => {
      flaggedEntities.push({
        type: 'PHONE',
        original: match,
        masked: 'XXXXX-XXXXX',
      });
      return '[PHONE_REDACTED]';
    });

    // 2. Email addresses
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    maskedText = maskedText.replace(emailRegex, (match) => {
      flaggedEntities.push({
        type: 'EMAIL',
        original: match,
        masked: 'x***@***.com',
      });
      return '[EMAIL_REDACTED]';
    });

    // 3. Aadhaar pattern (12 digits with spaces or hyphens)
    const aadhaarRegex = /\b[2-9]\d{3}[\-\s]?\d{4}[\-\s]?\d{4}\b/g;
    maskedText = maskedText.replace(aadhaarRegex, (match) => {
      flaggedEntities.push({
        type: 'AADHAAR',
        original: match,
        masked: 'XXXX-XXXX-XXXX',
      });
      return '[ID_REDACTED]';
    });

    // 4. Specific house/plot/flat numbers
    const houseRegex = /\b(?:house|flat|plot|h\.?\s*no\.?|qtr\.?\s*no\.?)\s*#?\s*([0-9]+[a-zA-Z0-9\/-]*)/gi;
    maskedText = maskedText.replace(houseRegex, (match, p1) => {
      flaggedEntities.push({
        type: 'HOUSE_NUMBER',
        original: match,
        masked: 'Plot/H.No [MASKED]',
      });
      return 'Plot/H.No [REDACTED]';
    });

    return {
      hasPII: flaggedEntities.length > 0,
      maskedText,
      flaggedEntities,
    };
  }
}
