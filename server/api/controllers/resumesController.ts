import { Request, Response } from "express";
import * as resumeService from "../../services/resumeService";
import { getResumeAnalysesForUser } from "../../services/resumeService";
import { supabase } from "../../database";

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

export async function getAllResumeAnalysesForUser(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const results = await getResumeAnalysesForUser(userId);
    return res.json({ success: true, results });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch resume analyses",
      error: err,
    });
  }
}

export async function getResumeAnalysisById(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // First get the resume to check ownership
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (resumeError) {
      if (resumeError.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Resume not found",
        });
      }
      throw resumeError;
    }

    if (!resume || resume.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this resume",
      });
    }

    // Then get the latest analysis for this resume
    const { data: analysis, error: analysisError } = await supabase
      .from("resume_analysis")
      .select("*")
      .eq("resume_id", resume.id)
      .order("analyzed_at", { ascending: false })
      .limit(1)
      .single();

    if (analysisError) {
      if (analysisError.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "No analysis found for this resume",
        });
      }
      throw analysisError;
    }

    return res.json({
      success: true,
      analysis,
    });
  } catch (err: any) {
    console.error("Error fetching resume analysis:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch resume analysis",
      error: err,
    });
  }
}
