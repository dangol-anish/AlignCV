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
import { navItems } from "./constants/NavItems";
import Link from "next/link";
import {
  LogInIcon,
  Upload,
  FileText,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { OnlineBadge } from "@/components/ui/online-badge";
import { FloatingDots } from "@/components/ui/floating-dots";
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
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<AnalysisResult | null>(
    null
  );

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
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast.error("File size exceeds 2MB limit");
        return;
      }
      setFile(selectedFile);
      setSelectedResumeId(""); // clear dropdown selection if file is chosen
      await handleAnalyzeOrUpload();
    }
  };

  const handleAnalyzeOrUpload = async (
    e?: React.FormEvent,
    resumeId?: string
  ) => {
    if (e) e.preventDefault();

    // Use the provided resumeId or the state value
    const currentResumeId = resumeId || selectedResumeId;

    // Check if either a file is selected or a stored resume is chosen
    if (!file && !currentResumeId) {
      toast.error("Please select a file or stored resume");
      return;
    }

    setAnalyzeLoading(true);
    setAnalyzeError(null);
    setAnalyzeResult(null);

    try {
      let response;

      if (currentResumeId) {
        // Handle stored resume analysis
        if (!user?.token) {
          throw new Error("User not authenticated");
        }

        response = await fetch("http://localhost:3000/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ resume_id: currentResumeId }),
        });
      } else if (file) {
        // Handle file upload and analysis
        const formData = new FormData();
        formData.append("file", file);
        response = await fetch("http://localhost:3000/api/analyze", {
          method: "POST",
          body: formData,
        });

        // If file was uploaded and user is logged in, also save it
        if (user?.token) {
          const uploadFormData = new FormData();
          uploadFormData.append("file", file);
          await fetch("http://localhost:3000/api/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
            body: uploadFormData,
          });
        }
      }

      if (!response?.ok) {
        const errorData = await response?.json();
        throw new Error(errorData?.message || "Analysis failed");
      }

      const data = await response.json();
      setAnalyzeResult({
        extractedText: data.extractedText || "",
        parsedData: data.parsed,
        atsScore: data.atsScore,
        categoryInsights: data.categoryInsights,
        resumeImprovements: data.lineImprovements || [],
      });

      toast.success("Analysis completed successfully!");
    } catch (error: any) {
      setAnalyzeError(error.message || "An error occurred during analysis");
      toast.error(error.message || "An error occurred during analysis");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <Hero />

        <div className="relative mt-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
          <div className="relative">
            <ResumeUploader
              file={file}
              setFile={setFile}
              message={message}
              isLoading={isLoading}
              selectedResumeId={selectedResumeId}
              setSelectedResumeId={setSelectedResumeId}
              analyzeLoading={analyzeLoading}
              analyzeError={analyzeError}
              analyzeResult={analyzeResult}
              handleFileChange={handleFileChange}
              handleAnalyzeOrUpload={handleAnalyzeOrUpload}
              userResumes={userResumes}
            />
          </div>
        </div>
      </div>
      <ResponsiveToaster />
    </main>
  );
}
