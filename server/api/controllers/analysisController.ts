import { Request, Response } from "express";
import { supabase } from "../../database";
import { parseResumeWithGemini } from "../../services/resumeParser";
import { scoreResumeATS } from "../../services/atsScorer";
import { analyzeResume } from "../../services/categoryClassifier";

export async function analyzeResumeById(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { resume_id } = req.body;
  if (!resume_id) {
    return res
      .status(400)
      .json({ success: false, message: "Missing resume_id" });
  }
  // Fetch the resume
  let query = supabase.from("resumes").select("*").eq("id", resume_id);
  if (userId) query = query.eq("user_id", userId);
  const { data: resume, error: resumeError } = await query.single();
  if (resumeError || !resume) {
    return res
      .status(404)
      .json({ success: false, message: "Resume not found" });
  }
  try {
    // Parse and analyze
    const parsedData = await parseResumeWithGemini(resume.raw_text);
    const atsScoreResult = await scoreResumeATS(resume.raw_text);
    const analysis = await analyzeResume(resume.raw_text);
    // Store analysis
    const { data: analysisRow, error: analysisError } = await supabase
      .from("resume_analysis")
      .insert([
        {
          resume_id: resume.id,
          ats_score: atsScoreResult,
          category_insights: analysis.categoryInsights,
          line_improvements: analysis.lineImprovements,
        },
      ])
      .select()
      .single();
    if (analysisError) throw analysisError;
    return res.json({
      success: true,
      parsed: parsedData,
      atsScore: atsScoreResult,
      categoryInsights: analysis.categoryInsights,
      lineImprovements: analysis.lineImprovements,
      analysis: analysisRow,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to analyze resume",
      error: err,
    });
  }
}
