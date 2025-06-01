import { Response } from "express";
import { MulterRequest } from "../interfaces/upload";
import { extractTextFromBuffer } from "../../services/textExtractor";
import { cleanExtractedText } from "../../services/textCleaner";
import { parseResumeWithGemini } from "../../services/resumeParser";
import { isSupportedMimeType } from "../../utils/isSupportedMimeType";
import { DynamicResumeSections } from "../interfaces/resume";
import { scoreResumeATS } from "../../services/atsScorer";
import { classifyResumeCategories } from "../../services/categoryClassifier";
import { CategoryClassifierResult } from "../interfaces/analysis";

export async function handleFileUpload(req: MulterRequest, res: Response) {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const { originalname, mimetype, size, buffer } = req.file;

  if (!isSupportedMimeType(mimetype)) {
    return res.status(400).json({
      success: false,
      message: `Unsupported file type: ${mimetype}`,
    });
  }

  try {
    const rawText = await extractTextFromBuffer(buffer, mimetype);
    const cleanedText = cleanExtractedText(rawText);
    const structuredData = (await parseResumeWithGemini(
      cleanedText
    )) as DynamicResumeSections;
    const atsScoreResult = await scoreResumeATS(cleanedText);
    const categoryInsights = await classifyResumeCategories(cleanedText);

    res.json({
      success: true,
      file: {
        name: originalname,
        type: mimetype,
        size,
        text: cleanedText,
      },
      parsed: structuredData,
      atsScore: atsScoreResult,
      categoryInsights: categoryInsights,
    });

    console.log(atsScoreResult);
    console.log(categoryInsights);
  } catch (error: any) {
    console.error("Text extraction failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to extract text from file",
      error: error.message,
    });
  }
}
