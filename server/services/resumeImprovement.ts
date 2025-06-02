import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { ResumeImprovement } from "../api/interfaces/resumeImprovement";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const promptPath = path.resolve(
  __dirname,
  "../prompts/resumeImprovement.prompt.txt"
);
const rawPrompt = fs.readFileSync(promptPath, "utf-8");

export async function getResumeLineImprovements(
  resumeText: string
): Promise<ResumeImprovement[]> {
  const prompt = rawPrompt.replace("{{RESUME_TEXT}}", resumeText);

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(prompt);
  const responseText = await result.response.text();

  const cleaned = responseText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as ResumeImprovement[];
  } catch (error) {
    console.error("Failed to parse resume improvement response:", error);
    throw new Error("Invalid resume improvement response");
  }
}
