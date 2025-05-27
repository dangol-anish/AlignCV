"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [extractedText, setExtractedText] = useState("");

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json(); // ✅ Only read once

      if (!res.ok) {
        throw new Error(data?.message || "Upload failed");
      }

      setExtractedText(data?.file?.text || "");
      setMessage("File uploaded successfully!");
    } catch (error: any) {
      setMessage("Upload error: " + error.message);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Upload Your Resume or Image</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.rtf"
          className="mb-4"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Upload
        </button>
      </form>

      {message && <p className="mt-4 text-red-600">{message}</p>}

      {extractedText && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Extracted Text:</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {extractedText}
          </pre>
        </div>
      )}
    </div>
  );
}
