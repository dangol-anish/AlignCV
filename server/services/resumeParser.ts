import fs from "fs";
import path from "path";
import { generateContentWithRetry } from "../utils/geminiHelper"; // ✅ new import

const promptPath = path.join(__dirname, "../prompts/parseResume.prompt.txt");
const parsedResumePrompt = fs.readFileSync(promptPath, "utf-8");

export async function parseResumeWithGemini(cleanedText: string): Promise<any> {
  const fullPrompt = `${parsedResumePrompt}\n\n"""${cleanedText}"""`;

  try {
    const responseText = await generateContentWithRetry(fullPrompt);

    const cleanedResponse = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON", error);
    throw new Error("Invalid Gemini response");
  }
}
