"use client";
import {
  AtsScoreType,
  CategoryInsights,
  DynamicResumeSections,
} from "@/types/resume";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResumeAnalysisStore } from "@/lib/useResumeAnalysisStore";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { useUserStore } from "@/lib/useUserStore";
import { supabase } from "@/lib/supabaseClient";
import { fetchUserResumes } from "@/lib/api/resume";
import type { IResume } from "../types/resume";
import ResumeAnalysisResult from "@/components/ResumeAnalysisResult";

interface ResumeImprovement {
  original: string;
  issue: string;
  suggestion: string;
}

function ResponsiveToaster() {
  const [position, setPosition] = useState<any>("top-right");
  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 640) {
        setPosition("top");
      } else {
        setPosition("top-right");
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return <Toaster richColors position={position} />;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [parsedData, setParsedData] = useState<DynamicResumeSections | null>(
    null
  );
  const [atsScore, setAtsScore] = useState<AtsScoreType>(null);
  const [categoryInsights, setCategoryInsights] =
    useState<CategoryInsights | null>(null);
  const [resumeImprovements, setResumeImprovements] = useState<
    ResumeImprovement[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setResults = useResumeAnalysisStore((state) => state.setResults);
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  // New: For picking and analyzing stored resumes
  const [userResumes, setUserResumes] = useState<IResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    fetchUserResumes(user.token)
      .then(setUserResumes)
      .catch(() => setUserResumes([]));
  }, [user]);

  // Unified handler for analyze/upload
  async function handleAnalyzeOrUpload(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage("File size exceeds 2MB limit");
        return;
      }
      setMessage("");
      setExtractedText("");
      setParsedData(null);
      setAtsScore(null);
      setCategoryInsights(null);
      setResumeImprovements([]);
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        // If user is authenticated, include auth token
        const headers: HeadersInit = {};
        if (user) {
          headers.Authorization = `Bearer ${user.token}`;
        }

        // First analyze the resume
        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers,
          body: formData,
        });

        if (!analyzeRes.ok) {
          const errorData = await analyzeRes.json();
          throw new Error(errorData.message || "Analysis failed");
        }

        const analyzeData = await analyzeRes.json();

        // If user is authenticated, store the resume
        if (user) {
          const storeRes = await fetch("/api/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
            body: formData,
          });

          if (!storeRes.ok) {
            const errorData = await storeRes.json();
            throw new Error(errorData.message || "Failed to store resume");
          }
        }

        // Set results and redirect
        setResults({
          extractedText: "",
          parsedData: analyzeData?.parsed,
          atsScore: analyzeData?.atsScore ?? null,
          categoryInsights: analyzeData?.categoryInsights ?? null,
          resumeImprovements: analyzeData?.lineImprovements ?? [],
        });

        setMessage("Resume analyzed successfully!");
        router.push("/resume/analysis");
      } catch (error: any) {
        console.error("Error:", error);
        setMessage(error.message || "An unknown error occurred");
        toast.error(error.message || "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    } else if (selectedResumeId) {
      if (!user) {
        setAnalyzeError("You must be signed in to analyze stored resumes.");
        return;
      }
      setAnalyzeLoading(true);
      setAnalyzeError(null);
      setAnalyzeResult(null);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ resume_id: selectedResumeId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAnalyzeError(data.message || "Failed to analyze resume");
          setAnalyzeLoading(false);
          return;
        }
        setAnalyzeResult({
          extractedText: "",
          parsedData: data?.parsed,
          atsScore: data?.atsScore ?? null,
          categoryInsights: data?.categoryInsights ?? null,
          resumeImprovements: data?.lineImprovements ?? [],
        });
      } catch (e: any) {
        setAnalyzeError(e.message);
      } finally {
        setAnalyzeLoading(false);
      }
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-muted px-2">
      {/* User sign-in status indicator and logout button */}
      <div className="mb-4 w-full max-w-lg flex items-center justify-end gap-2 text-xs text-gray-600">
        {user ? (
          <>
            <span>
              Signed in as{" "}
              <span className="font-semibold">{user.email || "User"}</span>
            </span>
            <button
              className="ml-2 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs font-medium"
              onClick={async () => {
                await supabase.auth.signOut();
                clearUser();
                toast.success("Signed out successfully");
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>Not signed in</>
        )}
      </div>
      <Card className="w-full max-w-lg shadow-md border-none bg-white/90 mb-8">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            Resume Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user && (
            <div className="mb-6">
              <div className="mb-2 font-semibold">
                Analyze a stored resume or upload a new one:
              </div>
              <div className="flex gap-2 items-center">
                <select
                  className="border rounded px-2 py-1"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  disabled={analyzeLoading || isLoading}
                >
                  <option value="">Select a resume</option>
                  {userResumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.original_filename} (
                      {new Date(resume.uploaded_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.rtf"
                  disabled={isLoading || analyzeLoading}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
                  style={{ maxWidth: 180 }}
                />
                <Button
                  onClick={handleAnalyzeOrUpload}
                  disabled={
                    isLoading || analyzeLoading || (!file && !selectedResumeId)
                  }
                >
                  {isLoading || analyzeLoading
                    ? "Processing..."
                    : file
                    ? "Upload & Analyze"
                    : "Analyze"}
                </Button>
              </div>
              {analyzeError && (
                <div className="text-red-600 mt-2">{analyzeError}</div>
              )}
              {analyzeResult && (
                <ResumeAnalysisResult
                  atsScore={analyzeResult.atsScore}
                  categoryInsights={analyzeResult.categoryInsights}
                  resumeImprovements={analyzeResult.resumeImprovements}
                  extractedText={analyzeResult.extractedText}
                  parsedData={analyzeResult.parsedData}
                  user={user}
                />
              )}
            </div>
          )}
          {!user && (
            <div className="mb-6">
              <div className="mb-2 font-semibold">
                Upload a resume to analyze:
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.rtf"
                  disabled={isLoading || analyzeLoading}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
                  style={{ maxWidth: 180 }}
                />
                <Button
                  onClick={handleAnalyzeOrUpload}
                  disabled={isLoading || analyzeLoading || !file}
                >
                  {isLoading ? "Processing..." : "Upload & Analyze"}
                </Button>
              </div>
              {analyzeError && (
                <div className="text-red-600 mt-2">{analyzeError}</div>
              )}
              {analyzeResult && (
                <ResumeAnalysisResult
                  atsScore={analyzeResult.atsScore}
                  categoryInsights={analyzeResult.categoryInsights}
                  resumeImprovements={analyzeResult.resumeImprovements}
                  extractedText={analyzeResult.extractedText}
                  parsedData={analyzeResult.parsedData}
                  user={user}
                />
              )}
            </div>
          )}
          <div className="flex flex-col items-center gap-2 mt-6">
            <span className="text-xs text-muted-foreground">or</span>
            <GoogleSignInButton />
          </div>
          {message && (
            <p
              className={`mt-4 text-center text-sm ${
                message.startsWith("Upload error")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
          {isLoading && (
            <p className="mt-4 text-blue-600 font-semibold text-center">
              Processing your file...
            </p>
          )}
        </CardContent>
      </Card>
      <ResponsiveToaster />
    </main>
  );
}
