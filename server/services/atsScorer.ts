import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { generateContentWithRetry } from "../utils/geminiHelper";

dotenv.config();

const promptTemplatePath = path.join(
  __dirname,
  "../prompts/atsScore.prompt.txt"
);
const rawPrompt = fs.readFileSync(promptTemplatePath, "utf-8");

export async function scoreResumeATS(cleanedText: string): Promise<{
  score: number;
  explanation: string;
}> {
  const prompt = rawPrompt.replace("{{RESUME_CONTENT}}", cleanedText);

  try {
    const responseText = await generateContentWithRetry(prompt);

    const scoreMatch = responseText.match(/(\d{1,3})/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    return {
      score: Math.min(Math.max(score, 0), 100),
      explanation: responseText.trim(),
    };
  } catch (error) {
    console.error("Failed to score resume ATS:", error);
    throw error;
  }
}
