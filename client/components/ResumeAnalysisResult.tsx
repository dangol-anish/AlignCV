import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface ResumeImprovement {
  original: string;
  issue: string;
  suggestion: string;
}

interface ResumeAnalysisResultProps {
  atsScore?: { score: number; explanation: string } | null;
  categoryInsights?: Record<string, string[]> | null;
  resumeImprovements?: ResumeImprovement[];
  extractedText?: string;
  parsedData?: any;
  user?: any;
}

export default function ResumeAnalysisResult({
  atsScore,
  categoryInsights,
  resumeImprovements = [],
  extractedText,
  parsedData,
  user,
}: ResumeAnalysisResultProps) {
  const router = useRouter();
  return (
    <>
      {atsScore && (
        <div className="mt-2 p-4 rounded bg-yellow-50">
          <h2 className="text-lg font-semibold mb-2 text-yellow-900">
            ATS Readiness Score
          </h2>
          <p className="text-xl font-bold text-yellow-800">{atsScore.score}%</p>
          <div className="mt-2 prose prose-sm text-yellow-900 max-w-none">
            <ReactMarkdown>{atsScore.explanation}</ReactMarkdown>
          </div>
        </div>
      )}
      {categoryInsights && (
        <div className="mt-6 p-4 rounded bg-blue-50">
          <h2 className="text-lg font-semibold mb-2 text-blue-900">
            Resume Analysis by Categories
          </h2>
          {Object.entries(categoryInsights).map(
            ([category, feedback]: [string, string[]]) => (
              <div key={category} className="mb-4">
                <h3 className="text-md font-bold text-blue-800">{category}</h3>
                <ul className="list-disc list-inside text-sm text-blue-900">
                  {feedback.map((point: string, index: number) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      )}
      {resumeImprovements && resumeImprovements.length > 0 && (
        <div className="mt-6 p-4 rounded bg-green-50">
          <h2 className="text-lg font-semibold mb-4 text-green-900">
            Line-by-Line Suggestions
          </h2>
          {resumeImprovements.map(({ original, issue, suggestion }, idx) => (
            <div key={idx} className="mb-4">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Issue:</strong> {issue}
              </p>
              <p className="text-sm">
                <span className="text-green-700 line-through">{original}</span>
                <br />
                <span className="text-red-700 font-semibold">{suggestion}</span>
              </p>
            </div>
          ))}
        </div>
      )}
      {extractedText && (
        <section className="mt-6 p-4 rounded bg-gray-100">
          <h2 className="text-lg font-semibold mb-2">Extracted Text</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {extractedText}
          </pre>
        </section>
      )}
      {parsedData && (
        <div className="mt-6 p-4 rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Parsed Resume Data</h2>
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
      {resumeImprovements && resumeImprovements.length > 0 && (
        <Button
          className="mt-6 w-full bg-green-600 hover:bg-green-700"
          onClick={() => {
            if (!user) {
              router.push("/auth?redirect=/resume/templates");
            } else {
              router.push("/resume/templates");
            }
          }}
        >
          Implement these improvements
        </Button>
      )}
    </>
  );
}
