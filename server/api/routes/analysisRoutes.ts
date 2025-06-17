import { Router } from "express";
import { analyzeResumeById } from "../controllers/analysisController";
import multer from "multer";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// POST /api/analyze - analyze a resume (either by file upload or resume_id)
router.post("/", upload.single("file"), analyzeResumeById);

export default router;
