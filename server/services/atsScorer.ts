import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function scoreResumeATS(cleanedText: string): Promise<{
  score: number;
  explanation: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const promptTemplatePath = path.join(
    __dirname,
    "../prompts/atsScore.prompt.txt"
  );
  const rawPrompt = fs.readFileSync(promptTemplatePath, "utf-8");

  const prompt = rawPrompt.replace("{{RESUME_CONTENT}}", cleanedText);

  const result = await model.generateContent(prompt);
  const responseText = await result.response.text();

  const scoreMatch = responseText.match(/(\d{1,3})/);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

  return {
    score: Math.min(Math.max(score, 0), 100),
    explanation: responseText.trim(),
  };
}
