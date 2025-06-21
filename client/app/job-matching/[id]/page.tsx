"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/lib/useUserStore";
import ReactMarkdown from "react-markdown";

export default function JobMatchPage() {
  const params = useParams();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const authLoading = useUserStore((state) => state.authLoading);

  useEffect(() => {
    // Wait for authentication to complete before checking user state
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace("/auth/signin");
      return;
    }

    const fetchMatch = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/job-matching/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("[Job Match Page] Error response:", {
            status: response.status,
            data: errorData,
          });
          throw new Error(errorData.message || "Failed to fetch job match");
        }

        const data = await response.json();

        setMatch(data.match);
      } catch (err: any) {
        console.error("[Job Match Page] Error:", {
          message: err.message,
          stack: err.stack,
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [params.id, user, router, authLoading]);

  // Show loading while authentication is being determined
  if (authLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading job match...</div>
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

  if (!match) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">No job match found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job Match Details</h1>
          <p className="text-muted-foreground mt-1">
            Matched on {new Date(match.created_at).toLocaleString()}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Dashboard
        </Button>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Match Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg">
                {match.ai_analysis?.match_score || "N/A"}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{match.job_description}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {match.ai_analysis?.strengths?.map(
                (strength: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-1">
                      {index + 1}
                    </Badge>
                    <p>{strength}</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {match.ai_analysis?.gaps?.map((gap: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-1">
                    {index + 1}
                  </Badge>
                  <p>{gap}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {match.ai_analysis?.suggestions?.map(
                (suggestion: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-1">
                      {index + 1}
                    </Badge>
                    <p>{suggestion}</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
