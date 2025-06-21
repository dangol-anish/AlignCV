import { IResume } from "@/types/resume";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchUserResumes(token: string): Promise<IResume[]> {
  const res = await fetch(`${API_BASE_URL}/api/resumes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    throw new Error("AUTH_EXPIRED");
  }
  if (!res.ok) throw new Error("Failed to fetch resumes");
  const data = await res.json();
  return data.resumes;
}

export async function fetchResumeById(
  token: string,
  id: string
): Promise<IResume> {
  const res = await fetch(`${API_BASE_URL}/api/resumes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch resume");
  const data = await res.json();
  return data.resume;
}

export async function referenceResumeForFeature(
  token: string,
  resume_id: string
) {
  const res = await fetch(`${API_BASE_URL}/api/resumes/reference`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ resume_id }),
  });
  if (!res.ok) throw new Error("Failed to reference resume");
  return await res.json();
}
