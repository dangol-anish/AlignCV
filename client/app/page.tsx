"use client";
import {
  AtsScoreType,
  CategoryInsights,
  DynamicResumeSections,
} from "@/types/resume";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResumeAnalysisStore } from "@/lib/useResumeAnalysisStore";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { useUserStore } from "@/lib/useUserStore";
import { supabase } from "@/lib/supabaseClient";

interface ResumeImprovement {
  original: string;
  issue: string;
  suggestion: string;
}

function ResponsiveToaster() {
  const [position, setPosition] = useState<any>("top-right");
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

export default function Home() {
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
  const router = useRouter();
  const setResults = useResumeAnalysisStore((state) => state.setResults);
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file first");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("File size exceeds 2MB limit");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setMessage("");
      setExtractedText("");
      setParsedData(null);
      setAtsScore(null);
      setCategoryInsights(null);
      setResumeImprovements([]); // Clear previous suggestions
      setIsLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "Upload failed");
        toast.error(data?.message || "Upload failed");
        return;
      }

      setResults({
        extractedText: data.file?.text || "",
        parsedData: data?.parsed,
        atsScore: data?.atsScore ?? null,
        categoryInsights: data?.categoryInsights ?? null,
        resumeImprovements: data?.lineImprovements ?? [],
      });
      setMessage("File uploaded successfully!");
      router.push("/resume/analysis");
      return;
    } catch (error: any) {
      setMessage("An unknown error occurred");
      toast.error("An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-muted px-2">
      {/* User sign-in status indicator and logout button */}
      <div className="mb-4 w-full max-w-lg flex items-center justify-end gap-2 text-xs text-gray-600">
        {user ? (
          <>
            <span>
              Signed in as{" "}
              <span className="font-semibold">{user.email || "User"}</span>
            </span>
            <button
              className="ml-2 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs font-medium"
              onClick={async () => {
                await supabase.auth.signOut();
                clearUser();
                toast.success("Signed out successfully");
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>Not signed in</>
        )}
      </div>
      <Card className="w-full max-w-lg shadow-md border-none bg-white/90">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            Resume Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.rtf"
              disabled={isLoading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Uploading..." : "Upload Resume"}
            </Button>
          </form>
          <div className="flex flex-col items-center gap-2 mt-6">
            <span className="text-xs text-muted-foreground">or</span>
            <GoogleSignInButton />
          </div>
          {message && (
            <p
              className={`mt-4 text-center text-sm ${
                message.startsWith("Upload error")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
          {isLoading && (
            <p className="mt-4 text-blue-600 font-semibold text-center">
              Processing your file...
            </p>
          )}
        </CardContent>
      </Card>
      <ResponsiveToaster />
    </main>
  );
}
