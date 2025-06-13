import { Router } from "express";
import {
  getUserResumes,
  getResumeById,
  referenceResumeForFeature,
  getAllResumeAnalysesForUser,
  getResumeAnalysisById,
} from "../controllers/resumesController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Get all resumes for the authenticated user
router.get("/", authMiddleware, getUserResumes);

// GET /api/resumes/analyses - Must be before /:id route
router.get("/analyses", authMiddleware, getAllResumeAnalysesForUser);

// GET /api/resumes/analyses/:id - Get a single resume analysis
router.get("/analyses/:id", authMiddleware, getResumeAnalysisById);

// Reference a resume for a feature
router.post("/reference", authMiddleware, referenceResumeForFeature);

// Get a specific resume by ID for the authenticated user
router.get("/:id", authMiddleware, getResumeById);

export default router;
