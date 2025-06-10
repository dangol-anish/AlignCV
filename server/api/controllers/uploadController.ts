import { Response } from "express";
import { MulterRequest } from "../interfaces/upload";
import { supabase } from "../../database";
import { parseResumeWithGemini } from "../../services/resumeParser";
import { DynamicResumeSections } from "../interfaces/resume";
import { scoreResumeATS } from "../../services/atsScorer";
import { analyzeResume } from "../../services/categoryClassifier";
import { fillResumeTemplate } from "../../services/templateFiller";
import { Request } from "express";
import { htmlToPdf } from "../../services/pdfGenerator";

export async function handleFileUpload(req: MulterRequest, res: Response) {
  // At this point, req.cleanedText is set by the validator middleware
  const { originalname, mimetype, size } = req.file!;
  const cleanedText = req.cleanedText!;

  let structuredData: DynamicResumeSections | null = null;
  try {
    structuredData = (await parseResumeWithGemini(
      cleanedText
    )) as DynamicResumeSections;
  } catch (geminiError: any) {
    console.error("Gemini parsing failed:", geminiError);
    let userMessage = "Resume parsing failed. Please try again later.";
    let code = "GEMINI_PARSE_ERROR";
    if (geminiError.status === 503) {
      userMessage =
        "Our AI is currently overloaded. Please try again in a few minutes.";
      code = "GEMINI_OVERLOADED";
    } else if (
      geminiError.message &&
      geminiError.message.includes("Invalid Gemini response")
    ) {
      userMessage =
        "The AI could not understand your resume. Try a different file or format.";
      code = "GEMINI_INVALID_RESPONSE";
    }
    return res.status(500).json({ success: false, message: userMessage, code });
  }

  let atsScoreResult = null;
  try {
    atsScoreResult = await scoreResumeATS(cleanedText);
  } catch (e) {
    console.error("ATS scoring failed:", e);
  }

  let categoryInsights = null;
  let lineImprovements: any[] = [];
  try {
    const analysis = await analyzeResume(cleanedText);
    categoryInsights = analysis.categoryInsights;
    lineImprovements = analysis.lineImprovements;
  } catch (e: any) {
    console.error("Resume analysis failed:", e);
    let userMessage = "Resume analysis failed. Please try again later.";
    let code = "GEMINI_ANALYSIS_ERROR";
    if (e.status === 503) {
      userMessage =
        "Our AI is currently overloaded. Please try again in a few minutes.";
      code = "GEMINI_OVERLOADED";
    } else if (
      e.message &&
      e.message.includes("Invalid analyzeResume response")
    ) {
      userMessage =
        "The AI could not analyze your resume. Try a different file or format.";
      code = "GEMINI_INVALID_RESPONSE";
    }
    return res.status(500).json({ success: false, message: userMessage, code });
  }

  // Store in Supabase
  try {
    const userId = req.user?.id ?? null; // If you have auth middleware, otherwise null
    // 1. Insert resume
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .insert([
        {
          user_id: userId,
          original_filename: originalname,
          mimetype,
          size,
          raw_text: cleanedText,
          parsed_data: structuredData,
        },
      ])
      .select()
      .single();
    if (resumeError) throw resumeError;

    // 2. Insert analysis
    const { error: analysisError } = await supabase
      .from("resume_analysis")
      .insert([
        {
          resume_id: resume.id,
          ats_score: atsScoreResult,
          category_insights: categoryInsights,
          line_improvements: lineImprovements,
        },
      ]);
    if (analysisError) throw analysisError;
  } catch (dbError: any) {
    console.error("Supabase DB error:", dbError);
    return res.status(500).json({
      success: false,
      message: "Failed to store resume or analysis in database.",
      code: "DB_ERROR",
    });
  }

  console.log("File info:", {
    name: originalname,
    type: mimetype,
    size,
    text: cleanedText,
  });
  console.log("Parsed resume data:", structuredData);
  console.log("ATS score result:", atsScoreResult);
  console.log("Category insights:", categoryInsights);
  console.log("Line improvements:", lineImprovements);

  return res.json({
    success: true,
    file: { name: originalname, type: mimetype, size, text: cleanedText },
    parsed: structuredData,
    atsScore: atsScoreResult,
    categoryInsights,
    lineImprovements,
  });
}

export async function saveResumeEdit(req: MulterRequest, res: Response) {
  // Require authentication
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const { resume_id, edited_data } = req.body;
  if (!resume_id || !edited_data) {
    return res
      .status(400)
      .json({ success: false, message: "Missing resume_id or edited_data" });
  }
  try {
    const { data, error } = await supabase
      .from("resume_edits")
      .insert([
        {
          resume_id,
          user_id: userId,
          edited_data,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return res.json({ success: true, edit: data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to save resume edit",
      error: err,
    });
  }
}

export async function generateResume(req: Request, res: Response) {
  try {
    const { template, data } = req.body;
    console.log("generateResume called with:", { template, data });
    if (!template || !data) {
      return res.status(400).json({ error: "Missing template or data" });
    }
    let html;
    try {
      console.log(
        "[generateResume] Data to fillResumeTemplate:",
        JSON.stringify(data, null, 2)
      );
      html = await fillResumeTemplate(template, data);
      console.log("[generateResume] Successfully filled template");
    } catch (fillErr: any) {
      console.error(
        "[generateResume] Error in fillResumeTemplate:",
        fillErr,
        fillErr?.stack
      );
      return res.status(500).json({
        error: "Failed to fill template",
        details: fillErr.message,
        stack: fillErr.stack,
      });
    }
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
  } catch (err: any) {
    console.error("[generateResume] Error generating resume:", err, err?.stack);
    return res.status(500).json({
      error: "Failed to generate resume",
      details: err.message || err.toString(),
      stack: err.stack,
    });
  }
}

export async function generateResumePdf(req: Request, res: Response) {
  try {
    const { template, data } = req.body;
    if (!template || !data) {
      return res.status(400).json({ error: "Missing template or data" });
    }
    let html;
    try {
      html = await fillResumeTemplate(template, data);
    } catch (fillErr: any) {
      return res
        .status(500)
        .json({ error: "Failed to fill template", details: fillErr.message });
    }
    try {
      const pdfBuffer = await htmlToPdf(html);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
      return res.status(200).send(pdfBuffer);
    } catch (pdfErr: any) {
      return res
        .status(500)
        .json({ error: "Failed to generate PDF", details: pdfErr.message });
    }
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Failed to generate PDF", details: err.message });
  }
}
