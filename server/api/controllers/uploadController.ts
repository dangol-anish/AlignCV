import { Response } from "express";
import { MulterRequest } from "../interfaces/upload";
import { extractTextFromBuffer } from "../../services/textExtractor";
import { ExtractedFileInfo } from "../interfaces/textExtractor";

export async function handleFileUpload(req: MulterRequest, res: Response) {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const { originalname, mimetype, size, buffer } = req.file;

  console.log("Received file:", { originalname, mimetype, size });

  try {
    const text = await extractTextFromBuffer(
      buffer,
      mimetype as ExtractedFileInfo["type"]
    );

    const fileInfo: ExtractedFileInfo = {
      name: originalname,
      type: mimetype as ExtractedFileInfo["type"],
      size,
      text: text.trim(),
    };

    res.json({
      success: true,
      file: fileInfo,
    });
  } catch (error: any) {
    console.error("Text extraction failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to extract text from file",
      error: error.message,
    });
  }
}
