"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/lib/useUserStore";
import ReactMarkdown from "react-markdown";
import DividerSm from "@/components/DividerSm";
import {
  AlertCircle,
  CheckCircle2,
  CircleFadingPlus,
  Lightbulb,
  LucideMessageCircleQuestion,
} from "lucide-react";

export default function JobMatchPage() {
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/signin");
      return;
    }

    const fetchMatch = async () => {
      try {
        const id = params.id as string;
        const response = await fetch(`/api/job-matching/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch job match");
        }

        const data = await response.json();
        setMatch(data.match);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [params, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center text-stone-100">Loading job match...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center text-stone-100">No job match found</div>
      </div>
    );
  }

  // Prefer explicit columns, fallback to ai_analysis for backward compatibility
  const matchScore = match.match_score ?? match.ai_analysis?.match_score;
  const strengths = match.strengths ?? match.ai_analysis?.strengths ?? [];
  const gaps = match.gaps ?? match.ai_analysis?.gaps ?? [];
  const suggestions = match.suggestions ?? match.ai_analysis?.suggestions ?? [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <main className="min-h-screen bg-stone-950 flex flex-col items-center py-8">
      <Card className="shadow-lg border-none bg-stone-950 backdrop-blur-sm w-full max-w-3xl">
        {/* Match Score Section */}
        <div className="py-4">
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
                    matchScore
                  )} transition-all duration-500 ease-in-out`}
                  strokeWidth="5"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * matchScore) / 100}
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
                  className={`text-4xl font-bold ${getScoreColor(matchScore)}`}
                >
                  {matchScore}%
                </span>
              </div>
            </div>
            <h3 className="text-lg font-light tracking-wider text-stone-100">
              Match Score
            </h3>
          </div>
        </div>

        {/* Strengths Section */}
        {strengths.length > 0 && (
          <div className="py-16">
            <h2 className="text-3xl tracking-wide text-blue-500 mb-12 text-center">
              <p className="mb-6">Strengths</p>
              <DividerSm />
            </h2>
            <ul className="list-disc list-inside space-y-2 text-stone-100">
              {strengths.map((item: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-stone-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gaps Section */}
        {gaps.length > 0 && (
          <div className="py-16">
            <h2 className="text-3xl tracking-wide text-blue-500 mb-12 text-center">
              <p className="mb-6">Gaps</p>
              <DividerSm />
            </h2>
            <ul className=" space-y-2 text-stone-100">
              {gaps.map((item: string, idx: number) => (
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
        {suggestions.length > 0 && (
          <div className="py-16">
            <h2 className="text-3xl tracking-wide text-blue-500 mb-12 text-center">
              <p className="mb-6">Suggestions</p>
              <DividerSm />
            </h2>
            <ul className=" space-y-2 text-stone-100">
              {suggestions.map((item: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-stone-300"
                >
                  <CircleFadingPlus className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-row justify-center gap-4 pb-8 pt-8">
          <Button
            variant="outline"
            className="cursor-pointer flex-1 bg-gradient-to-r from-stone-800/50 to-stone-900/50 hover:from-stone-800 hover:to-stone-900 text-stone-100 border border-stone-700 transition-all duration-200"
            onClick={() => router.push("/job-match")}
          >
            Match Another Job
          </Button>
          <Button
            variant="default"
            className="cursor-pointer flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-stone-100 shadow-md transition-all duration-200"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </main>
  );
}
