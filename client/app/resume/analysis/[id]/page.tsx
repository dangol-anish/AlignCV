"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/lib/useUserStore";
import ReactMarkdown from "react-markdown";
import DividerSm from "@/components/DividerSm";
import { CheckCircle2, AlertCircle, Upload, FileText } from "lucide-react";

export default function ResumeAnalysisPage() {
  const params = useParams();
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center text-stone-100">Loading analysis...</div>
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

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center text-stone-100">No analysis found</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 flex flex-col items-center py-8">
      <Card className="shadow-lg border-none bg-stone-950 backdrop-blur-sm w-full max-w-3xl">
        {/* ATS Score Section */}
        {analysis.ats_score && (
          <div className="py-4 ">
            <h2 className="text-3xl tracking-wide text-blue-500 mb-12 text-center">
              <p className="mb-6">Analysis Overview</p>
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
                      analysis.ats_score.score
                    )} transition-all duration-500 ease-in-out`}
                    strokeWidth="5"
                    strokeDasharray="251.2"
                    strokeDashoffset={
                      251.2 - (251.2 * analysis.ats_score.score) / 100
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
                      analysis.ats_score.score
                    )}`}
                  >
                    {analysis.ats_score.score}%
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-light tracking-wider text-stone-100">
                ATS Readiness
              </h3>
            </div>
          </div>
        )}

        {/* Category Insights Section */}
        {analysis.category_insights && (
          <div className="py-16 ">
            <h2 className="text-3xl tracking-wide text-blue-500 mb-12 text-center">
              <p className="mb-6">Category Insights</p>
              <DividerSm />
            </h2>
            <div className="space-y-8">
              {Object.entries(analysis.category_insights).map(
                ([category, feedback]: [string, any]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-semibold tracking-wider text-stone-100">
                      {category}
                    </h3>
                    <ul className="space-y-2">
                      {(Array.isArray(feedback) ? feedback : []).map(
                        (point: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-stone-300"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Improvement Suggestions Section */}
        {analysis.line_improvements &&
          analysis.line_improvements.length > 0 && (
            <div className="py-12 ">
              <h2 className="text-3xl tracking-wide text-blue-500 mb-12 text-center">
                <p className="mb-6">Improvement Suggestions</p>
                <DividerSm />
              </h2>
              <div className="space-y-6">
                {analysis.line_improvements.map(
                  (improvement: any, index: number) => (
                    <div key={index} className="space-y-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <p className=" font-medium text-stone-100">
                          {improvement.issue}
                        </p>
                      </div>
                      <div className="ml-7 space-y-2">
                        <p className="text-sm text-stone-400 line-through">
                          {improvement.original}
                        </p>
                        <p className="text-sm font-medium text-green-400">
                          {improvement.suggestion}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {/* Action Buttons at the bottom */}
        <div className="flex flex-row justify-center gap-4  pb-8 pt-8">
          <Button
            variant="outline"
            className="cursor-pointer flex-1 bg-gradient-to-r from-stone-800/50 to-stone-900/50 hover:from-stone-800 hover:to-stone-900 text-stone-100 border border-stone-700 transition-all duration-200"
            onClick={() => router.push("/resume/analysis")}
          >
            Upload Another Resume
          </Button>
          <Button
            variant="default"
            className="cursor-pointer flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-stone-100 shadow-md transition-all duration-200"
            onClick={() => router.push("/dashboard")}
          >
            Resume Improvement
          </Button>
        </div>
      </Card>
    </main>
  );
}
