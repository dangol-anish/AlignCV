"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/lib/useUserStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [coverLetters, setCoverLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, clearUser } = useUserStore();
  const authLoading = useUserStore((state) => state.authLoading);
  const searchParams = useSearchParams();
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
      return;
    }
    // Show toast on successful sign in
    if (searchParams.get("signin") === "1" && !toastShownRef.current) {
      toast.success("Signed in successfully!");
      toastShownRef.current = true;
    }
  }, [authLoading, user, router, searchParams]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    // Fetch resume analyses, job matches, and cover letters
    Promise.all([
      fetch("/api/resumes/analyses", {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then((res) => res.json()),
      fetch("/api/job-matching", {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then((res) => res.json()),
      fetch("/api/cover-letter", {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then((res) => res.json()),
    ])
      .then(([analysesData, jobMatchesData, coverLettersData]) => {
        if (!analysesData.success) {
          throw new Error(analysesData.message || "Failed to fetch analyses");
        }
        if (!jobMatchesData.success) {
          throw new Error(
            jobMatchesData.message || "Failed to fetch job matches"
          );
        }
        if (!coverLettersData.success) {
          throw new Error(
            coverLettersData.message || "Failed to fetch cover letters"
          );
        }
        setAnalyses(analysesData.results || []);
        setJobMatches(jobMatchesData.matches || []);
        setCoverLetters(coverLettersData.results || []);
      })
      .catch((e) => {
        console.error("Error fetching data:", {
          message: e.message,
          stack: e.stack,
        });
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      clearUser();
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">
            Please wait while we check your authentication.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">
            Loading your results...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we fetch your resume analyses, job matches, and
            cover letters.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Flatten all improvements from all analyses
  const allImprovements = analyses.flatMap((item) =>
    item.analyses.flatMap((analysis: any) => ({
      ...analysis,
      resume_filename: item.resume_filename,
      resume_id: item.resume_id,
    }))
  );

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.email}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="space-y-8">
        {/* Resume Analyses Section */}
        <Card>
          <CardHeader>
            <CardTitle>Resume Improvements</CardTitle>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No resume analyses found. Upload a resume to get started.
              </div>
            ) : (
              <div className="space-y-6">
                {analyses.map((resume: any) => {
                  // Get the latest analysis
                  const latestAnalysis = resume.analyses?.[0];
                  if (!latestAnalysis) return null;

                  return (
                    <Card key={resume.resume_id} className="overflow-hidden">
                      <CardHeader className="bg-muted/50">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">
                              {resume.resume_filename}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Analyzed on{" "}
                              {new Date(
                                latestAnalysis.analyzed_at
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-sm">
                              ATS Score:{" "}
                              {latestAnalysis.ats_score?.score || "N/A"}
                            </Badge>
                            <Button
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/resume/analysis/${resume.resume_id}`
                                )
                              }
                            >
                              View Full Analysis
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {latestAnalysis.category_insights && (
                            <div className="text-sm">
                              <h4 className="font-semibold mb-2">
                                Key Insights:
                              </h4>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {Object.entries(
                                  latestAnalysis.category_insights
                                )
                                  .slice(0, 3)
                                  .map(([category, points]: [string, any]) => (
                                    <li key={category} className="line-clamp-1">
                                      {category}: {points[0]}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                          {latestAnalysis.line_improvements && (
                            <div className="text-sm">
                              <h4 className="font-semibold mb-2">
                                Top Improvements:
                              </h4>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {latestAnalysis.line_improvements
                                  .slice(0, 3)
                                  .map((imp: any, index: number) => (
                                    <li key={index} className="line-clamp-1">
                                      {imp.suggestion}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Matches Section */}
        <Card>
          <CardHeader>
            <CardTitle>Job Matches</CardTitle>
          </CardHeader>
          <CardContent>
            {jobMatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No job matches found. Try matching your resume with a job
                description.
              </div>
            ) : (
              <div className="space-y-6">
                {jobMatches.map((match: any) => (
                  <Card key={match.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg">
                            {match.resume_filename}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Matched on{" "}
                            {new Date(match.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-sm">
                          Match Score: {match.ai_analysis?.match_score || "N/A"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">
                            Job Description
                          </h3>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {match.job_description}
                          </p>
                        </div>
                        <Separator />
                        <div>
                          <h3 className="font-semibold mb-2">Analysis</h3>
                          <div className="space-y-4">
                            {match.ai_analysis?.suggestions?.map(
                              (suggestion: string, i: number) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-green-600">•</span>
                                  <p className="text-sm">{suggestion}</p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardHeader className="bg-muted/50">
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.push(`/job-matching/${match.id}`)
                          }
                        >
                          View Full Match
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cover Letters Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cover Letters</CardTitle>
            <Button
              variant="outline"
              onClick={() => router.push("/cover-letter")}
            >
              Generate New
            </Button>
          </CardHeader>
          <CardContent>
            {coverLetters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No cover letters found. Generate a cover letter to get started.
              </div>
            ) : (
              <div className="space-y-6">
                {coverLetters.map((letter: any) => (
                  <Card key={letter.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {letter.job_title || "Untitled Cover Letter"}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              Generated on{" "}
                              {new Date(letter.created_at).toLocaleString()}
                            </span>
                            {letter.resume_filename && (
                              <>
                                <span>•</span>
                                <span>Based on: {letter.resume_filename}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                letter.cover_letter
                              );
                              toast.success("Cover letter copied to clipboard");
                            }}
                          >
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              router.push(`/cover-letter/${letter.id}`)
                            }
                          >
                            View Full Letter
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground line-clamp-3">
                        {letter.cover_letter}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
