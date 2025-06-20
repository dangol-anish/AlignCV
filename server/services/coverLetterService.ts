import { supabase } from "../database";
import { generateContentWithRetry } from "../utils/geminiHelper";
import fs from "fs";
import path from "path";

const promptPath = path.join(__dirname, "../prompts/coverLetter.prompt.txt");
const coverLetterPrompt = fs.readFileSync(promptPath, "utf-8");

interface GenerateCoverLetterParams {
  userId: string;
  resumeId?: string;
  jobDescription?: string;
  answers: {
    [key: string]: string;
  };
}

export async function generateCoverLetter({
  userId,
  resumeId,
  jobDescription,
  answers,
}: GenerateCoverLetterParams) {
  console.log("\n=== COVER LETTER GENERATION START ===");
  console.log("Input Parameters:", {
    userId,
    resumeId,
    hasJobDescription: !!jobDescription,
    answerKeys: Object.keys(answers),
  });

  let resumeText = "";
  let contextInfo = "";

  // Fetch resume if provided
  if (resumeId) {
    console.log("\nFetching resume with ID:", resumeId);
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("raw_text, original_filename")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .single();

    if (resumeError) {
      console.error("Failed to fetch resume:", resumeError);
      throw new Error(`Failed to fetch resume: ${resumeError.message}`);
    }

    if (!resume?.raw_text) {
      console.error("Resume found but no raw text available:", resume);
      throw new Error("Resume found but no text content available");
    }

    // Format the resume text with proper line breaks
    resumeText = resume.raw_text
      .replace(/\n{2,}/g, "\n") // Remove multiple newlines
      .replace(/([.!?])\s*/g, "$1\n") // Add newline after sentences
      .replace(/([A-Z][a-z]+:)/g, "\n$1") // Add newline before section headers
      .trim();

    console.log(
      "Successfully fetched resume text for:",
      resume.original_filename
    );
    console.log("Resume text preview:", resumeText.substring(0, 200) + "...");
  }

  // Build context from available information
  if (jobDescription) {
    contextInfo += `Job Description:\n${jobDescription}\n\n`;
    console.log("\nJob Description:", jobDescription);
  } else {
    contextInfo +=
      "No specific job description provided. Please write a general cover letter that highlights the candidate's strengths and experience.\n\n";
    console.log("\nNo job description provided");
  }

  // Add any provided answers to context
  const nonEmptyAnswers = Object.entries(answers)
    .filter(([_, value]) => value && value.trim() !== "")
    .map(([key, value]) => `${key}:\n${value}`);

  if (nonEmptyAnswers.length > 0) {
    contextInfo += "Additional Information:\n" + nonEmptyAnswers.join("\n\n");
    console.log("\nAdditional Information:", nonEmptyAnswers);
  }

  // Prepare prompt with available information
  const prompt = coverLetterPrompt
    .replace(
      "{{RESUME_TEXT}}",
      resumeText || "No resume information available."
    )
    .replace("{{JOB_DESCRIPTION}}", contextInfo)
    .replace("{{ANSWERS}}", "") // We've already included answers in contextInfo
    .replace(
      "{{CURRENT_DATE}}",
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

  // Add specific instructions to use actual information
  const enhancedPrompt =
    prompt +
    "\n\nIMPORTANT: Use the actual information from the resume. Do not use placeholders like [Your Name]. Replace them with the actual information provided in the resume.";

  console.log("\n=== FINAL PROMPT SENT TO AI ===");
  console.log(enhancedPrompt);
  console.log("\n=== END OF PROMPT ===");

  // Generate cover letter using AI
  const aiText = await generateContentWithRetry(enhancedPrompt);
  console.log("\n=== AI RESPONSE ===");
  console.log(aiText);
  console.log("\n=== END OF AI RESPONSE ===");

  // Store the cover letter
  const { data: result, error: storeError } = await supabase
    .from("cover_letters")
    .insert([
      {
        user_id: userId,
        resume_id: resumeId || null,
        job_description: jobDescription || null,
        cover_letter: aiText,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (storeError) {
    console.error("Database error:", storeError);
    throw new Error(`Failed to store cover letter: ${storeError.message}`);
  }

  if (!result) {
    throw new Error(
      "Failed to store cover letter: No result returned from database"
    );
  }

  console.log("\n=== STORED COVER LETTER ===");
  console.log("ID:", result.id);
  console.log("Content:", result.cover_letter);
  console.log("\n=== COVER LETTER GENERATION COMPLETE ===\n");

  return result;
}

export async function getCoverLettersForUser(
  userId: string,
  resumeId?: string
) {
  let query = supabase
    .from("cover_letters")
    .select("*, resumes(original_filename)")
    .eq("user_id", userId);

  if (resumeId) {
    query = query.eq("resume_id", resumeId);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Database error:", error);
    throw new Error(`Failed to fetch cover letters: ${error.message}`);
  }

  // Attach filename at top level for convenience
  return (data || []).map((row: any) => ({
    ...row,
    resume_filename:
      row.resumes?.original_filename || row.resume_id || "No resume",
  }));
}

export async function getCoverLetterById(id: string, userId: string) {
  try {
    const result = await supabase
      .from("cover_letters")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
    return result || null;
  } catch (err) {
    console.error("Error fetching cover letter by ID:", err);
    throw new Error("Failed to fetch cover letter");
  }
}
