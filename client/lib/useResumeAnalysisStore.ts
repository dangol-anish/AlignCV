import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AtsScoreType,
  CategoryInsights,
  DynamicResumeSections,
} from "@/types/resume";

interface ResumeImprovement {
  original: string;
  issue: string;
  suggestion: string;
}

interface ResumeAnalysisState {
  extractedText: string;
  parsedData: DynamicResumeSections | null;
  atsScore: AtsScoreType;
  categoryInsights: CategoryInsights | null;
  resumeImprovements: ResumeImprovement[];
  setResults: (data: {
    extractedText: string;
    parsedData: DynamicResumeSections | null;
    atsScore: AtsScoreType;
    categoryInsights: CategoryInsights | null;
    resumeImprovements: ResumeImprovement[];
  }) => void;
  clearResults: () => void;
}

export const useResumeAnalysisStore = create(
  persist<ResumeAnalysisState>(
    (set) => ({
      extractedText: "",
      parsedData: null,
      atsScore: null,
      categoryInsights: null,
      resumeImprovements: [],
      setResults: (data) => set({ ...data }),
      clearResults: () =>
        set({
          extractedText: "",
          parsedData: null,
          atsScore: null,
          categoryInsights: null,
          resumeImprovements: [],
        }),
    }),
    {
      name: "resume-analysis-store",
    }
  )
) as unknown as import("zustand").UseBoundStore<
  import("zustand").StoreApi<ResumeAnalysisState>
>;
