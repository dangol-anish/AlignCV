import pLimit from "p-limit";
import { generateContentWithRetry } from "./geminiHelper";

// Limit max concurrent Gemini calls to 2 (adjust as needed)
const limit = pLimit(2);

export async function limitedGenerateContent(prompt: string): Promise<string> {
  return limit(() => generateContentWithRetry(prompt));
}
