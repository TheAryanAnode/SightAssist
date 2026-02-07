import { callGemini, imageToBase64, RateLimitError } from './gemini';

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const SAFETY_PROMPT = `You are a safety assistant for a blind or visually impaired person walking forward. Analyze this image for dangers and obstacles.

Your job:
1. Determine if it is SAFE or UNSAFE to continue walking forward.
2. If UNSAFE, list each danger briefly (e.g. "car approaching from left", "stairs ahead", "low-hanging branch").
3. If SAFE, confirm there are no immediate dangers.

Rules:
- Be concise. Max 2-3 sentences.
- Prioritize: vehicles, stairs, drops, holes, poles, people on collision path, cyclists, doors, curbs, uneven ground.
- Do NOT describe the scene generally. ONLY focus on safety.
- Speak directly as if guiding someone: "Danger: car approaching from the left. Stop."
- If safe: "Path is clear. You may continue forward with caution."

Return ONLY your safety assessment. No markdown, no JSON.`;

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/**
 * Assess whether it is safe to continue walking forward.
 * Returns a spoken safety message.
 */
export const assessSafety = async (
  image: { uri: string; base64?: string } | string | null | undefined
): Promise<string> => {
  try {
    const base64 = await imageToBase64(image);
    if (!base64) return 'Unable to capture the scene for safety check.';

    const response = await callGemini(SAFETY_PROMPT, base64);
    if (!response?.text) return 'Could not assess safety right now.';

    return response.text.trim();
  } catch (err: any) {
    if (err instanceof RateLimitError) throw err;
    console.warn('assessSafety error:', err);
    return 'Safety check failed.';
  }
};
