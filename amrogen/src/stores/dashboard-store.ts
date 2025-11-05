import { create } from "zustand";
import type { LeadStage } from "@/server/types";

type StageFilter = LeadStage | "all";

interface DashboardState {
  stageFilter: StageFilter;
  setStageFilter: (stage: StageFilter) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stageFilter: "all",
  setStageFilter: (stage) => set({ stageFilter: stage }),
}));

