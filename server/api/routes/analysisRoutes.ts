import { Router } from "express";
import { analyzeResumeById } from "../controllers/analysisController";
const router = Router();

// POST /api/analyze - analyze a stored resume by resume_id
router.post("/", analyzeResumeById);

export default router;
