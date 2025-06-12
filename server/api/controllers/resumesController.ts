import { Request, Response } from "express";
import * as resumeService from "../../services/resumeService";

export async function getUserResumes(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const resumes = await resumeService.getUserResumes(userId);
    return res.json({ success: true, resumes });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch resumes", error: err });
  }
}

export async function getResumeById(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const resumeId = req.params.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const resume = await resumeService.getResumeById(resumeId, userId);
    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }
    return res.json({ success: true, resume });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch resume", error: err });
  }
}

export async function referenceResumeForFeature(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { resume_id } = req.body;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (!resume_id) {
    return res
      .status(400)
      .json({ success: false, message: "Missing resume_id" });
  }
  try {
    const result = await resumeService.getResumeWithAnalysis(resume_id, userId);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to reference resume",
      error: err,
    });
  }
}
