import { Request, Response } from "express";
import {
  generateCoverLetter as generateCoverLetterService,
  getCoverLettersForUser as getCoverLettersService,
  getCoverLetterById as getCoverLetterByIdService,
} from "../../services/coverLetterService";

export async function generateCoverLetter(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { resume_id, job_description, answers } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  console.log("Received cover letter request:", {
    userId,
    resume_id,
    hasJobDescription: !!job_description,
    answerKeys: Object.keys(answers || {}),
  });

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
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const results = await getCoverLettersService(userId);
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

  console.log("\n=== GET COVER LETTER BY ID ===");
  console.log("Request params:", { userId, id });
  console.log("Auth header:", req.headers.authorization);
  console.log("User object:", (req as any).user);

  if (!userId) {
    console.log("No user ID found in request");
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const coverLetter = await getCoverLetterByIdService(id, userId);
    console.log("Retrieved cover letter:", coverLetter);

    if (!coverLetter) {
      console.log("No cover letter found");
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
    console.log("Sending response:", response);
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
