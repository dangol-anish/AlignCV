"use client";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import ResumeAnalysisResult from "@/components/ResumeAnalysisResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchUserResumes } from "@/lib/api/resume";
import { supabase } from "@/lib/supabaseClient";
import { useResumeAnalysisStore } from "@/lib/useResumeAnalysisStore";
import { useUserStore } from "@/lib/useUserStore";
import {
  AtsScoreType,
  CategoryInsights,
  DynamicResumeSections,
} from "@/types/resume";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { IResume } from "../types/resume";
import { navItems } from "../constants/NavItems";
import Link from "next/link";
import {
  LogInIcon,
  Upload,
  FileText,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { OnlineBadge } from "@/components/ui/online-badge";
import FloatingDots from "@/components/ui/floating-dots";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import ResumeUploader from "@/components/ResumeUploader";
import Hero from "@/components/Hero";
import ResponsiveToaster from "@/components/ResponsiveToaster";
import { useResumeAnalysis } from "@/components/ResumeAnalysis";
import LandingFeatures from "@/components/LandingFeatures";
import Divider from "@/components/Divider";
import LandingMetricsHighlights from "@/components/LandingMetricsHighlights";
import CTAHeroSection from "@/components/CTAHeroSection";
import Footer from "@/components/Footer";

interface AnalysisResult {
  extractedText: string;
  parsedData: any;
  atsScore: any;
  categoryInsights: any;
  resumeImprovements: any[];
}

export default function Home() {
  const user = useUserStore((state) => state.user);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userResumes, setUserResumes] = useState<IResume[]>([]);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<AnalysisResult | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchUserResumes(user.token)
        .then(setUserResumes)
        .catch(() => setUserResumes([]));
    } else {
      setUserResumes([]);
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit");
      return;
    }

    // Clear any previous selection
    setFile(selectedFile);

    // Start analysis immediately
    await analyzeResume(selectedFile);
  };

  const analyzeResume = async (resumeFile: File) => {
    setAnalyzeLoading(true);
    setAnalyzeError(null);
    setAnalyzeResult(null);

    try {
      // First analyze the file
      const formData = new FormData();
      formData.append("file", resumeFile);

      const response = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to analyze resume");
      }

      const data = await response.json();

      // If user is logged in, also save the file
      if (user?.token) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", resumeFile);
        await fetch("http://localhost:3000/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          body: uploadFormData,
        });
      }

      // Store results
      const results = {
        extractedText: data.extractedText || "",
        parsedData: data.parsed,
        atsScore: data.atsScore,
        categoryInsights: data.categoryInsights,
        resumeImprovements: data.lineImprovements || [],
      };

      setAnalyzeResult(results);
      useResumeAnalysisStore.getState().setResults(results);

      toast.success("Analysis completed successfully!");
      router.push("/resume/analysis");
    } catch (error: any) {
      const errorMessage = error.message || "An error occurred during analysis";
      setAnalyzeError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const analyzeStoredResume = async (resumeId: string) => {
    if (!user?.token) {
      toast.error("Please sign in to analyze stored resumes");
      return;
    }

    setAnalyzeLoading(true);
    setAnalyzeError(null);
    setAnalyzeResult(null);
    setFile(null);

    try {
      const response = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ resume_id: resumeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to analyze resume");
      }

      const data = await response.json();

      // Store results
      const results = {
        extractedText: data.extractedText || "",
        parsedData: data.parsed,
        atsScore: data.atsScore,
        categoryInsights: data.categoryInsights,
        resumeImprovements: data.lineImprovements || [],
      };

      setAnalyzeResult(results);
      useResumeAnalysisStore.getState().setResults(results);

      toast.success("Analysis completed successfully!");
      router.push("/resume/analysis");
    } catch (error: any) {
      console.error("Error analyzing stored resume:", error);
      const errorMessage = error.message || "An error occurred during analysis";
      setAnalyzeError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleAnalyzeOrUpload = async (
    e?: React.FormEvent,
    resumeId?: string
  ) => {
    if (e) e.preventDefault();

    if (resumeId) {
      await analyzeStoredResume(resumeId);
    } else if (file) {
      await analyzeResume(file);
    } else {
      toast.error("Please select a file or stored resume");
    }
  };

  return (
    <main className="min-h-screen text-white relative">
      <div className="absolute inset-0">
        <FloatingDots />
      </div>
      <div className="container mx-auto flex flex-col gap-20 relative">
        <Hero />

        <div id="upload-section" className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
          <div className="relative">
            <ResumeUploader
              file={file}
              setFile={setFile}
              message={message}
              isLoading={isLoading}
              analyzeLoading={analyzeLoading}
              analyzeError={analyzeError}
              analyzeResult={analyzeResult}
              handleFileChange={handleFileChange}
              handleAnalyzeOrUpload={handleAnalyzeOrUpload}
              userResumes={userResumes}
            />
          </div>
        </div>
        <Divider />
        <LandingFeatures />
        <Divider />

        <LandingMetricsHighlights />
        <Divider />
        <CTAHeroSection />
        <Divider />
      </div>
      <Footer />
    </main>
  );
}
