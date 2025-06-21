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
import { useResumeSelectionStore } from "@/lib/useResumeSelectionStore";

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [coverLetters, setCoverLetters] = useState<any[]>([]);
  const [userResumes, setUserResumes] = useState<IResume[]>([]);
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
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(
    undefined
  );

  // Use persistent resume selection store
  const { selectedResumeId, setSelectedResumeId } = useResumeSelectionStore();

  // Scroll to top on mount to prevent browser restoring scroll position to bottom
  useEffect(() => {
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
    }
  }, [loading]);

  useEffect(() => {
    if (dropdownTriggerRef.current) {
      setDropdownWidth(dropdownTriggerRef.current.offsetWidth);
    }
  }, []);

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

  // Helper to truncate by word count
  function truncateWords(text: string, maxWords: number) {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(" ") + "...";
    }
    return text;
  }

  function getCoverLetterLabel(letter: any, mobile: boolean = false) {
    // Prefer job_title, then job_description, then resume_filename, then fallback
    const maxWords = mobile ? 10 : 20;
    if (letter.job_title && letter.job_title.trim()) {
      return (
        truncateWords(letter.job_title, maxWords) +
        (letter.job_title.split(" ").length > maxWords ? "..." : "")
      );
    }
    if (letter.job_description && letter.job_description.trim()) {
      return (
        truncateWords(letter.job_description, maxWords) +
        (letter.job_description.split(" ").length > maxWords ? "..." : "")
      );
    }
    if (letter.resume_filename && letter.resume_filename.trim()) {
      return (
        truncateWords(`Cover Letter for ${letter.resume_filename}`, maxWords) +
        (`Cover Letter for ${letter.resume_filename}`.split(" ").length >
        maxWords
          ? "..."
          : "")
      );
    }
    // Fallback: Cover Letter + date
    const date = letter.created_at
      ? new Date(letter.created_at).toLocaleDateString()
      : "";
    return `Cover Letter${date ? ` (${date})` : ""}`;
  }

  // Helper to generate a unique, user-friendly title for each improvement
  function getImprovementTitle(improvement: any) {
    // Compose a title using available fields, prioritizing section and issue
    const section = improvement.section && improvement.section.trim();
    const issue = improvement.issue && improvement.issue.trim();
    const suggestion = improvement.suggestion && improvement.suggestion.trim();
    const original = improvement.original && improvement.original.trim();

    let title = "";
    if (section && issue) {
      title = `Section: ${section} — Issue: ${issue}`;
    } else if (section && suggestion) {
      title = `Section: ${section} — Suggestion: ${suggestion}`;
    } else if (section) {
      title = `Section: ${section}`;
    } else if (issue) {
      title = `Issue: ${issue}`;
    } else if (suggestion) {
      title = `Suggestion: ${suggestion}`;
    } else if (original) {
      title = `Original: ${original}`;
    } else {
      title = "Resume Improvement";
    }
    return title;
  }

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
    <div className=" bg-stone-950 flex flex-col items-center ">
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
        <div className="flex justify-between   gap-5">
          <h2 className="text-blue-500 text-2xl font-semibold">
            View Resumes Details
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                className=" text-white w-52 flex gap-8 truncate max-w-full justify-between"
              >
                <span className="truncate overflow-hidden whitespace-nowrap max-w-[12ch] sm:max-w-[20ch] md:max-w-[28ch] font-light">
                  {selectedResumeId ? (
                    <>
                      <span className="block sm:hidden">
                        {truncateWords(
                          userResumes.find((r) => r.id === selectedResumeId)
                            ?.original_filename || "",
                          10
                        )}
                      </span>
                      <span className="hidden sm:block">
                        {truncateWords(
                          userResumes.find((r) => r.id === selectedResumeId)
                            ?.original_filename || "",
                          20
                        )}
                      </span>
                    </>
                  ) : (
                    "Select a Resume"
                  )}
                </span>
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 mt-1 bg-stone-800 text-stone-100 border-0">
              <DropdownMenuLabel>Your Resumes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userResumes.map((resume) => (
                <DropdownMenuItem
                  className="truncate overflow-hidden whitespace-nowrap max-w-[24ch] hover:text-blue-500 hover:bg-blue-500"
                  key={resume.id}
                  onSelect={() => handleSelectResume(resume.id)}
                >
                  <span className="block sm:hidden">
                    {truncateWords(resume.original_filename, 10)}
                  </span>
                  <span className="hidden sm:block">
                    {truncateWords(resume.original_filename, 20)}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Uploaded Resumes Section */}

        {loading && selectedResumeId && (
          <div className="text-center text-stone-400 py-8">Loading data...</div>
        )}

        {selectedResumeId && !loading && (
          <>
            {/* Resume Improvements Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-blue-500 mb-4">
                Resume Improvement Suggestions
              </h3>
              {!allImprovements[0]?.line_improvements ||
              allImprovements[0].line_improvements.length === 0 ? (
                <div className="text-center text-stone-400 py-8">
                  No improvements found for this resume.
                </div>
              ) : (
                <ul className="divide-y divide-stone-800">
                  {allImprovements[0].line_improvements.map(
                    (improvement: any, index: number) => (
                      <li key={index} className="flex items-center py-3 gap-2">
                        <span
                          className="flex-1 min-w-0 text-stone-100 font-medium truncate overflow-hidden whitespace-nowrap max-w-[16ch] sm:max-w-[ch] md:max-w-[28ch]"
                          title={improvement.issue || undefined}
                        >
                          <span className="block sm:hidden font-light">
                            {getImprovementTitle(improvement)}
                          </span>
                          <span className="hidden sm:block">
                            {getImprovementTitle(improvement)}
                          </span>
                        </span>
                        <span className="mx-auto text-xs text-stone-400 w-24 text-center">
                          {allImprovements[0].analyzed_at
                            ? new Date(
                                allImprovements[0].analyzed_at
                              ).toLocaleDateString()
                            : ""}
                        </span>
                        <button
                          onClick={() =>
                            router.push(`/resume/analysis/${selectedResumeId}`)
                          }
                          className="text-blue-500 hover:underline text-sm bg-transparent border-none cursor-pointer p-0 m-0"
                          type="button"
                        >
                          View Details
                        </button>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>

            {/* Job Matches Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-blue-500 mb-4">
                Recommended Job Matches
              </h3>
              {jobMatches.length === 0 ? (
                <div className="text-center text-stone-400 py-8">
                  No job matches found for this resume.
                </div>
              ) : (
                <ul className="divide-y divide-stone-800">
                  {jobMatches.map((match: any) => (
                    <li key={match.id} className="flex items-center py-3 gap-2">
                      <span className="flex-1 min-w-0 text-stone-100 font-medium truncate overflow-hidden whitespace-nowrap max-w-[16ch] sm:max-w-[ch] md:max-w-[28ch]">
                        <span className="block sm:hidden font-light">
                          {truncateWords(
                            match.job_title ||
                              match.company_name ||
                              "Job Title Not Available",
                            10
                          )}
                        </span>
                        <span className="hidden sm:block">
                          {truncateWords(
                            match.job_title ||
                              match.company_name ||
                              "Job Title Not Available",
                            20
                          )}
                        </span>
                      </span>
                      <span className="mx-auto text-xs text-stone-400 w-24 text-center">
                        {match.created_at
                          ? new Date(match.created_at).toLocaleDateString()
                          : ""}
                      </span>
                      <button
                        onClick={() => router.push(`/job-match/${match.id}`)}
                        className="text-blue-500 hover:underline text-sm bg-transparent border-none cursor-pointer p-0 m-0"
                        type="button"
                      >
                        View Details
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Cover Letters Section */}
            <div className="my-8 ">
              <h3 className="text-xl font-semibold text-blue-500 mb-4">
                Generated Cover Letters
              </h3>
              {coverLetters.length === 0 ? (
                <div className="text-center text-stone-400 py-8">
                  No cover letters found for this resume.
                </div>
              ) : (
                <ul className="divide-y divide-stone-800">
                  {coverLetters.map((letter: any) => (
                    <li
                      key={letter.id}
                      className="flex items-center py-3 gap-2"
                    >
                      <span className="flex-1 min-w-0 text-stone-100 font-medium truncate overflow-hidden whitespace-nowrap max-w-[12ch] sm:max-w-[20h] md:max-w-[28ch]">
                        <span className="block sm:hidden">
                          {getCoverLetterLabel(letter, true)}
                        </span>
                        <span className="hidden sm:block">
                          {getCoverLetterLabel(letter, false)}
                        </span>
                      </span>
                      <span className="mx-auto text-xs text-stone-400 w-24 text-center">
                        {letter.created_at
                          ? new Date(letter.created_at).toLocaleDateString()
                          : ""}
                      </span>
                      <button
                        onClick={() =>
                          router.push(`/cover-letter/${letter.id}`)
                        }
                        className="text-blue-500 hover:underline text-sm bg-transparent border-none cursor-pointer p-0 m-0"
                        type="button"
                      >
                        View Details
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
