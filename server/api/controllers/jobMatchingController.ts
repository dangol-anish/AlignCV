import { Request, Response } from "express";
import {
  matchResumeToJob,
  getJobMatchingResultsForUser,
} from "../../services/jobMatchingService";

export async function matchJob(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { resume_id, job_description } = req.body;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (!resume_id || !job_description) {
    return res.status(400).json({
      success: false,
      message: "Missing resume_id or job_description",
    });
  }
  try {
    const result = await matchResumeToJob({
      userId,
      resumeId: resume_id,
      jobDescription: job_description,
    });
    return res.json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to match resume to job",
      error: err,
    });
  }
}

export async function getJobMatchesForUser(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const results = await getJobMatchingResultsForUser(userId);
    return res.json({ success: true, results });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch job matching results",
      error: err,
    });
  }
}
