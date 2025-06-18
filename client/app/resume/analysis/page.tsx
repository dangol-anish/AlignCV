"use client";
import React, { useEffect } from "react";
import { useResumeAnalysisStore } from "@/lib/useResumeAnalysisStore";
import { useUserStore } from "@/lib/useUserStore";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Upload,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Divider from "@/components/Divider";
import DividerSm from "@/components/DividerSm";

function ResponsiveToaster() {
  const [position, setPosition] = React.useState<any>("top-right");
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

export default function ResumeAnalysisPage() {
  const {
    extractedText,
    parsedData,
    atsScore,
    categoryInsights,
    resumeImprovements,
    clearResults,
  } = useResumeAnalysisStore();
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  // Redirect to home if no results
  useEffect(() => {
    if (
      !extractedText &&
      !parsedData &&
      !atsScore &&
      !categoryInsights &&
      resumeImprovements.length === 0
    ) {
      router.replace("/");
    }
  }, [
    extractedText,
    parsedData,
    atsScore,
    categoryInsights,
    resumeImprovements,
    router,
  ]);

  useEffect(() => {
    if (
      extractedText &&
      parsedData &&
      atsScore &&
      categoryInsights &&
      resumeImprovements.length > 0
    ) {
      useResumeAnalysisStore.getState().setResults({
        extractedText,
        parsedData,
        atsScore,
        categoryInsights,
        resumeImprovements,
      });
    }
  }, [
    extractedText,
    parsedData,
    atsScore,
    categoryInsights,
    resumeImprovements,
  ]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <main className="min-h-screen bg-stone-950 ">
      <div className=" space-y-8">
        <Card className="shadow-lg border-none bg-stone-950 backdrop-blur-sm">
          <CardHeader className=" pb-6">
            <CardTitle className="text-3xl font-light tracking-tight text-center text-stone-100">
              Resume Analysis Results
            </CardTitle>
            <DividerSm />
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <div className="rounded-xl bg-stone-900/50 p-6 shadow-sm border border-stone-800">
              <h2 className="text-xl tracking-wide text-blue-500 mb-6">
                Analysis Overview
              </h2>
              <div className="grid gap-6">
                {/* ATS Score Card */}
                {atsScore && (
                  <div className="rounded-lg p-4 ">
                    <div className="flex flex-col items-center justify-center mb-3">
                      <div className="relative  mb-4">
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
                              atsScore.score
                            )} transition-all duration-500 ease-in-out`}
                            strokeWidth="5"
                            strokeDasharray="251.2"
                            strokeDashoffset={
                              251.2 - (251.2 * atsScore.score) / 100
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
                              atsScore.score
                            )}`}
                          >
                            {atsScore.score}%
                          </span>
                        </div>
                      </div>
                      <h3 className="text-lg font-light tracking-wider text-stone-100">
                        ATS Readiness
                      </h3>
                    </div>
                    <div className="prose prose-sm text-stone-300 max-w-none">
                      <ReactMarkdown>
                        {atsScore.feedback?.[0] || ""}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Category Analysis Cards */}
                {categoryInsights &&
                  Object.entries(categoryInsights).map(
                    ([category, feedback]: [string, string[]]) => (
                      <div
                        key={category}
                        className="rounded-lg p-4 bg-stone-800/30"
                      >
                        <h3 className="text-lg font-semibold text-stone-100 mb-3">
                          {category}
                        </h3>
                        <ul className="space-y-2">
                          {feedback.map((point: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-stone-300"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
              </div>
            </div>

            {resumeImprovements && resumeImprovements.length > 0 && (
              <div className="rounded-xl bg-stone-900/50 p-6 shadow-sm border border-stone-800">
                <h2 className="text-xl font-semibold text-stone-100 mb-6">
                  Improvement Suggestions
                </h2>
                <div className="space-y-6">
                  {resumeImprovements.map(
                    ({ original, issue, suggestion }, idx) => (
                      <div key={idx} className="bg-stone-800/50 rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                          <p className="text-sm font-medium text-stone-100">
                            {issue}
                          </p>
                        </div>
                        <div className="ml-7 space-y-2">
                          <p className="text-sm text-stone-400 line-through">
                            {original}
                          </p>
                          <p className="text-sm font-medium text-green-400">
                            {suggestion}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-100 shadow-md transition-all duration-200"
                onClick={() => {
                  if (!user) {
                    router.push("/auth?redirect=/resume/templates");
                  } else {
                    router.push("/resume/templates");
                  }
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                View Resume Templates
              </Button>
              <Button
                className="flex-1 bg-stone-800/50 hover:bg-stone-800 text-stone-100 border border-stone-700 transition-all duration-200"
                onClick={() => {
                  clearResults();
                  router.push("/");
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Another Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <ResponsiveToaster />
    </main>
  );
}
