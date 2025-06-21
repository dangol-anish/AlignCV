import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Use a free, widely available model for testing
export const getModel = () =>
  genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

export async function generateContentWithRetry(
  prompt: string,
  maxRetries = 5
): Promise<string> {
  const model = getModel();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = await result.response.text();

      return text;
    } catch (error: any) {
      // Enhanced error logging
      console.error(`Attempt ${attempt} failed with error:`, {
        status: error.status,
        message: error.message,
        details: error.details || "No additional details",
        code: error.code || "No error code",
        quotaExceeded:
          error.message?.includes("quota") || error.message?.includes("limit"),
        timestamp: new Date().toISOString(),
      });

      // Check for quota exceeded
      if (
        error.message?.includes("quota") ||
        error.message?.includes("limit")
      ) {
        console.error(
          "QUOTA EXCEEDED: Please check your Gemini API usage limits"
        );
        throw new Error("API quota exceeded. Please check your usage limits.");
      }

      if (attempt === maxRetries || error.status !== 503) {
        console.error(`Gemini call failed after ${attempt} attempt(s):`, error);
        throw error;
      }

      console.warn(`Gemini model overloaded. Retrying attempt ${attempt}...`);
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }

  throw new Error("Max retries reached for Gemini model");
}
