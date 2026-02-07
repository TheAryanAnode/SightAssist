import { callGemini, imageToBase64, RateLimitError } from './gemini';

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const OCR_PROMPT = `You are an OCR assistant for a visually impaired user. Read ALL visible text in this image.

Rules:
- Transcribe the text exactly as written (preserve spelling, capitalization).
- If there are multiple blocks of text (signs, labels, screens), separate them with a period and space.
- If text is partially obscured, include what you can read and note it's partial.
- If there is NO readable text in the image, respond with exactly: NO_TEXT
- Do NOT describe the image. Do NOT add any explanation. ONLY return the text you read.`;

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/**
 * Scan text from a camera photo using Gemini vision OCR.
 * Returns the detected text, or an empty string if none found.
 */
export const scanTextFromImage = async (
  image: { uri: string } | string | null | undefined
): Promise<string> => {
  try {
    const base64 = await imageToBase64(image);
    if (!base64) return '';

    const response = await callGemini(OCR_PROMPT, base64);
    if (!response?.text) return '';

    const text = response.text.trim();

    // Gemini returns "NO_TEXT" when there's nothing to read
    if (text === 'NO_TEXT' || text.toLowerCase() === 'no text') {
      return '';
    }

    return text;
  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    console.warn('scanTextFromImage error:', err);
    return '';
  }
};
