import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface CoverLetter {
  id: string;
  content: string;
  job_description: string;
  created_at: string;
}

interface CoverLetterListProps {
  coverLetters: CoverLetter[];
  onDelete: (id: string) => void;
}

export function CoverLetterList({
  coverLetters,
  onDelete,
}: CoverLetterListProps) {
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Cover letter copied to clipboard");
  };

  if (coverLetters.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No cover letters found for this resume.</p>
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(letter.content)}
                >
                  Copy
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(letter.id)}
                >
                  Delete
                </Button>
              </div>
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
