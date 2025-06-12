import { Router } from "express";
import {
  getUserResumes,
  getResumeById,
  referenceResumeForFeature,
} from "../controllers/resumesController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Get all resumes for the authenticated user
router.get("/", authMiddleware, getUserResumes);

// Get a specific resume by ID for the authenticated user
router.get("/:id", authMiddleware, getResumeById);

// Reference a resume for a feature
router.post("/reference", authMiddleware, referenceResumeForFeature);

export default router;
