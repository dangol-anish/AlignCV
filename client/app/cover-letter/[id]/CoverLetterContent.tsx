"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserStore } from "@/lib/useUserStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, Pencil } from "lucide-react";

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
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoverLetter = async () => {
      console.log("\n=== FETCHING COVER LETTER ===");
      console.log("Cover letter ID:", id);
      console.log("User token:", user?.token);

      setLoading(true);
      setError(null);

      if (!user?.token) {
        setError("Please log in to view cover letters");
        setLoading(false);
        return;
      }

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
  }, [id, user?.token]);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{coverLetter.job_title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = `/cover-letter/${id}/edit`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="prose max-w-none">
        <div className="whitespace-pre-wrap font-mono">
          {coverLetter.cover_letter}
        </div>
      </div>
    </div>
  );
}
