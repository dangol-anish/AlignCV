import { Router } from "express";
import {
  handleFileUpload,
  saveResumeEdit,
  generateResume,
  generateResumePdf,
  generateResumeDocx,
  extractTemplateData,
} from "../controllers/uploadController";
import multer from "multer";
import {
  validateFilePresence,
  validateMimeType,
  validateResumeLikelihood,
} from "../middlewares/uploadValidators";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// POST /api/upload - handles file upload and returns raw text
router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  validateFilePresence,
  validateMimeType,
  validateResumeLikelihood,
  handleFileUpload
);

// POST /api/upload/save-edit - save resume edit
router.post("/save-edit", authMiddleware, saveResumeEdit);

// POST /api/upload/generate - generate resume HTML
router.post("/generate", generateResume);

// POST /api/upload/generate-pdf - generate resume PDF
router.post("/generate-pdf", generateResumePdf);

// POST /api/upload/generate-docx - generate resume DOCX
router.post("/generate-docx", generateResumeDocx);

// POST /api/upload/extract-template-data - extract data for templates
router.post("/extract-template-data", extractTemplateData);

export default router;
