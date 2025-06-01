import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const promptPath = path.resolve(
  __dirname,
  "../prompts/categoryClassifier.prompt.txt"
);
const rawPrompt = fs.readFileSync(promptPath, "utf-8");

export async function classifyResumeCategories(
  resumeText: string
): Promise<Record<string, string>> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = rawPrompt.replace("{{RESUME_TEXT}}", resumeText);

  const result = await model.generateContent(prompt);
  const responseText = await result.response.text();

  const cleaned = responseText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse category classifier response:", error);
    throw new Error("Invalid category classifier response");
  }
}
