import { Request, Response, NextFunction } from "express";
import { isSupportedMimeType } from "../../utils/isSupportedMimeType";
import { isLikelyResume } from "../../utils/isLikelyResume";
import { MulterRequest } from "../interfaces/upload";

export function validateFilePresence(
  req: MulterRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded.",
      code: "NO_FILE",
    });
  }
  next();
}

export function validateMimeType(
  req: MulterRequest,
  res: Response,
  next: NextFunction
) {
  const mimetype = req.file?.mimetype;
  if (!mimetype || !isSupportedMimeType(mimetype)) {
    return res.status(400).json({
      success: false,
      message: `Unsupported file type: ${mimetype}`,
      code: "UNSUPPORTED_TYPE",
    });
  }
  next();
}

export async function validateResumeLikelihood(
  req: MulterRequest,
  res: Response,
  next: NextFunction
) {
  const buffer = req.file?.buffer;
  const mimetype = req.file?.mimetype;
  if (!buffer || !mimetype) {
    return res.status(400).json({
      success: false,
      message: "File data missing.",
      code: "FILE_DATA_MISSING",
    });
  }
  // Import text extraction and cleaning here to avoid circular deps
  const { extractTextFromBuffer } = await import(
    "../../services/textExtractor"
  );
  const { cleanExtractedText } = await import("../../services/textCleaner");
  const rawText = await extractTextFromBuffer(
    buffer,
    mimetype as import("../interfaces/textExtractor").SupportedMimeType
  );
  const cleanedText = cleanExtractedText(rawText);
  if (!isLikelyResume(cleanedText)) {
    return res.status(400).json({
      success: false,
      message:
        "The uploaded file doesn't seem to be a valid resume. Try a better-formatted file.",
      code: "INVALID_RESUME",
    });
  }
  // Attach cleanedText to req for downstream use
  req.cleanedText = cleanedText;
  next();
}
