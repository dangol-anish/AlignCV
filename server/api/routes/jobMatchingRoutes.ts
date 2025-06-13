import { Router } from "express";
import {
  matchJob,
  getJobMatchesForUser,
} from "../controllers/jobMatchingController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// POST /api/job-matching
router.post("/", authMiddleware, matchJob);

// GET /api/job-matching
router.get("/", authMiddleware, getJobMatchesForUser);

export default router;
