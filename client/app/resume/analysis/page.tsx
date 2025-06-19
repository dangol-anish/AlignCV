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
    <>
      <main className="min-h-screen bg-stone-950">
        <Card className="shadow-lg border-none bg-stone-950 backdrop-blur-sm">
          {/* ATS Score Section */}
          {atsScore && (
            <div className="py-12">
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
                        atsScore.score
                      )} transition-all duration-500 ease-in-out`}
                      strokeWidth="5"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * atsScore.score) / 100}
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
                <ReactMarkdown>{atsScore.feedback?.[0] || ""}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Category Insights Section */}
          {categoryInsights && (
            <div className="py-12">
              <h2 className="text-3xl tracking-wide text-blue-500 mb-12 text-center">
                <p className="mb-6">Category Insights</p>
                <DividerSm />
              </h2>
              <div className="space-y-8">
                {Object.entries(categoryInsights).map(
                  ([category, feedback]: [string, string[]]) => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-lg font-semibold tracking-wider text-stone-100">
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
          )}

          {/* Improvement Suggestions Section */}
          {resumeImprovements && resumeImprovements.length > 0 && (
            <div className="py-12">
              <h2 className="text-3xl tracking-wide text-blue-500 mb-12 text-center">
                <p className="mb-6">Improvement Suggestions</p>
                <DividerSm />
              </h2>
              <div className="space-y-6">
                {resumeImprovements.map(
                  ({ original, issue, suggestion }, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <p className=" font-medium text-stone-100">{issue}</p>
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button
              className="cursor-pointer flex-1 bg-gradient-to-r from-stone-800/50 to-stone-900/50 hover:from-stone-800 hover:to-stone-900 text-stone-100 border border-stone-700 transition-all duration-200"
              onClick={() => {
                clearResults();
                router.push("/");
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Another Resume
            </Button>
            <Button
              className="cursor-pointer flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-stone-100 shadow-md transition-all duration-200"
              onClick={() => {
                if (!user) {
                  router.push("/auth/signin?redirect=/resume/templates");
                } else {
                  router.push("/resume/templates");
                }
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Apply Improvements
            </Button>
          </div>
        </Card>
        <ResponsiveToaster />
      </main>
    </>
  );
}
