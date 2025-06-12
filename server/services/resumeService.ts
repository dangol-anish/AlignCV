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
