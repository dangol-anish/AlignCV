import { Router } from "express";
import {
  matchJob,
  getJobMatchesForUser,
  getJobMatchById,
} from "../controllers/jobMatchingController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Diagnostic Test Endpoint
router.post("/test", authMiddleware, (req, res) => {
  console.log("✅ [DIAGNOSTIC] /api/job-matching/test endpoint hit!");

  setTimeout(() => {
    console.log("✅ [DIAGNOSTIC] 10-second timeout finished.");
    res
      .status(200)
      .json({ success: true, message: "Diagnostic test successful!" });
  }, 10000); // 10-second delay
});

// POST /api/job-matching
router.post("/", authMiddleware, matchJob);

// GET /api/job-matching
router.get("/", authMiddleware, getJobMatchesForUser);

// GET /api/job-matching/:id
router.get("/:id", authMiddleware, getJobMatchById);

export default router;
