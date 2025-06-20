"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/useUserStore";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchUserResumes } from "@/lib/api/resume";
import { toast } from "sonner";
import DividerSm from "@/components/DividerSm";
import {
  CheckCircle2,
  AlertCircle,
  CircleFadingPlus,
  ArrowLeft,
} from "lucide-react";

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
}

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
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Only authenticated users can use this feature.");
      router.replace("/auth/signin?redirect=/job-match");
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
          company_name: companyName,
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

  const handleBackToForm = () => {
    setResult(null);
  };

  if (authLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="">
      {result ? (
        <main className="min-h-screen bg-stone-950 flex flex-col items-center py-4">
          <Card className="shadow-lg border-none bg-stone-950 backdrop-blur-sm w-full max-w-3xl relative">
            <div className="">
              <button
                onClick={handleBackToForm}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors duration-200 px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                type="button"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <h2 className="text-3xl tracking-wide text-blue-500 mb-12 text-center">
                <p className="mb-6">Job Match Overview</p>
                <DividerSm />
              </h2>

              <div className="flex flex-col items-center justify-center mb-3">
                <div className="relative mb-4">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-stone-800"
                      strokeWidth="5"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className={`${getScoreColor(
                        result.ai_analysis.match_score
                      )} transition-all duration-500 ease-in-out`}
                      strokeWidth="5"
                      strokeDasharray="251.2"
                      strokeDashoffset={
                        251.2 - (251.2 * result.ai_analysis.match_score) / 100
                      }
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={`text-4xl font-bold ${getScoreColor(
                        result.ai_analysis.match_score
                      )}`}
                    >
                      {result.ai_analysis.match_score}%
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-light tracking-wider text-stone-100">
                  Match Score
                </h3>
              </div>
            </div>
            {/* Strengths Section */}
            {result.ai_analysis.strengths.length > 0 && (
              <div className="py-16">
                <h2 className="text-3xl tracking-wide text-blue-500 mb-12 text-center">
                  <p className="mb-6">Strengths</p>
                  <DividerSm />
                </h2>
                <ul className="list-disc list-inside space-y-2 text-stone-100">
                  {result.ai_analysis.strengths.map(
                    (item: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-stone-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
            {/* Gaps Section */}
            {result.ai_analysis.gaps.length > 0 && (
              <div className="py-16">
                <h2 className="text-3xl tracking-wide text-blue-500 mb-12 text-center">
                  <p className="mb-6">Gaps</p>
                  <DividerSm />
                </h2>
                <ul className="space-y-2 text-stone-100">
                  {result.ai_analysis.gaps.map((item: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-stone-300"
                    >
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Suggestions Section */}
            {result.ai_analysis.suggestions.length > 0 && (
              <div className="py-16">
                <h2 className="text-3xl tracking-wide text-blue-500 mb-12 text-center">
                  <p className="mb-6">Suggestions</p>
                  <DividerSm />
                </h2>
                <ul className="space-y-2 text-stone-100">
                  {result.ai_analysis.suggestions.map(
                    (item: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-stone-300 "
                      >
                        <CircleFadingPlus className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </Card>
        </main>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-3xl tracking-wide text-blue-500 mb-20 text-center">
            <p className="mb-6">Match job descriptions with your resume</p>
            <DividerSm />
          </h2>

          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex-1">
              <label className="block mb-1 font-medium text-stone-200">
                Company Name
              </label>
              <Input
                className="w-full rounded-md border border-stone-700 bg-stone-900/70 text-stone-100 placeholder:text-stone-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 px-4 transition-colors"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Google"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium text-stone-200">
                Select Resume
              </label>
              <select
                className="w-full rounded-md border border-stone-700 bg-stone-900/70 text-stone-100 placeholder:text-stone-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 p-2 px-4 transition-colors"
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                required
              >
                <option value="" className="text-stone-400 bg-stone-900">
                  -- Select a resume --
                </option>
                {resumes.map((resume) => (
                  <option
                    key={resume.id}
                    value={resume.id}
                    className="text-stone-100 bg-stone-900"
                  >
                    {resume.original_filename}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium text-stone-200">
              Paste Job Description
            </label>
            <textarea
              className="w-full rounded-md border border-stone-700 bg-stone-900/70 text-stone-100 placeholder:text-stone-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 p-2 transition-colors"
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md shadow-md transition-all duration-200 font-light cursor-pointer"
            disabled={
              loading || !selectedResume || !jobDescription || !companyName
            }
          >
            {loading ? "Matching..." : "Match Resume to Job"}
          </Button>
        </form>
      )}
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </div>
  );
}
