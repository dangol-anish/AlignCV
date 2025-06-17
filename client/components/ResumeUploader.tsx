"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, FileText, ChevronDown, X } from "lucide-react";
import { useUserStore } from "@/lib/useUserStore";
import type { IResume } from "@/types/resume";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AnalysisResult {
  extractedText: string;
  parsedData: any;
  atsScore: any;
  categoryInsights: any;
  resumeImprovements: any[];
}

interface ResumeUploaderProps {
  file: File | null;
  setFile: (file: File | null) => void;
  message: string;
  isLoading: boolean;
  selectedResumeId: string;
  setSelectedResumeId: (id: string) => void;
  analyzeLoading: boolean;
  analyzeError: string | null;
  analyzeResult: AnalysisResult | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAnalyzeOrUpload: (
    e?: React.FormEvent,
    resumeId?: string
  ) => Promise<void>;
  userResumes: IResume[];
}

export default function ResumeUploader({
  file,
  setFile,
  message,
  isLoading,
  selectedResumeId,
  setSelectedResumeId,
  analyzeLoading,
  analyzeError,
  analyzeResult,
  handleFileChange,
  handleAnalyzeOrUpload,
  userResumes,
}: ResumeUploaderProps) {
  const user = useUserStore((state) => state.user);

  const resetAnalysis = () => {
    setFile(null);
    setSelectedResumeId("");
  };

  const handleStoredResumeSelect = async (resumeId: string) => {
    try {
      setSelectedResumeId(resumeId);
      setFile(null);
      // Ensure we have a user token
      if (!user?.token) {
        toast.error("Please sign in to analyze stored resumes");
        return;
      }
      // Call the analysis function with the resumeId directly
      await handleAnalyzeOrUpload(undefined, resumeId);
    } catch (error) {
      console.error("Error selecting stored resume:", error);
      toast.error("Failed to analyze stored resume");
    }
  };

  return (
    <Card className="bg-stone-950 border-2 border-dashed border-stone-700 transition-colors duration-200 group hover:border-blue-500 hover:bg-blue-950/20">
      <CardContent className="">
        {!analyzeResult ? (
          <label className="cursor-pointer w-full h-full flex flex-col gap-6 pt-6">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading || analyzeLoading}
            />
            <div className="flex flex-col gap-3 items-center justify-center text-center">
              {isLoading || analyzeLoading ? (
                <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-3" />
              ) : (
                <>
                  <Upload className="w-16 h-16 text-blue-500 group-hover:text-blue-400 transition-colors duration-200 mb-3" />
                  <h3 className="text-xl text-stone-100">
                    Drop your resume here
                  </h3>
                  <p className="text-stone-400 ">or click to browse</p>
                  <p className="text-sm text-stone-400">
                    Supports PDF, DOC, DOCX, PNG, JPEG
                  </p>
                </>
              )}
            </div>

            {user && !isLoading && !analyzeLoading && (
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white border-none transition-colors duration-200"
                      disabled={analyzeLoading}
                    >
                      Select Stored Resume
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    className="w-[280px] bg-stone-800 border-stone-700"
                  >
                    {userResumes.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-stone-400 text-sm">
                          No stored resumes found
                        </p>
                      </div>
                    ) : (
                      <>
                        <DropdownMenuLabel className="text-stone-400 text-xs font-normal px-2">
                          Your stored resumes
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-stone-700" />
                        {userResumes.map((resume) => (
                          <DropdownMenuItem
                            key={resume.id}
                            className="text-stone-100 hover:bg-stone-700 cursor-pointer focus:bg-stone-700 transition-colors duration-150"
                            onClick={() => handleStoredResumeSelect(resume.id)}
                          >
                            <div className="flex flex-col w-full">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-stone-400" />
                                <span className="font-medium truncate">
                                  {resume.original_filename}
                                </span>
                              </div>
                              <span className="text-xs text-stone-400 mt-0.5">
                                {new Date(
                                  resume.uploaded_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </label>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-stone-100">
                Analysis Results
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetAnalysis}
                className="text-stone-400 hover:text-stone-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {analyzeResult.atsScore && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-stone-100">
                  ATS Score
                </h3>
                <div className="bg-stone-900 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-stone-300">
                    {JSON.stringify(analyzeResult.atsScore, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {analyzeResult.categoryInsights && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-stone-100">
                  Category Insights
                </h3>
                <div className="bg-stone-900 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-stone-300">
                    {JSON.stringify(analyzeResult.categoryInsights, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {analyzeResult.resumeImprovements &&
              analyzeResult.resumeImprovements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-stone-100">
                    Suggested Improvements
                  </h3>
                  <div className="space-y-4">
                    {analyzeResult.resumeImprovements.map(
                      (improvement, index) => (
                        <div
                          key={index}
                          className="bg-stone-900 p-4 rounded-lg"
                        >
                          <p className="font-medium text-stone-300">
                            Original: {improvement.original}
                          </p>
                          <p className="text-red-400">
                            Issue: {improvement.issue}
                          </p>
                          <p className="text-green-400">
                            Suggestion: {improvement.suggestion}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
