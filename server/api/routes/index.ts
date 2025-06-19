import { Router } from "express";
import usersRoutes from "./usersRoutes";
import testRoutes from "./testRoutes";
import uploadRoutes from "./uploadRoutes";
import resumesRoute from "./resumesRoutes";
import analysisRoutes from "./analysisRoutes";
import jobMatchingRoutes from "./jobMatchingRoutes";
import coverLetterRoutes from "./coverLetterRoutes";
import authRoutes from "./authRoutes";

const router = Router();

router.use("/users", usersRoutes);
router.use("/test", testRoutes);
router.use("/upload", uploadRoutes);
router.use("/resumes", resumesRoute);
router.use("/analyze", analysisRoutes);
router.use("/job-matching", jobMatchingRoutes);
router.use("/cover-letter", coverLetterRoutes);
router.use("/auth", authRoutes);

export default router;
