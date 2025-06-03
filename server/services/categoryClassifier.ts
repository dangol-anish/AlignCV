import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { limitedGenerateContent } from "../utils/geminiLimiter";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const promptPath = path.resolve(
  __dirname,
  "../prompts/analyzeResume.prompt.txt"
);
const rawPrompt = fs.readFileSync(promptPath, "utf-8");

function sanitizeJsonString(str: string): string {
  // Remove control characters except for newlines and tabs
  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, (c) => {
    if (c === "\n" || c === "\t") return c;
    return "";
  });
}

export async function analyzeResume(
  resumeText: string
): Promise<{
  categoryInsights: Record<string, string[]>;
  lineImprovements: { original: string; issue: string; suggestion: string }[];
}> {
  const prompt = rawPrompt.replace("{{RESUME_TEXT}}", resumeText);

  try {
    const responseText = await limitedGenerateContent(prompt);
    const cleaned = sanitizeJsonString(
      responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
    );
    const parsed = JSON.parse(cleaned);
    return {
      categoryInsights: parsed.categoryInsights,
      lineImprovements: parsed.lineImprovements,
    };
  } catch (error) {
    console.error("Failed to parse analyzeResume response:", error);
    throw new Error("Invalid analyzeResume response");
  }
}
