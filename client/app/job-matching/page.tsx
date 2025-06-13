"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/useUserStore";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchUserResumes } from "@/lib/api/resume";

export default function JobMatchingPage() {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const authLoading = useUserStore((state) => state.authLoading);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth?redirect=/job-matching");
      return;
    }
    if (!user) return;
    setLoading(true);
    fetchUserResumes(user.token)
      .then((resumes) => setResumes(resumes))
      .catch(async (e) => {
        let message = e.message;
        if (message === "AUTH_EXPIRED") {
          clearUser();
          setError("Your session has expired. Please sign in again.");
          return;
        }
        if (e.response) {
          try {
            const data = await e.response.json();
            message = data.message || JSON.stringify(data) || message;
          } catch {}
        }
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      if (!user) throw new Error("User not authenticated");
      const res = await fetch("/api/job-matching", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          resume_id: selectedResume,
          job_description: jobDescription,
        }),
      });
      if (!res.ok) {
        let msg = "Failed to match resume";
        try {
          const errJson = await res.json();
          msg = errJson.message || msg;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      setResult(data.result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Job Matching</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Select Resume</label>
          <select
            className="w-full border rounded p-2"
            value={selectedResume}
            onChange={(e) => setSelectedResume(e.target.value)}
            required
          >
            <option value="">-- Select a resume --</option>
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.original_filename}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">
            Paste Job Description
          </label>
          <textarea
            className="w-full border rounded p-2"
            rows={8}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !selectedResume || !jobDescription}
        >
          {loading ? "Matching..." : "Match Resume to Job"}
        </Button>
      </form>
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {result && (
        <Card className="mt-8 p-4">
          <h2 className="text-lg font-bold mb-2">AI Job Match Analysis</h2>
          <div className="mb-2">
            <strong>Match Score:</strong> {result.ai_analysis.match_score}
          </div>
          <div className="mb-2">
            <strong>Strengths:</strong>
            <ul className="list-disc ml-6">
              {result.ai_analysis.strengths.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="mb-2">
            <strong>Gaps:</strong>
            <ul className="list-disc ml-6">
              {result.ai_analysis.gaps.map((g: string, i: number) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>
          <div className="mb-2">
            <strong>Suggestions:</strong>
            <ul className="list-disc ml-6">
              {result.ai_analysis.suggestions.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
