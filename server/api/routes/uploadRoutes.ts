import { Router } from "express";
import multer from "multer";
import { handleFileUpload } from "../controllers/uploadController";

const router = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.post("/", upload.single("file"), handleFileUpload);

export default router;
