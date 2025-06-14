import { Suspense } from "react";
import CoverLetterContent from "./CoverLetterContent";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function CoverLetterPage({ params }: PageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading cover letter...</p>
            </div>
          </div>
        }
      >
        <CoverLetterContent id={params.id} />
      </Suspense>
    </div>
  );
}
