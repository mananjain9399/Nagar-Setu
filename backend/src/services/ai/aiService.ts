import dotenv from 'dotenv';
dotenv.config();

export interface AIProviderConfig {
  provider: string; // "gemini", "openai", "deterministic_fallback"
  model: string;
  hasApiKey: boolean;
  mode: 'LIVE_AI' | 'DETERMINISTIC_FALLBACK';
}

export class AIService {
  private static provider: string = process.env.AI_PROVIDER || 'deterministic_fallback';
  private static apiKey: string = process.env.AI_API_KEY || '';
  private static model: string = process.env.AI_MODEL || 'gemini-1.5-flash';

  public static getConfiguration(): AIProviderConfig {
    const isLive = Boolean(this.apiKey && this.apiKey.trim().length > 8 && this.provider !== 'deterministic_fallback');
    return {
      provider: this.provider,
      model: this.model,
      hasApiKey: Boolean(this.apiKey),
      mode: isLive ? 'LIVE_AI' : 'DETERMINISTIC_FALLBACK',
    };
  }

  /**
   * Executes LLM prompt if live API configured, otherwise falls back gracefully
   * without fabricating fake results.
   */
  public static async queryModel(prompt: string): Promise<{ success: boolean; text?: string; error?: string }> {
    const config = this.getConfiguration();

    if (config.mode === 'DETERMINISTIC_FALLBACK') {
      return {
        success: false,
        error: 'AI Provider offline or API key not supplied. Executing verified deterministic pipeline.',
      };
    }

    try {
      if (config.provider.toLowerCase().includes('gemini')) {
        // Direct call to Gemini API endpoint
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${this.apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 1000 },
          }),
        });

        if (!response.ok) {
          throw new Error(`Gemini API returned status ${response.status}`);
        }

        const data: any = await response.json();
        const generated = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return { success: true, text: generated };
      }

      return {
        success: false,
        error: `Provider '${config.provider}' is not natively mapped. Using deterministic fallback.`,
      };
    } catch (err: any) {
      console.warn('[AIService] Live AI query failed, falling back to deterministic engine:', err.message);
      return {
        success: false,
        error: `Live AI query failed: ${err.message}`,
      };
    }
  }
}
