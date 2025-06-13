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
    console.log("Starting resume analysis for ID:", resume_id);

    console.log("Step 1: Parsing resume with Gemini");
    const parsedData = await parseResumeWithGemini(resume.raw_text);
    console.log("Resume parsing completed");

    console.log("Step 2: Scoring resume with ATS");
    const atsScoreResult = await scoreResumeATS(resume.raw_text);
    console.log("ATS scoring completed");

    console.log("Step 3: Analyzing resume categories");
    const analysis = await analyzeResume(resume.raw_text);
    console.log("Category analysis completed");

    // Store analysis
    console.log("Step 4: Storing analysis results");
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

    console.log("Analysis completed successfully");
    return res.json({
      success: true,
      parsed: parsedData,
      atsScore: atsScoreResult,
      categoryInsights: analysis.categoryInsights,
      lineImprovements: analysis.lineImprovements,
      analysis: analysisRow,
    });
  } catch (err: any) {
    console.error("Detailed error in analyzeResumeById:", {
      error: err,
      message: err.message,
      stack: err.stack,
      code: err.code,
      details: err.details,
    });

    // Determine the specific error type
    let errorMessage = "Failed to analyze resume";
    if (err.message?.includes("quota") || err.message?.includes("limit")) {
      errorMessage = "API quota exceeded. Please try again later.";
    } else if (err.message?.includes("invalid")) {
      errorMessage = "Invalid resume format or content";
    } else if (err.message?.includes("timeout")) {
      errorMessage = "Request timed out. Please try again.";
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
  }
}
