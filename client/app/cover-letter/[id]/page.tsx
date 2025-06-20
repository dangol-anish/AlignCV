import { Suspense } from "react";
import CoverLetterContent from "./CoverLetterContent";
import DividerSm from "@/components/DividerSm";

export default async function CoverLetterPage() {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center  ">
      <div className="w-full ">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12  border-blue-500 mx-auto mb-4"></div>
                <p className="text-stone-400">Loading cover letter...</p>
              </div>
            </div>
          }
        >
          <h2 className="text-3xl tracking-wide text-blue-500 mb-20 text-center">
            <p className="mb-6">Generated Cover Letter</p>
            <DividerSm />
          </h2>

          <CoverLetterContent />
        </Suspense>
      </div>
    </div>
  );
}
