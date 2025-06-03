import fs from "fs";
import path from "path";
import { generateContentWithRetry } from "../utils/geminiHelper";
import { limitedGenerateContent } from "../utils/geminiLimiter";
import { getFromCache, setCache } from "../utils/cache";

const promptPath = path.join(__dirname, "../prompts/parseResume.prompt.txt");
const parsedResumePrompt = fs.readFileSync(promptPath, "utf-8");

function sanitizeJsonString(str: string): string {
  // Remove control characters except for newlines and tabs
  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, (c) => {
    if (c === "\n" || c === "\t") return c;
    return "";
  });
}

export async function parseResumeWithGemini(cleanedText: string): Promise<any> {
  const cacheKey = `parseResume:${cleanedText.slice(0, 100)}`;

  const cached = getFromCache(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const fullPrompt = `${parsedResumePrompt}\n\n"""${cleanedText}"""`;

  try {
    const responseText = await limitedGenerateContent(fullPrompt);

    const cleanedResponse = sanitizeJsonString(
      responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
    );

    setCache(cacheKey, cleanedResponse);

    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON", error);
    throw new Error("Invalid Gemini response");
  }
}
