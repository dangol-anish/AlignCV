"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/lib/useUserStore";

const questions = [
  {
    id: "motivation",
    question: "What motivates you to apply for this position? (Optional)",
    placeholder: "I am excited about this opportunity because...",
  },
  {
    id: "experience",
    question: "What relevant experience do you have for this role? (Optional)",
    placeholder: "In my previous roles, I have...",
  },
  {
    id: "skills",
    question:
      "What specific skills make you a good fit for this position? (Optional)",
    placeholder: "My key skills include...",
  },
  {
    id: "goals",
    question:
      "What are your career goals and how does this position align with them? (Optional)",
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
      const response = await fetch("/api/resumes", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

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
      const response = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          resume_id: selectedResumeId || undefined,
          job_description: jobDescription,
          answers: Object.fromEntries(
            Object.entries(answers).filter(([_, value]) => value.trim() !== "")
          ),
        }),
      });

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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Generate Cover Letter</h1>

      <Card>
        <CardHeader>
          <CardTitle>Select Resume (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          {resumesLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">No resume selected</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.filename || resume.name || `Resume ${resume.id}`}
                </option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className="w-full h-32 p-2 border rounded-md"
            required
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q) => (
            <div key={q.id}>
              <label className="block mb-2 font-medium">{q.question}</label>
              <textarea
                value={answers[q.id] || ""}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                placeholder={q.placeholder}
                className="w-full h-24 p-2 border rounded-md"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full max-w-md"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Cover Letter"
          )}
        </Button>
      </div>

      {generatedCoverLetter && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{generatedCoverLetter}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
