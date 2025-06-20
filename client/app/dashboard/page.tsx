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
import { ChevronDownIcon } from "lucide-react";

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
  const allImprovements = analyses.flatMap((item) =>
    item.analyses.flatMap((analysis: any) => ({
      ...analysis,
      resume_filename: item.resume_filename,
      resume_id: item.resume_id,
    }))
  );

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center py-12 px-2">
      <div className="w-full max-w-5xl space-y-10">
        {/* Resume Upload Section */}
        <Card className="bg-stone-950 border-stone-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent font-bold">
              Upload a Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <input
                ref={uploadInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleDashboardFileChange}
                className="mb-2"
                disabled={uploadLoading}
              />
              <Button
                onClick={handleDashboardUpload}
                disabled={uploadLoading || !uploadFile}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {uploadLoading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Resumes Section */}
        <Card className="bg-stone-950 border-stone-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent font-bold">
              Your Uploaded Resumes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userResumes.length === 0 ? (
              <div className="text-center text-stone-400 py-8">
                No resumes found. Upload a resume to get started.
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>
                      {selectedResumeId
                        ? userResumes.find((r) => r.id === selectedResumeId)
                            ?.original_filename
                        : "Select a Resume"}
                    </span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuLabel>Your Resumes</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userResumes.map((resume) => (
                    <DropdownMenuItem
                      key={resume.id}
                      onSelect={() => handleSelectResume(resume.id)}
                    >
                      {resume.original_filename}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardContent>
        </Card>

        {loading && selectedResumeId && (
          <div className="text-center text-stone-400 py-8">Loading data...</div>
        )}

        {selectedResumeId && !loading && (
          <>
            {/* Resume Improvements Section */}
            <Card className="bg-stone-950 border-stone-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent font-bold">
                  Resume Improvements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allImprovements.length === 0 ? (
                  <div className="text-center text-stone-400 py-8">
                    No improvements found for this resume.
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] w-full">
                    <div className="space-y-4">
                      {allImprovements.map(
                        (improvement: any, index: number) => (
                          <div key={index} className="space-y-2">
                            <Card className="bg-stone-900 border-stone-800 p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-stone-100">
                                    {improvement.section}
                                  </h3>
                                  <p className="text-sm text-stone-400">
                                    {improvement.suggestion}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="border-purple-500 text-purple-500"
                                >
                                  Improvement
                                </Badge>
                              </div>
                            </Card>
                            <Separator className="bg-stone-800" />
                          </div>
                        )
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Job Matches Section */}
            <Card className="bg-stone-950 border-stone-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent font-bold">
                  Job Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobMatches.length === 0 ? (
                  <div className="text-center text-stone-400 py-8">
                    No job matches found for this resume.
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] w-full">
                    <div className="space-y-4">
                      {jobMatches.map((match) => (
                        <div key={match.id} className="space-y-2">
                          <Card
                            onClick={() =>
                              router.push(`/job-match/${match.id}`)
                            }
                            className="bg-stone-900 border-stone-800 p-4 cursor-pointer hover:bg-stone-800/80 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-stone-100">
                                  {match.job_title} at {match.company_name}
                                </h3>
                                <p className="text-sm text-stone-400">
                                  {match.job_location}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="border-green-500 text-green-500"
                              >
                                Match: {match.match_score}%
                              </Badge>
                            </div>
                          </Card>
                          <Separator className="bg-stone-800" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Cover Letters Section */}
            <Card className="bg-stone-950 border-stone-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent font-bold">
                  Cover Letters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CoverLetterList
                  coverLetters={coverLetters}
                  onDelete={handleDeleteCoverLetter}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
