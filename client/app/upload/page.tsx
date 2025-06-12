"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/useUserStore";
import { Button } from "@/components/ui/button";

export default function UploadResumePage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }
    if (!user) {
      setError("You must be signed in to upload a resume.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Upload failed");
      }
      setFile(null);
      setError(null);
      if (inputRef.current) inputRef.current.value = "";
      alert("Resume uploaded and stored successfully!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-6">Upload Resume</h1>
        <p className="mb-4 text-red-600">
          You must be signed in to upload a resume.
        </p>
        <Button onClick={() => router.push("/auth")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Upload Resume</h1>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        className="mb-4"
      />
      <div className="flex gap-4">
        <Button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push("/resume")}
          disabled={loading}
        >
          View My Resumes
        </Button>
      </div>
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </div>
  );
}
