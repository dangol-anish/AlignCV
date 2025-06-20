export interface IJobMatchingResult {
  id: string;
  user_id: string;
  resume_id: string;
  job_description: string;
  company_name?: string;
  ai_analysis: {
    job_title?: string;
    match_score: number;
    strengths: string[];
    gaps: string[];
    suggestions: string[];
  };
  job_title?: string;
  match_score?: number;
  strengths?: string[];
  gaps?: string[];
  suggestions?: string[];
  created_at: string;
}
