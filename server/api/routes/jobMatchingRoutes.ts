import { Router } from "express";
import {
  matchJob,
  getJobMatchesForUser,
  getJobMatchById,
} from "../controllers/jobMatchingController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// POST /api/job-matching
router.post("/", authMiddleware, matchJob);

// GET /api/job-matching
router.get("/", authMiddleware, getJobMatchesForUser);

// GET /api/job-matching/:id
router.get("/:id", authMiddleware, getJobMatchById);

export default router;
