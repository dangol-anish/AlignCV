"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/lib/useUserStore";
import DividerSm from "@/components/DividerSm";

const questions = [
  {
    id: "motivation",
    question: "What motivates you to apply for this position? ",
    placeholder: "I am excited about this opportunity because...",
  },
  {
    id: "experience",
    question: "What relevant experience do you have for this role? ",
    placeholder: "In my previous roles, I have...",
  },
  {
    id: "skills",
    question: "What specific skills make you a good fit for this position? ",
    placeholder: "My key skills include...",
  },
  {
    id: "goals",
    question:
      "What are your career goals and how does this position align with them? ",
    placeholder: "My career goals include...",
  },
];

export default function CoverLetterPage() {
  const router = useRouter();
  const { user, authLoading } = useUserStore();
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [resumesLoading, setResumesLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error("Only authenticated users can use this feature.");
      router.push("/");
      return;
    }

    fetchResumes();
  }, [router, user, authLoading]);

  const fetchResumes = async () => {
    try {
      setResumesLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resumes`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch resumes");
      }

      const data = await response.json();
      if (!Array.isArray(data.resumes)) {
        throw new Error("Invalid resume data received");
      }
      setResumes(data.resumes);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setResumesLoading(false);
    }
  };

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleGenerate = async () => {
    if (!jobDescription) {
      toast.error("Please enter a job description");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cover-letter/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            resume_id: selectedResumeId || undefined,
            job_description: jobDescription,
            answers: Object.fromEntries(
              Object.entries(answers).filter(
                ([_, value]) => value.trim() !== ""
              )
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate cover letter");
      }

      setGeneratedCoverLetter(data.result.cover_letter);
      toast.success("Cover letter generated successfully");

      // Redirect to the view page
      router.push(`/cover-letter/${data.result.id}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setGeneratedCoverLetter("");
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8 bg-stone-950 min-h-screen">
      <h2 className="text-3xl tracking-wide text-blue-500 mb-12 text-center">
        <p className="mb-6">Generate Cover Letters Based On Job Description</p>
        <DividerSm />
      </h2>

      {generatedCoverLetter ? (
        <div className="bg-stone-950 text-stone-100 rounded-xl shadow-lg border border-stone-700 mx-auto  mt-8">
          <div className="whitespace-pre-wrap mb-6">{generatedCoverLetter}</div>
          <Button
            onClick={handleBackToForm}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-light rounded-md shadow-md transition-all duration-200"
          >
            Back
          </Button>
        </div>
      ) : (
        <div className="bg-stone-950 border-none text-stone-100 pt-6 rounded-xl shadow-lg border border-stone-700 mx-auto  mt-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xl mb-2 font-medium text-stone-200">
                Select Resume
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full p-4 py-2 rounded-md border border-stone-700 bg-stone-900/70 text-stone-100 placeholder:text-stone-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 px-4 transition-colors"
                disabled={resumesLoading}
                required
              >
                {resumesLoading ? (
                  <option value="" disabled>
                    Loading...
                  </option>
                ) : (
                  <option value="" className="text-stone-400 bg-stone-900">
                    -- Select a resume --
                  </option>
                )}
                {resumes.map((resume) => (
                  <option
                    key={resume.id}
                    value={resume.id}
                    className="text-stone-100 bg-stone-900"
                  >
                    {resume.filename ||
                      resume.name ||
                      resume.original_filename ||
                      `Resume ${resume.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-xl font-medium text-stone-200">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-32 rounded-md border border-stone-700 bg-stone-900/70 text-stone-100 placeholder:text-stone-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 px-4 py-2 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block mb-4 font-medium text-stone-200 text-xl">
                Additional Information (Optional)
              </label>
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id}>
                    <label className="block mb-2 font-light text-stone-200">
                      {q.question}
                    </label>
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder={q.placeholder}
                      className="w-full h-24 rounded-md border border-stone-700 bg-stone-900/70 text-stone-100 placeholder:text-stone-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 px-4 py-2 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-light rounded-md shadow-md transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    Generating...
                  </>
                ) : (
                  "Generate Cover Letter"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
