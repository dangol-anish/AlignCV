import { Response } from "express";
import { MulterRequest } from "../interfaces/upload";
import { extractTextFromBuffer } from "../../services/textExtractor";
import { cleanExtractedText } from "../../services/textCleaner";
import { parseResumeWithGemini } from "../../services/resumeParser";
import { isSupportedMimeType } from "../../utils/isSupportedMimeType";
import { DynamicResumeSections } from "../interfaces/resume";
import { scoreResumeATS } from "../../services/atsScorer";
import { analyzeResume } from "../../services/categoryClassifier";
import { isLikelyResume } from "../../utils/isLikelyResume";

export async function handleFileUpload(req: MulterRequest, res: Response) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded.",
      code: "NO_FILE",
    });
  }

  const { originalname, mimetype, size, buffer } = req.file;

  if (!isSupportedMimeType(mimetype)) {
    return res.status(400).json({
      success: false,
      message: `Unsupported file type: ${mimetype}`,
      code: "UNSUPPORTED_TYPE",
    });
  }

  try {
    const rawText = await extractTextFromBuffer(buffer, mimetype);
    const cleanedText = cleanExtractedText(rawText);

    if (!isLikelyResume(cleanedText)) {
      return res.status(400).json({
        success: false,
        message:
          "The uploaded file doesn't seem to be a valid resume. Try a better-formatted file.",
        code: "INVALID_RESUME",
      });
    }

    let structuredData: DynamicResumeSections | null = null;
    try {
      structuredData = (await parseResumeWithGemini(
        cleanedText
      )) as DynamicResumeSections;
    } catch (geminiError: any) {
      console.error("Gemini parsing failed:", geminiError);
      let userMessage = "Resume parsing failed. Please try again later.";
      let code = "GEMINI_PARSE_ERROR";
      if (geminiError.status === 503) {
        userMessage =
          "Our AI is currently overloaded. Please try again in a few minutes.";
        code = "GEMINI_OVERLOADED";
      } else if (
        geminiError.message &&
        geminiError.message.includes("Invalid Gemini response")
      ) {
        userMessage =
          "The AI could not understand your resume. Try a different file or format.";
        code = "GEMINI_INVALID_RESPONSE";
      }
      return res
        .status(500)
        .json({ success: false, message: userMessage, code });
    }

    let atsScoreResult = null;
    try {
      atsScoreResult = await scoreResumeATS(cleanedText);
    } catch (e) {
      console.error("ATS scoring failed:", e);
    }

    let categoryInsights = null;
    let lineImprovements: any[] = [];
    try {
      const analysis = await analyzeResume(cleanedText);
      categoryInsights = analysis.categoryInsights;
      lineImprovements = analysis.lineImprovements;
    } catch (e: any) {
      console.error("Resume analysis failed:", e);
      let userMessage = "Resume analysis failed. Please try again later.";
      let code = "GEMINI_ANALYSIS_ERROR";
      if (e.status === 503) {
        userMessage =
          "Our AI is currently overloaded. Please try again in a few minutes.";
        code = "GEMINI_OVERLOADED";
      } else if (
        e.message &&
        e.message.includes("Invalid analyzeResume response")
      ) {
        userMessage =
          "The AI could not analyze your resume. Try a different file or format.";
        code = "GEMINI_INVALID_RESPONSE";
      }
      return res
        .status(500)
        .json({ success: false, message: userMessage, code });
    }

    return res.json({
      success: true,
      file: { name: originalname, type: mimetype, size, text: cleanedText },
      parsed: structuredData,
      atsScore: atsScoreResult,
      categoryInsights,
      lineImprovements,
    });
  } catch (error: any) {
    console.error("Unexpected error in handleFileUpload:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Internal server error. Please try again later.",
        code: "INTERNAL_ERROR",
      });
    }
  }
}
