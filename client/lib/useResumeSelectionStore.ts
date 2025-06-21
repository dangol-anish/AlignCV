import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ResumeSelectionState {
  selectedResumeId: string | null;
  setSelectedResumeId: (id: string | null) => void;
  clearSelectedResumeId: () => void;
}

export const useResumeSelectionStore = create(
  persist<ResumeSelectionState>(
    (set) => ({
      selectedResumeId: null,
      setSelectedResumeId: (id) => set({ selectedResumeId: id }),
      clearSelectedResumeId: () => set({ selectedResumeId: null }),
    }),
    {
      name: "resume-selection-store",
    }
  )
) as unknown as import("zustand").UseBoundStore<
  import("zustand").StoreApi<ResumeSelectionState>
>;
