import { Router } from "express";
import {
  getJobMatchesForUser,
  getJobMatchById,
} from "../controllers/jobMatchController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Get all job matches for the authenticated user
router.get("/", authMiddleware, getJobMatchesForUser);

// GET /api/job-match/:id - Get a single job match
router.get("/:id", authMiddleware, getJobMatchById);

export default router;
