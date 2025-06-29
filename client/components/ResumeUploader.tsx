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
import { useState } from "react";
import { useResumeSelectionStore } from "@/lib/useResumeSelectionStore";

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
  analyzeLoading,
  analyzeError,
  analyzeResult,
  handleFileChange,
  handleAnalyzeOrUpload,
  userResumes,
}: ResumeUploaderProps) {
  const user = useUserStore((state) => state.user);
  const { selectedResumeId, setSelectedResumeId } = useResumeSelectionStore();
  const [isDragging, setIsDragging] = useState(false);

  const resetAnalysis = () => {
    setFile(null);
    setSelectedResumeId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > 2 * 1024 * 1024) {
        toast.error("File size exceeds 2MB limit");
        return;
      }
      // Set the file first
      setFile(droppedFile);
      setSelectedResumeId(null); // clear dropdown selection if file is chosen

      // Wait for state to update
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Now start the analysis
      await handleAnalyzeOrUpload();
    }
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
      // Call the analysis function with the resumeId
      await handleAnalyzeOrUpload(undefined, resumeId);
    } catch (error) {
      console.error("Error selecting stored resume:", error);
      toast.error("Failed to analyze stored resume");
    }
  };

  return (
    <Card
      className={`bg-stone-950 border-2 border-dashed transition-colors duration-200 group ${
        isDragging
          ? "border-blue-500 bg-blue-950/20"
          : "border-stone-700 hover:border-blue-500 hover:bg-blue-950/20"
      }`}
    >
      <CardContent className="">
        {!analyzeResult ? (
          <label
            className="cursor-pointer w-full h-full flex flex-col gap-6 pt-6"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading || analyzeLoading}
            />
            <div className="flex flex-col gap-3 items-center justify-center text-center">
              {isLoading || analyzeLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-3" />
                  <p className="text-stone-400">Analyzing your resume...</p>
                </div>
              ) : (
                <>
                  <Upload
                    className={`w-16 h-16 text-blue-500 group-hover:text-blue-400 transition-colors duration-200 mb-3 ${
                      isDragging ? "animate-bounce" : ""
                    }`}
                  />
                  <h3 className="text-xl text-stone-100">
                    {isDragging
                      ? "Drop your resume here"
                      : "Drop your resume here"}
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
                <DropdownMenu modal={false}>
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
                    className="w-[280px] bg-stone-800 border-stone-700 max-h-[300px] overflow-hidden"
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
                        <div className="max-h-[200px] overflow-y-auto">
                          {userResumes.map((resume) => (
                            <DropdownMenuItem
                              key={resume.id}
                              className="text-stone-100 hover:bg-stone-700 cursor-pointer focus:bg-stone-700 transition-colors duration-150"
                              onClick={() =>
                                handleStoredResumeSelect(resume.id)
                              }
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
                        </div>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </label>
        ) : (
          <></>
        )}
      </CardContent>
    </Card>
  );
}
