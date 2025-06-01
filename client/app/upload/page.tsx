"use client";

import { useState } from "react";
import { ParsedResume } from "@/types/resume";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);

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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Upload failed");
      }

      setExtractedText(data.file?.text || "");
      setParsedData(data.parsed || null);
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
        <section className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Extracted Text:</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {extractedText}
          </pre>
        </section>
      )}

      {parsedData && (
        <section className="mt-6 p-4 bg-white border rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Parsed Resume Data</h2>

          <p>
            <strong>Name:</strong> {parsedData.name || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {parsedData.email || "N/A"}
          </p>
          <p>
            <strong>Phone:</strong> {parsedData.phone || "N/A"}
          </p>

          <div>
            <strong>Skills:</strong>
            {parsedData.skills?.length ? (
              <ul className="list-disc ml-6">
                {parsedData.skills.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            ) : (
              <span> N/A</span>
            )}
          </div>

          <div className="mt-4">
            <strong>Education:</strong>
            {parsedData.education?.length ? (
              <ul className="list-disc ml-6">
                {parsedData.education.map((edu, i) => (
                  <li key={i}>
                    <p>
                      <strong>Degree:</strong> {edu.degree}
                    </p>
                    <p>
                      <strong>Institution:</strong> {edu.institution}
                    </p>
                    <p>
                      <strong>Dates:</strong> {edu.startDate || "?"} –{" "}
                      {edu.endDate || "?"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <span> N/A</span>
            )}
          </div>

          <div className="mt-4">
            <strong>Experience:</strong>
            {parsedData.experience?.length ? (
              <ul className="list-disc ml-6">
                {parsedData.experience.map((exp, i) => (
                  <li key={i} className="mb-2">
                    <p>
                      <strong>Job Title:</strong> {exp.jobTitle}
                    </p>
                    <p>
                      <strong>Company:</strong> {exp.company}
                    </p>
                    <p>
                      <strong>Dates:</strong> {exp.startDate || "?"} –{" "}
                      {exp.endDate || "?"}
                    </p>
                    {exp.responsibilities?.length ? (
                      <ul className="list-disc ml-8">
                        {exp.responsibilities.map((resp, j) => (
                          <li key={j}>{resp}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No responsibilities listed</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <span> N/A</span>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
