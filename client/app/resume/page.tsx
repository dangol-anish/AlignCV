"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/useUserStore";
import { fetchUserResumes, referenceResumeForFeature } from "@/lib/api/resume";
import { IResume } from "@/types/resume";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ResumeListPage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const [resumes, setResumes] = useState<IResume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenced, setReferenced] = useState<string | null>(null);
  const [referenceResult, setReferenceResult] = useState<any>(null);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchUserResumes(user.token)
      .then((resumes) => {
        setResumes(resumes);
        console.log("Fetched resumes:", resumes);
      })
      .catch(async (e) => {
        let message = e.message;
        if (message === "AUTH_EXPIRED") {
          clearUser();
          setError("Your session has expired. Please sign in again.");
          return;
        }
        if (e.response) {
          try {
            const data = await e.response.json();
            message = data.message || JSON.stringify(data) || message;
          } catch {}
        }
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleReference = async (resume_id: string) => {
    if (!user) return;
    setReferenced(resume_id);
    setReferenceResult(null);
    setError(null);
    try {
      const result = await referenceResumeForFeature(user.token, resume_id);
      setReferenceResult(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setReferenced(null);
    }
  };

  if (error === "Your session has expired. Please sign in again.") {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={() => router.push("/auth")}>Sign In</Button>
      </div>
    );
  }
  if (!user) return <div>Please sign in to view your resumes.</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Uploaded Resumes</h1>
        <Button onClick={() => router.push("/upload")}>
          Upload New Resume
        </Button>
      </div>
      <div className="mb-2 text-xs text-gray-400">
        User token: {user?.token?.slice(0, 8) || "none"}...
      </div>
      {resumes.length === 0 && !loading && !error && (
        <div>
          No resumes found. If you have uploaded resumes and still see this,
          there may be an issue with authentication or the backend.
        </div>
      )}
      {resumes.length === 0 ? (
        <div>No resumes found.</div>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => (
            <Card
              key={resume.id}
              className="p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{resume.original_filename}</div>
                <div className="text-sm text-gray-500">
                  Uploaded: {new Date(resume.uploaded_at).toLocaleString()}
                </div>
              </div>
              <Button
                onClick={() => handleReference(resume.id)}
                disabled={referenced === resume.id}
              >
                {referenced === resume.id
                  ? "Referencing..."
                  : "Reference for Feature"}
              </Button>
            </Card>
          ))}
        </div>
      )}
      {referenceResult && (
        <div className="mt-6 p-4 border rounded bg-green-50">
          <div className="font-bold mb-2">Resume Referenced!</div>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(referenceResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
