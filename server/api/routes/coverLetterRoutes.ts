import { Router } from "express";
import {
  generateCoverLetter,
  getCoverLettersForUser,
  getCoverLetterById,
} from "../controllers/coverLetterController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// POST /api/cover-letter/generate
router.post("/generate", authMiddleware, generateCoverLetter);

// GET /api/cover-letter
router.get("/", authMiddleware, getCoverLettersForUser);

// GET /api/cover-letter/:id
router.get("/:id", authMiddleware, getCoverLetterById);

export default router;
