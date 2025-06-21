import { supabase } from "../database";
import { getModel, generateContentWithRetry } from "../utils/geminiHelper";
import fs from "fs";
import path from "path";
import { IJobMatchingResult } from "../api/interfaces/jobMatching";

const promptPath = path.join(__dirname, "../prompts/jobMatch.prompt.txt");
const jobMatchPrompt = fs.readFileSync(promptPath, "utf-8");

export async function matchResumeToJob({
  userId,
  resumeId,
  jobDescription,
  companyName,
}: {
  userId: string;
  resumeId: string;
  jobDescription: string;
  companyName: string;
}): Promise<IJobMatchingResult> {
  // Fetch resume
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .single();
  if (resumeError || !resume) {
    throw new Error("Resume not found or access denied");
  }
  // Prepare prompt
  const prompt = jobMatchPrompt
    .replace("{{RESUME_TEXT}}", resume.raw_text || "")
    .replace("{{JOB_DESCRIPTION}}", jobDescription);
  // Call Gemini
  let aiText;
  try {
    aiText = await generateContentWithRetry(prompt);
  } catch (err: any) {
    console.error("[jobMatchingService] Error calling Gemini API:", err);
    throw new Error("Gemini API call failed: " + (err?.message || err));
  }
  let ai_analysis;
  let job_title;
  try {
    ai_analysis = JSON.parse(
      aiText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
    );
    job_title = ai_analysis.job_title;
  } catch (e) {
    console.error(
      "[jobMatchingService] Failed to parse AI response:",
      aiText,
      e
    );
    throw new Error("Failed to parse AI response: " + aiText);
  }
  // Store result
  const { match_score, strengths, gaps, suggestions } = ai_analysis;
  const { data: result, error: storeError } = await supabase
    .from("job_matching_results")
    .insert([
      {
        user_id: userId,
        resume_id: resumeId,
        job_description: jobDescription,
        company_name: companyName,
        ai_analysis,
        match_score,
        strengths,
        gaps,
        suggestions,
      },
    ])
    .select()
    .single();
  if (storeError || !result) {
    console.error(
      "[jobMatchingService] Failed to store job matching result:",
      storeError
    );
    throw new Error("Failed to store job matching result");
  }
  return result as IJobMatchingResult;
}

export async function getJobMatchingResultsForUser(userId: string) {
  const { data, error } = await supabase
    .from("job_matching_results")
    .select("*, resumes(original_filename)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  // Attach filename at top level for convenience
  return (data || []).map((row: any) => ({
    ...row,
    resume_filename: row.resumes?.original_filename || row.resume_id,
  }));
}
