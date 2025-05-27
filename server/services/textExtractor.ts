import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import textract from "textract";
import Tesseract from "tesseract.js";
import { SupportedMimeType } from "../api/interfaces/textExtractor";

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: SupportedMimeType
): Promise<string> {
  switch (mimeType) {
    case "application/pdf":
      const pdf = await pdfParse(buffer);
      return pdf.text;

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      const docx = await mammoth.extractRawText({ buffer });
      return docx.value;

    case "application/msword":
    case "text/plain":
    case "application/rtf":
      return new Promise((resolve, reject) => {
        textract.fromBufferWithMime(mimeType, buffer, (error, text) => {
          if (error) return reject(error);
          resolve(text || "");
        });
      });

    case "image/jpeg":
    case "image/png":
      const result = await Tesseract.recognize(buffer, "eng");
      return result.data.text;

    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
