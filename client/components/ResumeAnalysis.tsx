"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useResumeAnalysisStore } from "@/lib/useResumeAnalysisStore";
import { useUserStore } from "@/lib/useUserStore";
import type { IResume } from "@/types/resume";
import {
  AtsScoreType,
  CategoryInsights,
  DynamicResumeSections,
} from "@/types/resume";
import { useResumeSelectionStore } from "@/lib/useResumeSelectionStore";

interface ResumeImprovement {
  original: string;
  issue: string;
  suggestion: string;
}

export function useResumeAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [parsedData, setParsedData] = useState<DynamicResumeSections | null>(
    null
  );
  const [atsScore, setAtsScore] = useState<AtsScoreType>(null);
  const [categoryInsights, setCategoryInsights] =
    useState<CategoryInsights | null>(null);
  const [resumeImprovements, setResumeImprovements] = useState<
    ResumeImprovement[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);

  const router = useRouter();
  const setResults = useResumeAnalysisStore((state) => state.setResults);
  const user = useUserStore((state) => state.user);
  const { selectedResumeId, setSelectedResumeId } = useResumeSelectionStore();

  const handleAnalyzeOrUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage("File size exceeds 2MB limit");
        return;
      }
      setMessage("");
      setExtractedText("");
      setParsedData(null);
      setAtsScore(null);
      setCategoryInsights(null);
      setResumeImprovements([]);
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const headers: HeadersInit = {};
        if (user) {
          headers.Authorization = `Bearer ${user.token}`;
        }

        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers,
          body: formData,
        });

        let analyzeData;
        try {
          analyzeData = await analyzeRes.json();
        } catch (e) {
          analyzeData = {};
        }

        if (!analyzeRes.ok) {
          const backendError =
            analyzeData?.error?.message ||
            analyzeData?.message ||
            "Analysis failed";
          setMessage(backendError);
          toast.error(backendError);
          throw new Error(backendError);
        }

        if (user) {
          const storeRes = await fetch("/api/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
            body: formData,
          });

          if (!storeRes.ok) {
            const errorData = await storeRes.json();
            throw new Error(errorData.message || "Failed to store resume");
          }
        }

        setResults({
          extractedText: "",
          parsedData: analyzeData?.parsed,
          atsScore: analyzeData?.atsScore ?? null,
          categoryInsights: analyzeData?.categoryInsights ?? null,
          resumeImprovements: analyzeData?.lineImprovements ?? [],
        });

        setMessage("Resume analyzed successfully!");
        toast.success("Resume analysis complete!", {
          id: "resume-analysis",
        });
        router.push("/resume/analysis");
      } catch (error: any) {
        setMessage(error.message || "An unknown error occurred");
        toast.error(error.message || "An unknown error occurred", {
          id: "resume-analysis",
        });
      } finally {
        setIsLoading(false);
      }
    } else if (selectedResumeId) {
      if (!user) {
        setAnalyzeError("You must be signed in to analyze stored resumes.");
        return;
      }
      setAnalyzeLoading(true);
      setAnalyzeError(null);
      setAnalyzeResult(null);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ resume_id: selectedResumeId }),
        });
        let data;
        try {
          data = await res.json();
        } catch (e) {
          data = {};
        }
        if (!res.ok) {
          const backendError =
            data?.error?.message || data?.message || "Failed to analyze resume";
          setAnalyzeError(backendError);
          toast.error(backendError, {
            id: "resume-analysis",
          });
          setAnalyzeLoading(false);
          return;
        }
        setAnalyzeResult({
          extractedText: "",
          parsedData: data?.parsed,
          atsScore: data?.atsScore ?? null,
          categoryInsights: data?.categoryInsights ?? null,
          resumeImprovements: data?.lineImprovements ?? [],
        });
        toast.success("Resume analysis complete!", {
          id: "resume-analysis",
        });
        router.push("/resume/analysis");
      } catch (e: any) {
        setAnalyzeError(e.message);
        toast.error(e.message, {
          id: "resume-analysis",
        });
      } finally {
        setAnalyzeLoading(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");
      handleAnalyzeOrUpload();
    }
  };

  return {
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
  };
}
