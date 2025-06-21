import { Request, Response } from "express";
import {
  generateCoverLetter as generateCoverLetterService,
  getCoverLettersForUser as getCoverLettersService,
  getCoverLetterById as getCoverLetterByIdService,
} from "../../services/coverLetterService";
import { htmlToPdf } from "../../services/pdfGenerator";
import { fillResumeTemplate } from "../../services/templateFiller";
import path from "path";
import { generateCoverLetterDocx } from "../../services/docxGenerator";

export async function generateCoverLetter(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { resume_id, job_description, answers } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const result = await generateCoverLetterService({
      userId,
      resumeId: resume_id || undefined,
      jobDescription: job_description || undefined,
      answers: answers || {},
    });
    return res.json({ success: true, result });
  } catch (err: any) {
    console.error("Error generating cover letter:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate cover letter",
      error: err,
    });
  }
}

export async function getCoverLettersForUser(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { resume_id } = req.query;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const results = await getCoverLettersService(
      userId,
      resume_id as string | undefined
    );
    return res.json({ success: true, results });
  } catch (err: any) {
    console.error("Error fetching cover letters:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch cover letters",
      error: err,
    });
  }
}

export async function getCoverLetterById(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const coverLetter = await getCoverLetterByIdService(id, userId);

    if (!coverLetter) {
      return res.status(404).json({
        success: false,
        message: "Cover letter not found",
      });
    }

    const formattedCoverLetter = {
      id: coverLetter.data?.id,
      cover_letter: coverLetter.data?.cover_letter,
      job_title: coverLetter.data?.job_title,
      created_at: coverLetter.data?.created_at,
    };

    const response = { success: true, coverLetter: formattedCoverLetter };

    return res.json(response);
  } catch (err: any) {
    console.error("Error fetching cover letter:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch cover letter",
      error: err,
    });
  }
}

export async function downloadCoverLetterPdf(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const coverLetter = await getCoverLetterByIdService(id, userId);
    if (!coverLetter || !coverLetter.data) {
      return res
        .status(404)
        .json({ success: false, message: "Cover letter not found" });
    }
    // Render minimal HTML for PDF (no heading, just plain text, preserved spacing)
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset=\"UTF-8\" />
          <title>Cover Letter</title>
          <style>
            body {
              background: #fff;
              color: #111;
              font-family: Arial, sans-serif;
              margin: 40px;
              padding: 0;
            }
            .content {
              font-size: 1.1rem;
              line-height: 1.7;
              font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
              white-space: pre-wrap;
              color: #111;
            }
          </style>
        </head>
        <body>
          <div class="content">${coverLetter.data.cover_letter
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</div>
        </body>
      </html>
    `;
    const pdfBuffer = await htmlToPdf(html);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=cover-letter-${id}.pdf`
    );

    res.send(pdfBuffer);
  } catch (err: any) {
    console.error("[PDF] Error generating PDF:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to generate PDF",
    });
  }
}

export async function downloadCoverLetterDocx(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const coverLetter = await getCoverLetterByIdService(id, userId);
    if (!coverLetter || !coverLetter.data) {
      return res
        .status(404)
        .json({ success: false, message: "Cover letter not found" });
    }
    // Generate DOCX with preserved styling
    const docxBuffer = await generateCoverLetterDocx({
      title: coverLetter.data.job_title || "Cover Letter",
      content: coverLetter.data.cover_letter,
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=cover-letter-${id}.docx`
    );
    res.send(docxBuffer);
  } catch (err: any) {
    console.error("[DOCX] Error generating DOCX:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to generate DOCX",
    });
  }
}
