"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserStore } from "@/lib/useUserStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, Pencil, FileDown, FileText, Loader2 } from "lucide-react";

interface CoverLetter {
  id: string;
  cover_letter: string;
  created_at: string;
  job_title: string;
  data?: {
    cover_letter: string;
    job_title: string;
    created_at: string;
  };
}

export default function CoverLetterContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { user } = useUserStore();
  const authLoading = useUserStore((state) => state.authLoading);
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);

  useEffect(() => {
    // Wait for authentication to complete before checking user state
    if (authLoading) {
      return;
    }

    if (!user?.token) {
      router.replace("/auth/signin");
      return;
    }

    const fetchCoverLetter = async () => {
      console.log("\n=== FETCHING COVER LETTER ===");
      console.log("Cover letter ID:", id);
      console.log("User token:", user?.token);

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/cover-letter/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Response data:", data);

        if (!response.ok) {
          console.log("Error response:", data);
          throw new Error(data.message || "Failed to fetch cover letter");
        }

        if (!data.success || !data.coverLetter) {
          console.log("Invalid response format:", data);
          throw new Error("Invalid response format from server");
        }

        // Extract the actual cover letter data from the response
        const coverLetterData = data.coverLetter.data || data.coverLetter;
        console.log("Setting cover letter:", coverLetterData);
        setCoverLetter(coverLetterData);
      } catch (err: any) {
        console.error("Error fetching cover letter:", err);
        setError(err.message || "Failed to load cover letter");
      } finally {
        setLoading(false);
      }
    };

    fetchCoverLetter();
  }, [id, user?.token, router, authLoading]);

  // Show loading while authentication is being determined
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cover letter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading cover letter</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!coverLetter) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Cover letter not found</p>
        </div>
      </div>
    );
  }

  console.log("Rendering cover letter:", coverLetter);

  const handleDownload = async (type: "pdf" | "docx") => {
    setDownloading(type);
    try {
      const endpoint = `/api/cover-letter/${id}/${type}`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        alert(`Failed to download ${type.toUpperCase()}: ${text}`);
        console.error(`Download error for ${type}:`, text);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `cover-letter-${id}.${type}`;
      document.body.appendChild(a);
      setTimeout(() => {
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          a.remove();
        }, 3000);
      }, 100);
      console.log(`Download for ${type} triggered.`);
    } catch (err) {
      alert(`Unexpected error: ${err}`);
      console.error("Unexpected download error:", err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 ">
      <div className="bg-stone-950 text-stone-100 rounded-xl shadow-lg  mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-500 mb-2 md:mb-0 text-center md:text-left md:w-auto">
            {coverLetter.job_title}
          </h1>
          <div className="flex gap-2 w-full md:w-auto justify-center md:justify-end"></div>
        </div>
        <div className="prose  prose-invert">
          <div className="whitespace-pre-wrap font-mono text-stone-300 text-md leading-relaxed">
            {coverLetter.cover_letter}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-stone-100 font-light rounded-md shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            disabled={downloading === "pdf"}
            onClick={() => handleDownload("pdf")}
          >
            {downloading === "pdf" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileDown className="h-5 w-5" />
            )}
            PDF
          </Button>
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-stone-100 font-light rounded-md shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            disabled={downloading === "docx"}
            onClick={() => handleDownload("docx")}
          >
            {downloading === "docx" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
            DOCX
          </Button>
        </div>
      </div>
    </div>
  );
}
