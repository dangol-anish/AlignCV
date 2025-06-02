import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const getModel = () =>
  genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateContentWithRetry(
  prompt: string,
  maxRetries = 3
): Promise<string> {
  const model = getModel();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return await result.response.text();
    } catch (error: any) {
      if (attempt === maxRetries || error.status !== 503) {
        console.error(`Gemini call failed after ${attempt} attempt(s):`, error);
        throw error;
      }

      console.warn(`Gemini model overloaded. Retrying attempt ${attempt}...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // backoff
    }
  }

  throw new Error("Max retries reached for Gemini model");
}
