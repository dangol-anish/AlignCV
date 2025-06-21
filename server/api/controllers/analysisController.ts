import { Request, Response } from "express";
import { supabase } from "../../database";
import { parseResumeWithGemini } from "../../services/resumeParser";
import { scoreResumeATS } from "../../services/atsScorer";
import { analyzeResume } from "../../services/categoryClassifier";
import { extractTextFromBuffer } from "../../services/textExtractor";
import { cleanExtractedText } from "../../services/textCleaner";

export async function analyzeResumeById(req: Request, res: Response) {
  console.log("Backend: analyzeResumeById called with request body:", req.body);
  const userId = (req as any).user?.id;
  const { resume_id } = req.body;
  const file = (req as any).file;

  // Handle file upload case
  if (file) {
    try {
      // The file has already been validated by the middleware
      const cleanedText = (req as any).cleanedText;
      if (!cleanedText) {
        return res.status(400).json({
          success: false,
          message: "Failed to process the uploaded file",
          code: "PROCESSING_ERROR",
        });
      }

      // Parse and analyze
      console.log("Step 1: Parsing resume with Gemini");
      const parsedData = await parseResumeWithGemini(cleanedText);
      console.log("Resume parsing completed");

      console.log("Step 2: Scoring resume with ATS");
      const atsScoreResult = await scoreResumeATS(cleanedText);
      console.log("ATS scoring completed");

      console.log("Step 3: Analyzing resume categories");
      const analysis = await analyzeResume(cleanedText);
      console.log("Category analysis completed");

      // Store the resume and analysis if user is authenticated
      if (userId) {
        console.log("Step 4: Storing resume and analysis");
        const { data: resume, error: resumeError } = await supabase
          .from("resumes")
          .insert([
            {
              user_id: userId,
              original_filename: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              raw_text: cleanedText,
              parsed_data: parsedData,
            },
          ])
          .select()
          .single();

        if (resumeError) {
          return res.status(500).json({
            success: false,
            message: "Failed to store resume",
            code: "STORAGE_ERROR",
            error: resumeError.message,
          });
        }

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

        if (analysisError) {
          return res.status(500).json({
            success: false,
            message: "Failed to store analysis",
            code: "ANALYSIS_STORAGE_ERROR",
            error: analysisError.message,
          });
        }
      }

      console.log("Analysis completed successfully");
      return res.json({
        success: true,
        parsed: parsedData,
        atsScore: atsScoreResult,
        categoryInsights: analysis.categoryInsights,
        lineImprovements: analysis.lineImprovements,
      });
    } catch (err: any) {
      console.error("Error analyzing uploaded file:", err);

      // Determine the specific error type and code
      let errorMessage = "Failed to analyze uploaded file";
      let errorCode = "ANALYSIS_FAILED";

      if (err.message?.includes("quota") || err.message?.includes("limit")) {
        errorMessage = "API quota exceeded. Please try again later.";
        errorCode = "QUOTA_EXCEEDED";
      } else if (
        err.message?.includes("invalid") ||
        err.message?.includes("not a valid resume")
      ) {
        errorMessage =
          "The uploaded file doesn't appear to be a valid resume. Please check the format and content";
        errorCode = "INVALID_RESUME";
      } else if (err.message?.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
        errorCode = "TIMEOUT";
      } else if (
        err.message?.includes("mime") ||
        err.message?.includes("type")
      ) {
        errorMessage =
          "Unsupported file type. Please upload a PDF, DOC, DOCX, PNG, or JPEG file";
        errorCode = "UNSUPPORTED_TYPE";
      }

      return res.status(500).json({
        success: false,
        message: errorMessage,
        code: errorCode,
        error: err.message,
      });
    }
  }

  // Handle resume_id case
  if (!resume_id) {
    return res.status(400).json({
      success: false,
      message: "Missing resume_id or file",
      code: "NO_FILE",
    });
  }

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  // Fetch the resume
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resume_id)
    .eq("user_id", userId)
    .single();

  if (resumeError || !resume) {
    return res.status(404).json({
      success: false,
      message: "Resume not found",
      code: "RESUME_NOT_FOUND",
    });
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
    if (analysisError) {
      return res.status(500).json({
        success: false,
        message: "Failed to store analysis",
        code: "ANALYSIS_STORAGE_ERROR",
        error: analysisError.message,
      });
    }

    // Update the resume with parsed data
    console.log("Step 5: Updating resume with parsed data");
    const { error: updateError } = await supabase
      .from("resumes")
      .update({ parsed_data: parsedData })
      .eq("id", resume.id);

    if (updateError) {
      console.error("Failed to update resume with parsed data:", updateError);
      // Don't fail the request, just log the error
    }

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
    let errorCode = "ANALYSIS_FAILED";

    if (err.message?.includes("quota") || err.message?.includes("limit")) {
      errorMessage = "API quota exceeded. Please try again later.";
      errorCode = "QUOTA_EXCEEDED";
    } else if (err.message?.includes("invalid")) {
      errorMessage = "Invalid resume format or content";
      errorCode = "INVALID_RESUME";
    } else if (err.message?.includes("timeout")) {
      errorMessage = "Request timed out. Please try again.";
      errorCode = "TIMEOUT";
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      code: errorCode,
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
  }
}
