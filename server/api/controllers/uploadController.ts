import { Response } from "express";
import { MulterRequest } from "../interfaces/upload";
import { extractTextFromBuffer } from "../../services/textExtractor";
import { cleanExtractedText } from "../../services/textCleaner";
import { parseResumeWithGemini } from "../../services/resumeParser";
import { isSupportedMimeType } from "../../utils/isSupportedMimeType";
import { DynamicResumeSections } from "../interfaces/resume";
import { scoreResumeATS } from "../../services/atsScorer";
import { classifyResumeCategories } from "../../services/categoryClassifier";
import { getResumeLineImprovements } from "../../services/resumeImprovement";
import { ResumeImprovement } from "../interfaces/resumeImprovement";
import { isLikelyResume } from "../../utils/isLikelyResume";

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

    console.log("Text for isLikelyResume check:", cleanedText.slice(0, 1000));

    if (!isLikelyResume(cleanedText)) {
      return res.status(400).json({
        success: false,
        message:
          "The uploaded file doesn't seem to be a valid resume. Try a better-formatted file.",
      });
    }

    const structuredData = (await parseResumeWithGemini(
      cleanedText
    )) as DynamicResumeSections;
    const atsScoreResult = await scoreResumeATS(cleanedText);
    const categoryInsights = await classifyResumeCategories(cleanedText);

    const lineImprovements: ResumeImprovement[] =
      await getResumeLineImprovements(cleanedText);

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
      lineImprovements,
    });

    console.log("ATS Score:", atsScoreResult);
    console.log("Category Insights:", categoryInsights);
    console.log("Line Improvements:", lineImprovements);
  } catch (error: any) {
    console.error("Text extraction failed:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Unexpected error occurred",
      details: error.stack,
    });
  }
}
