import { callGemini, imageToBase64 } from './gemini';

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const SCENE_PROMPT = `You are a visual assistant for a blind or visually impaired person. Describe what you see in this image in 2-4 concise sentences.

Guidelines:
- Start with the general setting (indoors/outdoors, type of place).
- Mention the most important objects, people, or obstacles and their approximate positions (left, right, ahead, nearby).
- Include any safety-relevant information: stairs, curbs, moving vehicles, uneven ground, open doors.
- Mention any visible text like signs, labels, or screens if relevant.
- Use simple, clear language. Speak as if guiding someone in real time.
- Do NOT say "the image shows" or "I can see". Speak directly: "You are in a hallway. There is a door ahead on your right."`;

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/**
 * Generate a natural language scene description from a camera photo.
 * Designed for voice output to visually impaired users.
 */
export const describeScene = async (
  image: { uri: string } | string | null | undefined
): Promise<string> => {
  try {
    const base64 = await imageToBase64(image);
    if (!base64) return 'Unable to capture the scene.';

    const response = await callGemini(SCENE_PROMPT, base64);
    if (!response?.text) return 'Could not describe the scene right now.';

    return response.text.trim();
  } catch (err) {
    console.warn('describeScene error:', err);
    return 'Something went wrong while describing the scene.';
  }
};
