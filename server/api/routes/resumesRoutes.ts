import { Router } from "express";
import {
  getUserResumes,
  getResumeById,
  referenceResumeForFeature,
  getAllResumeAnalysesForUser,
} from "../controllers/resumesController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Get all resumes for the authenticated user
router.get("/", authMiddleware, getUserResumes);

// GET /api/resumes/analyses - Must be before /:id route
router.get("/analyses", authMiddleware, getAllResumeAnalysesForUser);

// Reference a resume for a feature
router.post("/reference", authMiddleware, referenceResumeForFeature);

// Get a specific resume by ID for the authenticated user
router.get("/:id", authMiddleware, getResumeById);

export default router;
