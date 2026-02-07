import { callGemini, imageToBase64, RateLimitError } from './gemini';

// Debug log helper
const _dl = (loc: string, msg: string, data: any, hId: string) => {
  const payload = { location: loc, message: msg, data, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: hId };
  console.warn(`[DBG ${loc}]`, msg, JSON.stringify(data).substring(0, 200));
  fetch('http://127.0.0.1:7242/ingest/6fa89eb7-6af9-40f9-ac61-663548d25a89', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DetectionResult = {
  id: string;
  label: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  distance?: number;
  position?: 'left' | 'right' | 'center';
};

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const DETECTION_PROMPT = `You are an assistant for visually impaired users. Analyze this image and list the most important objects you see.

For each object, provide:
- label: what the object is (e.g. "person", "car", "door", "chair", "stairs")
- position: "left", "center", or "right" based on where it appears in the image
- distance: estimated distance in feet (1-30 range, best guess)

Prioritize:
1. Obstacles or hazards (stairs, curbs, poles, cars)
2. People
3. Doors, signs, furniture
4. Other notable objects

Return ONLY a valid JSON array (no markdown, no explanation) with AT MOST 3 objects. Ensure the JSON is complete and closed. Example:
[{"label":"person","position":"center","distance":8},{"label":"chair","position":"left","distance":4}]

If you see nothing notable, return: []`;

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/**
 * Detect objects in a camera photo using Gemini vision.
 * Accepts a photo object from takePictureAsync (with .uri) or a URI string.
 */
export const detectObjects = async (
  image: { uri: string } | string | null | undefined
): Promise<DetectionResult[]> => {
  try {
    // #region agent log
    _dl('detect:entry', 'detectObjects called', { imageType: typeof image, hasUri: typeof image === 'object' && image !== null ? !!(image as any).uri : 'N/A', hasBase64: typeof image === 'object' && image !== null ? !!(image as any).base64 : 'N/A' }, 'H1');
    // #endregion agent log

    const base64 = await imageToBase64(image);
    // #region agent log
    _dl('detect:b64', 'after imageToBase64', { hasBase64: !!base64, len: base64?.length ?? 0 }, 'H1');
    // #endregion agent log
    if (!base64) return [];

    const response = await callGemini(DETECTION_PROMPT, base64);
    // #region agent log
    _dl('detect:gemini', 'after callGemini', { hasResp: !!response, textSnip: response?.text?.substring(0, 120) ?? 'NULL' }, 'H4');
    // #endregion agent log
    if (!response?.text) return [];

    // Extract JSON from response (handle potential markdown wrapping)
    const parseJsonArray = (text: string): any[] => {
      // First, attempt direct parse
      try {
        return JSON.parse(text);
      } catch {
        // Continue to recovery attempts
      }

      // If wrapped in extra text, grab the array portion
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          // continue
        }
      }

      // Attempt to salvage complete object literals
      const objMatches = text.match(/\{[^{}]*\}/g);
      if (objMatches && objMatches.length > 0) {
        try {
          return JSON.parse(`[${objMatches.join(',')}]`);
        } catch {
          // continue
        }
      }

      return [];
    };

    const raw: any[] = parseJsonArray(response.text);

    // #region agent log
    _dl('detect:parsed', 'JSON parsed', { count: raw.length, first: raw[0] }, 'H4');
    // #endregion agent log

    return raw.map((item, idx) => ({
      id: `det_${Date.now()}_${idx}`,
      label: String(item.label ?? 'object'),
      confidence: 0.9,
      bbox: { x: 0.5, y: 0.5, width: 0.2, height: 0.2 },
      distance: typeof item.distance === 'number' ? item.distance : undefined,
      position: ['left', 'right', 'center'].includes(item.position)
        ? (item.position as 'left' | 'right' | 'center')
        : 'center',
    }));
  } catch (err: any) {
    // Re-throw rate limit so the scan loop can back off
    if (err instanceof RateLimitError) throw err;
    // #region agent log
    _dl('detect:error', 'detectObjects threw', { error: err?.message ?? String(err) }, 'H4');
    // #endregion agent log
    return [];
  }
};

/**
 * Estimate distance for a detection result.
 */
export const estimateDistance = (detection: DetectionResult): number | null => {
  if (detection.distance != null) {
    return detection.distance;
  }

  const h = detection.bbox.height;
  if (h <= 0) return null;

  const approxFeet = 6 / h;
  return Math.min(Math.max(approxFeet, 1), 30);
};
