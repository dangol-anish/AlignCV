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
import { generateResumeDocx as generateDocxFromData } from "../../services/docxGenerator";
import { limitedGenerateContent } from "../../utils/geminiLimiter";

export async function handleFileUpload(req: MulterRequest, res: Response) {
  const { originalname, mimetype, size } = req.file!;
  const cleanedText = req.cleanedText!;

  // Add detailed logging

  // Only validate and store the resume, no analysis or parsing
  try {
    const userId = req.user?.id ?? null;
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .insert([
        {
          user_id: userId,
          original_filename: originalname,
          mimetype,
          size,
          raw_text: cleanedText,
        },
      ])
      .select()
      .single();
    if (resumeError) {
      console.error("[UPLOAD] Supabase DB error:", resumeError);
      throw resumeError;
    }

    return res.json({ success: true, resume });
  } catch (dbError: any) {
    console.error("[UPLOAD] Exception:", dbError);
    return res.status(500).json({
      success: false,
      message: "Failed to store resume in database.",
      code: "DB_ERROR",
      error: dbError.message,
    });
  }
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

    if (!template || !data) {
      return res.status(400).json({ error: "Missing template or data" });
    }
    let html;
    try {
      html = await fillResumeTemplate(template, data);
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

export async function generateResumeDocx(req: Request, res: Response) {
  try {
    const { template, data } = req.body;
    if (!template || !data) {
      return res.status(400).json({ error: "Missing template or data" });
    }

    try {
      const docxBuffer = await generateDocxFromData(data);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("Content-Disposition", "attachment; filename=resume.docx");
      return res.status(200).send(docxBuffer);
    } catch (docxErr: any) {
      return res
        .status(500)
        .json({ error: "Failed to generate DOCX", details: docxErr.message });
    }
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Failed to generate DOCX", details: err.message });
  }
}

export async function extractTemplateData(req: Request, res: Response) {
  try {
    const { resumeText, improvements } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Missing resume text" });
    }

    // Create a comprehensive prompt for template data extraction
    const extractionPrompt = `
You are an expert resume parser. Extract structured data from this resume for template generation.

RESUME TEXT:
${resumeText}

IMPROVEMENTS TO APPLY:
${improvements ? JSON.stringify(improvements, null, 2) : "None"}

Extract and structure the following information as JSON:

1. PERSONAL INFORMATION:
   - name: Full name (e.g., "John Doe")
   - email: Email address (e.g., "john.doe@email.com")
   - phone: Phone number (e.g., "+1-555-123-4567")
   - location: City, State/Country (e.g., "New York, NY" or "London, UK")

2. WORK EXPERIENCE (array of objects):
   - title: Job title
   - company: Company name
   - dates: Employment period (e.g., "Jan 2023 - Present")
   - description: Job description or key responsibilities

3. EDUCATION (array of objects):
   - degree: Degree name
   - institution: School/University name
   - dates: Graduation date or period
   - details: GPA, honors, relevant coursework

4. SKILLS (object with categorized skills):
   Categorize skills into logical groups. Use these categories when applicable:
   - "Programming Languages": Python, JavaScript, Java, C#, etc.
   - "Frameworks & Libraries": React, Node.js, Express, Flask, etc.
   - "Databases": PostgreSQL, MySQL, MongoDB, etc.
   - "Tools & Platforms": Git, Docker, AWS, etc.
   - "Other": Any skills that don't fit the above categories
   
   Example structure:
   {
     "Programming Languages": ["Python", "JavaScript", "Java"],
     "Frameworks & Libraries": ["React", "Node.js", "Express"],
     "Databases": ["PostgreSQL", "MongoDB"],
     "Tools & Platforms": ["Git", "Docker", "AWS"]
   }

5. PROJECTS (array of objects):
   - title: Project name
   - dates: Project period (if available)
   - description: Convert long descriptions into 3-5 bullet points. Each bullet should be concise and highlight key achievements, technologies used, and impact.

6. SUMMARY (string):
   - Professional summary or objective (2-3 sentences max)

IMPORTANT GUIDELINES:
- For contact info: Extract email, phone, and location separately. Look for patterns like "email@domain.com", phone numbers, and location mentions.
- For projects: Break down long descriptions into bullet points. Each bullet should start with action verbs and be 1-2 lines max.
- For skills: Categorize them logically. Don't create categories for single skills - group similar skills together.
- Apply improvements: If an improvement matches the original text, use the suggested improvement instead.
- Be precise: Extract exact values, don't make up information.

Return ONLY valid JSON with this structure:
{
  "name": "string",
  "email": "string", 
  "phone": "string",
  "location": "string",
  "work": [{"title": "string", "company": "string", "dates": "string", "description": "string"}],
  "education": [{"degree": "string", "institution": "string", "dates": "string", "details": "string"}],
  "skills": {"category": ["skill1", "skill2"]},
  "projects": [{"title": "string", "dates": "string", "description": "string"}],
  "summary": "string"
}
`;

    try {
      const responseText = await limitedGenerateContent(extractionPrompt);

      // Clean the response
      const cleanedResponse = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const extractedData = JSON.parse(cleanedResponse);

      return res.json({
        success: true,
        data: extractedData,
      });
    } catch (aiError: any) {
      console.error("AI extraction failed:", aiError);
      return res.status(500).json({
        error: "Failed to extract data with AI",
        details: aiError.message,
      });
    }
  } catch (err: any) {
    console.error("[extractTemplateData] Error:", err);
    return res.status(500).json({
      error: "Failed to extract template data",
      details: err.message,
    });
  }
}
