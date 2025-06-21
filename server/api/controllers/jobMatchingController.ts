import { Request, Response } from "express";
import {
  matchResumeToJob,
  getJobMatchingResultsForUser,
} from "../../services/jobMatchingService";
import { supabase } from "../../database";

export async function matchJob(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { resume_id, job_description, company_name } = req.body;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (!resume_id || !job_description || !company_name) {
    return res.status(400).json({
      success: false,
      message: "Missing resume_id, job_description, or company_name",
    });
  }
  try {
    const result = await matchResumeToJob({
      userId,
      resumeId: resume_id,
      jobDescription: job_description,
      companyName: company_name,
    });
    return res.json({ success: true, result });
  } catch (err: any) {
    console.error("[/api/job-matching] Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to match resume to job",
      error: err,
    });
  }
}

export async function getJobMatchesForUser(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { resume_id } = req.query;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    let query = supabase
      .from("job_matching_results")
      .select("*")
      .eq("user_id", userId);

    if (resume_id) {
      query = query.eq("resume_id", resume_id as string);
    }

    const { data: matches, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    return res.json({
      success: true,
      matches,
    });
  } catch (err: any) {
    console.error("Error fetching job matches:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch job matches",
      error: err,
    });
  }
}

export async function getJobMatchById(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const { data: match, error } = await supabase
      .from("job_matching_results")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("[Server] Database error:", error);
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Job match not found",
        });
      }
      throw error;
    }

    return res.json({
      success: true,
      match,
    });
  } catch (err: any) {
    console.error("[Server] Error fetching job match:", {
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch job match",
      error: err,
    });
  }
}
