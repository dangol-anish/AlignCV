import { supabase } from "../database";
import { IResume } from "../api/interfaces/resume";

const RESUMES_TABLE = "resumes";

export async function getUserResumes(userId: string): Promise<IResume[]> {
  const { data, error } = await supabase
    .from(RESUMES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getResumeById(
  resumeId: string,
  userId: string
): Promise<IResume | null> {
  const { data, error } = await supabase
    .from(RESUMES_TABLE)
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function getResumeWithAnalysis(resumeId: string, userId: string) {
  // Fetch the resume
  const resume = await getResumeById(resumeId, userId);
  if (!resume) return null;
  // Fetch the analysis
  const { data: analysis, error } = await supabase
    .from("resume_analysis")
    .select("*")
    .eq("resume_id", resumeId)
    .order("analyzed_at", { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return { resume, analysis };
}

export async function getResumeAnalysesForUser(userId: string) {
  // Get all resumes for the user
  const { data: resumes, error: resumesError } = await supabase
    .from(RESUMES_TABLE)
    .select("id, original_filename, uploaded_at")
    .eq("user_id", userId);
  if (resumesError) throw resumesError;
  if (!resumes) return [];
  // For each resume, get all analyses
  const analyses = [];
  for (const resume of resumes) {
    const { data: analysisRows, error: analysisError } = await supabase
      .from("resume_analysis")
      .select("*")
      .eq("resume_id", resume.id)
      .order("analyzed_at", { ascending: false });
    if (analysisError) throw analysisError;
    analyses.push({
      resume_id: resume.id,
      resume_filename: resume.original_filename,
      uploaded_at: resume.uploaded_at,
      analyses: analysisRows || [],
    });
  }
  return analyses;
}
