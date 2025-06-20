"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/lib/useUserStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import ResumeUploader from "@/components/ResumeUploader";
import { fetchUserResumes } from "@/lib/api/resume";
import { IResume } from "@/types/resume";
import { CoverLetterList } from "@/components/CoverLetterList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronDownIcon, FileText, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import DividerSm from "@/components/DividerSm";

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [coverLetters, setCoverLetters] = useState<any[]>([]);
  const [userResumes, setUserResumes] = useState<IResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, clearUser } = useUserStore();
  const authLoading = useUserStore((state) => state.authLoading);
  const searchParams = useSearchParams();
  const toastShownRef = useRef(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Scroll to top on mount to prevent browser restoring scroll position to bottom
  useEffect(() => {
    console.log("On mount, scrollY:", window.scrollY);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
      return;
    }
    // Show toast on successful sign in
    if (searchParams.get("signin") === "1" && !toastShownRef.current) {
      toast.success("Signed in successfully!");
      toastShownRef.current = true;
    }
  }, [authLoading, user, router, searchParams]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    fetchUserResumes(user.token)
      .then((resumes) => {
        setUserResumes(resumes || []);
      })
      .catch((e) => {
        console.error("Error fetching resumes:", {
          message: e.message,
          stack: e.stack,
        });
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || !selectedResumeId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/resumes/analyses?resume_id=${selectedResumeId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then((res) => res.json()),
      fetch(`/api/job-matching?resume_id=${selectedResumeId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then((res) => res.json()),
      fetch(`/api/cover-letter?resume_id=${selectedResumeId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then((res) => res.json()),
    ])
      .then(([analysesData, jobMatchesData, coverLettersData]) => {
        if (!analysesData.success) {
          throw new Error(analysesData.message || "Failed to fetch analyses");
        }
        if (!jobMatchesData.success) {
          throw new Error(
            jobMatchesData.message || "Failed to fetch job matches"
          );
        }
        if (!coverLettersData.success) {
          throw new Error(
            coverLettersData.message || "Failed to fetch cover letters"
          );
        }
        setAnalyses(analysesData.results || []);
        setJobMatches(jobMatchesData.matches || []);
        setCoverLetters(coverLettersData.results || []);
      })
      .catch((e) => {
        console.error("Error fetching data for resume:", {
          message: e.message,
          stack: e.stack,
        });
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [user, selectedResumeId]);

  useEffect(() => {
    if (!loading) {
      console.log("After loading, scrollY:", window.scrollY);
    }
  }, [loading]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      clearUser();
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleDeleteCoverLetter = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/cover-letter/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete cover letter");
      }
      toast.success("Cover letter deleted successfully!");
      setCoverLetters((prev) => prev.filter((cl) => cl.id !== id));
    } catch (e: any) {
      toast.error(e.message || "Failed to delete cover letter");
    }
  };

  // Upload handler for dashboard
  const handleDashboardFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUploadFile(e.target.files?.[0] || null);
  };

  const handleDashboardUpload = async () => {
    if (!uploadFile) {
      toast.error("Please select a file to upload.");
      return;
    }
    if (!user) {
      toast.error("You must be signed in to upload a resume.");
      return;
    }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }
      if (data.isLikelyResume === false) {
        toast.error("The uploaded file does not appear to be a resume.");
      } else {
        toast.success("Resume uploaded and stored successfully!");
        setUploadFile(null);
        if (uploadInputRef.current) uploadInputRef.current.value = "";
        // Fetch latest resumes from backend
        const latestResumes = await fetchUserResumes(user.token);
        setUserResumes(latestResumes);
      }
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setAnalyses([]);
    setJobMatches([]);
    setCoverLetters([]);
  };

  if (authLoading || (loading && !userResumes.length)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-stone-100">
            Loading...
          </h2>
          <p className="text-stone-400">
            Please wait while we load your dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-stone-400">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Flatten all improvements from all analyses
  const allImprovements = analyses[0]?.analyses || [];

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center ">
      <div className="w-full flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          {" "}
          <h2 className="text-blue-500 text-2xl font-semibold">
            Upload a resume
          </h2>
          <Card className="bg-stone-950 border-2 border-dashed border-stone-700 hover:border-blue-500/0 transition-colors duration-200 group pt-6">
            <CardContent className="">
              <label className="cursor-pointer w-full h-full flex flex-col gap-4  items-center justify-center text-center">
                <Input
                  ref={uploadInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleDashboardFileChange}
                  className="hidden"
                  disabled={uploadLoading}
                />
                {uploadFile ? (
                  <>
                    <FileText className="w-16 h-16 text-green-500" />
                    <h3 className="text-xl text-stone-100">File Selected</h3>
                    <p className="text-stone-400">{uploadFile.name}</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-blue-500 group-hover:text-blue-400 transition-colors duration-200" />
                    <h3 className="text-xl text-stone-100">
                      Drop your resume here
                    </h3>
                    <p className="text-stone-400">or click to browse</p>
                  </>
                )}
                <p className="text-sm text-stone-500">
                  Supports: PDF, DOC, DOCX, TXT
                </p>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDashboardUpload();
                  }}
                  disabled={uploadLoading || !uploadFile}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white mt-4"
                >
                  {uploadLoading ? "Uploading..." : "Upload Resume"}
                </Button>
              </label>
            </CardContent>
          </Card>
        </div>

        <DividerSm />
        <div className="flex flex-col gap-5">
          <h2 className="text-blue-500 text-2xl font-semibold">View Resumes</h2>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                className="text-stone-100 hover:text-blue-500 focus:ring-0 focus:outline-none w-full"
              >
                Choose a resume <ChevronDownIcon className="ml-2 w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-full  bg-stone-950 border border-stone-700 shadow-lg"
              align="end"
              modal={false}
            >
              <DropdownMenuLabel className="text-stone-400 px-4 py-2">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-stone-700" />
              <DropdownMenuItem className="hover:bg-blue-500 hover:text-white transition-colors duration-150 px-4 py-2">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-blue-500 hover:text-white transition-colors duration-150 px-4 py-2">
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-blue-500 hover:text-white transition-colors duration-150 px-4 py-2">
                Team
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-blue-500 hover:text-white transition-colors duration-150 px-4 py-2">
                Subscription
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
