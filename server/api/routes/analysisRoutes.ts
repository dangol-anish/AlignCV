import { Router } from "express";
import { analyzeResumeById } from "../controllers/analysisController";
import multer from "multer";
import {
  validateFilePresence,
  validateMimeType,
  validateResumeLikelihood,
} from "../middlewares/uploadValidators";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// POST /api/analyze - analyze a resume (either by file upload or resume_id)
router.post(
  "/",
  async (req, res, next) => {
    // If there's a resume_id in the body, require authentication
    if (req.body.resume_id) {
      return authMiddleware(req, res, next);
    }
    // Otherwise, proceed with file upload (no auth required)
    next();
  },
  async (req, res, next) => {
    // If there's a resume_id in the body, skip file validation
    if (req.body.resume_id) {
      return next();
    }

    // Otherwise, handle file upload
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "File upload failed",
          code: "UPLOAD_FAILED",
          error: err.message,
        });
      }
      next();
    });
  },
  (req, res, next) => {
    // Skip file validation middleware if analyzing stored resume
    if (req.body.resume_id) {
      return next();
    }
    validateFilePresence(req, res, next);
  },
  (req, res, next) => {
    // Skip mime type validation if analyzing stored resume
    if (req.body.resume_id) {
      return next();
    }
    validateMimeType(req, res, next);
  },
  (req, res, next) => {
    // Skip resume likelihood validation if analyzing stored resume
    if (req.body.resume_id) {
      return next();
    }
    validateResumeLikelihood(req, res, next);
  },
  analyzeResumeById
);

export default router;
