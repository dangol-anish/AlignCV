"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/lib/useUserStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const router = useRouter();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authLoading = useUserStore((state) => state.authLoading);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
      return;
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    // Fetch both resume analyses and job matches
    Promise.all([
      fetch("/api/resumes/analyses", {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then((res) => res.json()),
      fetch("/api/job-matching", {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then((res) => res.json()),
    ])
      .then(([analysesData, jobMatchesData]) => {
        if (!analysesData.success) {
          throw new Error(analysesData.message || "Failed to fetch analyses");
        }
        if (!jobMatchesData.success) {
          throw new Error(
            jobMatchesData.message || "Failed to fetch job matches"
          );
        }
        setAnalyses(analysesData.results || []);
        setJobMatches(jobMatchesData.results || []);
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
            Please wait while we fetch your resume analyses and job matches.
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
                {analyses.map((analysis: any) => (
                  <Card key={analysis.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg">
                            {analysis.resume_filename}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Analyzed on{" "}
                            {new Date(analysis.analyzed_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-sm">
                            ATS Score: {analysis.ats_score?.score}
                          </Badge>
                          <Button
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/resume/analysis?id=${analysis.resume_id}`
                              )
                            }
                          >
                            View Full Analysis
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-2">
                            Category Insights
                          </h3>
                          <ScrollArea className="h-[200px] pr-4">
                            {analysis.category_insights &&
                              Object.entries(analysis.category_insights).map(
                                ([cat, points]) => (
                                  <div key={cat} className="mb-4">
                                    <h4 className="font-medium text-sm mb-1">
                                      {cat}
                                    </h4>
                                    <ul className="space-y-1">
                                      {(points as string[]).map((p, i) => (
                                        <li
                                          key={i}
                                          className="text-sm text-muted-foreground"
                                        >
                                          • {p}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )
                              )}
                          </ScrollArea>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">
                            Line Improvements
                          </h3>
                          <ScrollArea className="h-[200px] pr-4">
                            <div className="space-y-4">
                              {analysis.line_improvements?.map(
                                (imp: any, i: number) => (
                                  <div key={i} className="space-y-2">
                                    <p className="text-sm italic text-muted-foreground">
                                      "{imp.original}"
                                    </p>
                                    <div className="space-y-1">
                                      <p className="text-sm">
                                        <span className="font-medium">
                                          Issue:
                                        </span>{" "}
                                        {imp.issue}
                                      </p>
                                      <p className="text-sm text-green-700">
                                        <span className="font-medium">
                                          Suggestion:
                                        </span>{" "}
                                        {imp.suggestion}
                                      </p>
                                    </div>
                                    {i <
                                      analysis.line_improvements.length - 1 && (
                                      <Separator className="my-2" />
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
