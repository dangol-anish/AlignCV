import { Router } from "express";
import {
  generateCoverLetter,
  getCoverLettersForUser,
  getCoverLetterById,
  downloadCoverLetterPdf,
  downloadCoverLetterDocx,
} from "../controllers/coverLetterController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// POST /api/cover-letter/generate
router.post("/generate", authMiddleware, generateCoverLetter);

// GET /api/cover-letter
router.get("/", authMiddleware, getCoverLettersForUser);

// GET /api/cover-letter/:id
router.get("/:id", authMiddleware, getCoverLetterById);

// GET /api/cover-letter/:id/pdf
router.get("/:id/pdf", authMiddleware, downloadCoverLetterPdf);

// GET /api/cover-letter/:id/docx
router.get("/:id/docx", authMiddleware, downloadCoverLetterDocx);

export default router;
