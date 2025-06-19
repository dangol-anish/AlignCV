import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CoverLetter {
  id: string;
  content: string;
  job_description: string;
  created_at: string;
}

export function CoverLetterList() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoverLetters = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/cover-letter", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch cover letters");
      }

      setCoverLetters(data.coverLetters);
    } catch (error) {
      const err = error as Error;
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoverLetters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Cover letter copied to clipboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchCoverLetters} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (coverLetters.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No cover letters found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {coverLetters.map((letter) => (
        <Card key={letter.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Cover Letter</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(letter.content)}
              >
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Job Description</h3>
                <p className="text-sm text-gray-600">
                  {letter.job_description}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Cover Letter</h3>
                <div className="whitespace-pre-wrap text-sm">
                  {letter.content}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Generated on: {new Date(letter.created_at).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
