import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const promptPath = path.join(__dirname, "../prompts/parseResume.prompt.txt");
const parsedResumePrompt = fs.readFileSync(promptPath, "utf-8");

export async function parseResumeWithGemini(cleanedText: string): Promise<any> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(
    `${parsedResumePrompt}\n\n"""${cleanedText}"""`
  );

  const responseText = await result.response.text();

  const cleanedResponse = responseText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleanedResponse);
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON", e);
    throw new Error("Invalid Gemini response");
  }
}
