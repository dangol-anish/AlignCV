import { Router } from "express";
import multer from "multer";
import { handleFileUpload } from "../controllers/uploadController";
import {
  validateFilePresence,
  validateMimeType,
  validateResumeLikelihood,
} from "../middlewares/uploadValidators";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  saveResumeEdit,
  generateResume,
  generateResumePdf,
} from "../controllers/uploadController";

const router = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.post(
  "/",
  upload.single("file"),
  validateFilePresence,
  validateMimeType,
  validateResumeLikelihood,
  handleFileUpload
);

// Protected route for saving resume edits
router.post("/edit", authMiddleware, saveResumeEdit);

router.post("/generate", generateResume);

router.post("/generate-pdf", generateResumePdf);

export default router;
