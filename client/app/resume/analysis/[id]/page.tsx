"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/lib/useUserStore";
import ReactMarkdown from "react-markdown";

export default function ResumeAnalysisPage({
  params,
}: {
  params: { id: string };
}) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/signin");
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/resumes/analyses/${params.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch analysis");
        }

        const data = await response.json();
        setAnalysis(data.analysis);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [params.id, user, router]);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading analysis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">No analysis found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Resume Analysis</h1>
          <p className="text-muted-foreground mt-1">
            {analysis.resume_filename}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Dashboard
        </Button>
      </div>

      <div className="space-y-8">
        {analysis.ats_score && (
          <Card>
            <CardHeader>
              <CardTitle>ATS Readiness Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg">
                  {analysis.ats_score.score}%
                </Badge>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>
                    {analysis.ats_score.explanation}
                  </ReactMarkdown>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {analysis.category_insights && (
          <Card>
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(analysis.category_insights).map(
                  ([category, feedback]: [string, any]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold mb-2">{category}</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {(Array.isArray(feedback) ? feedback : []).map(
                          (point: string, index: number) => (
                            <li key={index}>{point}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {analysis.line_improvements &&
          analysis.line_improvements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Line-by-Line Improvements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analysis.line_improvements.map(
                    (improvement: any, index: number) => (
                      <div key={index} className="border-b pb-4 last:border-0">
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Issue:</strong> {improvement.issue}
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm line-through text-red-600">
                            {improvement.original}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            {improvement.suggestion}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
