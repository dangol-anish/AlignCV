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
}: {
  userId: string;
  resumeId: string;
  jobDescription: string;
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
  const aiText = await generateContentWithRetry(prompt);
  let ai_analysis;
  try {
    ai_analysis = JSON.parse(
      aiText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
    );
  } catch (e) {
    throw new Error("Failed to parse AI response: " + aiText);
  }
  // Store result
  const { data: result, error: storeError } = await supabase
    .from("job_matching_results")
    .insert([
      {
        user_id: userId,
        resume_id: resumeId,
        job_description: jobDescription,
        ai_analysis,
      },
    ])
    .select()
    .single();
  if (storeError || !result) {
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
