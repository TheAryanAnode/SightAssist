import * as FileSystem from 'expo-file-system';
import { GEMINI_API_KEY } from '@utils/config';

// ---------------------------------------------------------------------------
// Gemini 2.0 Flash — shared vision API client
// ---------------------------------------------------------------------------

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = 25000;

// Debug log helper — fires to debug server + console
const _dl = (loc: string, msg: string, data: any, hId: string) => {
  const payload = { location: loc, message: msg, data, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: hId };
  console.warn(`[DBG ${loc}]`, msg, JSON.stringify(data).substring(0, 200));
  fetch('http://127.0.0.1:7242/ingest/6fa89eb7-6af9-40f9-ac61-663548d25a89', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
};

export type GeminiResponse = {
  text: string;
};

// Thrown on 429 so callers can back off
export class RateLimitError extends Error {
  constructor() { super('Rate limited'); this.name = 'RateLimitError'; }
}

/**
 * Read a local image file (from camera) as a base64-encoded string.
 * Accepts either a URI string or an object with a `uri` property,
 * OR an object with a `base64` property (from takePictureAsync with base64:true).
 */
export const imageToBase64 = async (
  image: string | { uri: string; base64?: string } | null | undefined
): Promise<string | null> => {
  if (!image) {
    // #region agent log
    _dl('gemini:b64', 'image is null/undefined', { image }, 'H1');
    // #endregion agent log
    return null;
  }

  // If the image already has base64 data (from takePictureAsync with base64:true), use it
  if (typeof image === 'object' && image.base64) {
    // #region agent log
    _dl('gemini:b64', 'using pre-encoded base64', { len: image.base64.length }, 'H1');
    // #endregion agent log
    return image.base64;
  }

  const uri = typeof image === 'string' ? image : image.uri;
  if (!uri) {
    // #region agent log
    _dl('gemini:b64', 'uri is empty', { imageType: typeof image, keys: typeof image === 'object' ? Object.keys(image) : 'N/A' }, 'H1');
    // #endregion agent log
    return null;
  }

  // #region agent log
  _dl('gemini:b64:readFile', 'attempting readAsStringAsync', { uri: uri.substring(0, 80), hasFn: typeof FileSystem.readAsStringAsync }, 'H1');
  // #endregion agent log

  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64' as any,
    });
    // #region agent log
    _dl('gemini:b64:result', 'readAsStringAsync returned', { len: base64?.length ?? 0, type: typeof base64, isEmpty: !base64 }, 'H1');
    // #endregion agent log
    return base64 || null;
  } catch (err: any) {
    // #region agent log
    _dl('gemini:b64:error', 'readAsStringAsync threw', { error: err?.message ?? String(err) }, 'H1');
    // #endregion agent log
    return null;
  }
};

/**
 * Call Gemini 2.0 Flash with a text prompt and an optional base64 image.
 * Returns the model's text response, or null on failure.
 */
export const callGemini = async (
  prompt: string,
  base64Image?: string | null
): Promise<GeminiResponse | null> => {
  // #region agent log
  _dl('gemini:call', 'entry', { hasKey: !!GEMINI_API_KEY, keyLen: GEMINI_API_KEY?.length ?? 0, hasImage: !!base64Image, imageLen: base64Image?.length ?? 0, promptSnip: prompt.substring(0, 50) }, 'H3');
  // #endregion agent log

  if (!GEMINI_API_KEY) {
    _dl('gemini:call', 'NO API KEY', {}, 'H3');
    return null;
  }

  const url = `${BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  // Build the parts array
  const parts: any[] = [{ text: prompt }];

  if (base64Image) {
    parts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: base64Image,
      },
    });
  }

  const body = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 512,
    },
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    // #region agent log
    _dl('gemini:resp', 'HTTP response', { status: res.status, ok: res.ok }, 'H3');
    // #endregion agent log

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      // #region agent log
      _dl('gemini:err', 'API error', { status: res.status, body: JSON.stringify(errData).substring(0, 250) }, 'H3');
      // #endregion agent log
      if (res.status === 429) {
        throw new RateLimitError();
      }
      return null;
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

    // #region agent log
    _dl('gemini:result', 'parsed result', { hasText: !!text, textLen: text?.length ?? 0, textSnip: text?.substring(0, 120) ?? 'NULL' }, 'H3');
    // #endregion agent log

    if (!text) {
      _dl('gemini:empty', 'empty response', { fullResp: JSON.stringify(data).substring(0, 400) }, 'H3');
      return null;
    }

    return { text: text.trim() };
  } catch (err: any) {
    // #region agent log
    _dl('gemini:catch', 'fetch exception', { name: err?.name, msg: err?.message ?? String(err) }, 'H3');
    // #endregion agent log
    return null;
  }
};
