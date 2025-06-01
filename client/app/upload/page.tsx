"use client";

import { AtsScoreType, DynamicResumeSections } from "@/types/resume";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [parsedData, setParsedData] = useState<DynamicResumeSections | null>(
    null
  );
  const [atsScore, setAtsScore] = useState<AtsScoreType>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setAtsScore(null); // reset ATS score on new upload
      setIsLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Upload failed");
      }

      setExtractedText(data.file?.text || "");
      setParsedData(data?.parsed);
      setAtsScore(data?.atsScore ?? null);
      setMessage("File uploaded successfully!");
    } catch (error: any) {
      setMessage("Upload error: " + error.message);
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={isLoading}
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 ${
            message.startsWith("Upload error")
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      {isLoading && (
        <p className="mt-4 text-blue-600 font-semibold">
          Processing your file...
        </p>
      )}

      {atsScore && (
        <div className="mt-6 p-4 bg-yellow-100 rounded border border-yellow-300">
          <h2 className="text-lg font-semibold mb-2">ATS Readiness Score:</h2>
          <p className="text-xl font-bold text-yellow-800">{atsScore.score}%</p>
          <p className="mt-2 text-sm text-yellow-900">{atsScore.explanation}</p>
        </div>
      )}

      {extractedText && (
        <section className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Extracted Text:</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {extractedText}
          </pre>
        </section>
      )}

      {parsedData && (
        <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Parsed Resume Data:</h2>
          {Object.entries(parsedData).map(([section, content]) => (
            <div key={section} className="mb-4">
              <h3 className="text-md font-bold">{section}</h3>
              <pre className="text-sm whitespace-pre-wrap text-gray-800">
                {typeof content === "string"
                  ? content
                  : JSON.stringify(content, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
