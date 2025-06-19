"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/lib/useUserStore";
import ReactMarkdown from "react-markdown";

export default function JobMatchPage({ params }: { params: { id: string } }) {
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/signin");
      return;
    }

    const fetchMatch = async () => {
      try {
        console.log("[Job Match Page] Fetching match for ID:", params.id);
        const response = await fetch(`/api/job-matching/${params.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("[Job Match Page] Error response:", {
            status: response.status,
            data: errorData,
          });
          throw new Error(errorData.message || "Failed to fetch job match");
        }

        const data = await response.json();
        console.log("[Job Match Page] Received data:", data);
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
  }, [params.id, user, router]);

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
            {match.job_title} at {match.company_name}
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
                {match.match_score}%
              </Badge>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{match.match_explanation}</ReactMarkdown>
              </div>
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
            <CardTitle>Key Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {match.requirements?.map((req: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-1">
                    {index + 1}
                  </Badge>
                  <p>{req}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {match.skills_match?.map((skill: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <Badge
                    variant={skill.matched ? "default" : "outline"}
                    className="min-w-[100px]"
                  >
                    {skill.name}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {skill.matched
                      ? "Found in your resume"
                      : "Not found in your resume"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {match.experience_match?.map((exp: any, index: number) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <h3 className="font-semibold mb-2">{exp.requirement}</h3>
                  <p className="text-sm text-muted-foreground">
                    {exp.matched
                      ? "Your experience matches this requirement"
                      : "Your experience may not fully match this requirement"}
                  </p>
                  {exp.suggestion && (
                    <p className="text-sm text-green-600 mt-2">
                      {exp.suggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
