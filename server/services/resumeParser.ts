import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function parseResumeWithGemini(cleanedText: string): Promise<any> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You're a resume parser. Extract the following structured data in JSON:

{
  "name": string,
  "email": string,
  "phone": string,
  "skills": string[],
  "education": [
    {
      "degree": string,
      "institution": string,
      "startDate": string,
      "endDate": string
    }
  ],
  "experience": [
    {
      "jobTitle": string,
      "company": string,
      "startDate": string,
      "endDate": string,
      "responsibilities": string[]
    }
  ]
}

Only return the JSON. Resume content:
"""${cleanedText}"""
`;

  const result = await model.generateContent(prompt);
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
