"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { StageDistributionChart } from "@/components/dashboard/stage-distribution";
import { VelocityChart } from "@/components/dashboard/velocity-chart";
import { RecentRunsTable } from "@/components/dashboard/recent-runs-table";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { OrchestrationPanel } from "@/components/dashboard/orchestration-panel";
import { useDashboard, useLeads, useOrchestrateLead, useOrchestrations } from "@/hooks/use-amrogen";
import { useDashboardStore } from "@/stores/dashboard-store";
import type { LeadStage } from "@/server/types";

export function DashboardScreen() {
  const dashboard = useDashboard();
  const leads = useLeads();
  const orchestrations = useOrchestrations();
  const orchestrateMutation = useOrchestrateLead();
  const { stageFilter, setStageFilter } = useDashboardStore();
  const [isRunningReplay, startReplay] = useTransition();

  const handleNewRun = async (payload: Parameters<typeof orchestrateMutation.mutateAsync>[0]) => {
    try {
      await orchestrateMutation.mutateAsync(payload);
    } catch (error) {
      toast.error("Failed to start orchestration", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  };

  const handleReplay = (leadId: string) =>
    startReplay(async () => {
      try {
        await orchestrateMutation.mutateAsync({ leadId });
      } catch (error) {
        toast.error("Replay failed", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

  return (
    <div className="space-y-6">
      <MetricsGrid metrics={dashboard.data?.metrics} loading={dashboard.isLoading} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <StageDistributionChart
            data={dashboard.data?.stageDistribution}
            loading={dashboard.isLoading}
          />
          <VelocityChart data={dashboard.data?.velocity} loading={dashboard.isLoading} />
          <StageFilterBar
            value={stageFilter}
            onChange={setStageFilter}
            stages={dashboard.data?.stageDistribution?.map((item) => item.stage) ?? []}
          />
          <RecentRunsTable
            runs={orchestrations.data?.runs}
            loading={orchestrations.isLoading}
            stageFilter={stageFilter}
          />
        </div>
        <div className="space-y-6">
          <OrchestrationPanel
            leads={leads.data?.leads}
            running={orchestrateMutation.isPending || isRunningReplay}
            onRun={handleNewRun}
            onReplay={handleReplay}
          />
          <ActivityTimeline entries={dashboard.data?.activity} loading={dashboard.isLoading} />
        </div>
      </div>
    </div>
  );
}

interface StageFilterBarProps {
  value: LeadStage | "all";
  onChange: (value: LeadStage | "all") => void;
  stages: LeadStage[];
}

function StageFilterBar({ value, onChange, stages }: StageFilterBarProps) {
  const uniqueStages: Array<LeadStage | "all"> = [
    "all",
    ...(Array.from(new Set(stages)) as LeadStage[]),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Focus stage
      </span>
      {uniqueStages.map((stage) => (
        <StageFilterChip
          key={stage}
          stage={stage}
          active={value === stage}
          onSelect={() => onChange(stage)}
        />
      ))}
    </div>
  );
}

function StageFilterChip({
  stage,
  active,
  onSelect,
}: {
  stage: LeadStage | "all";
  active: boolean;
  onSelect: () => void;
}) {
  const label = stage === "all" ? "All" : stage.replace(/_/g, " ");
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-background text-muted-foreground hover:border-primary/40"
      }`}
    >
      {label}
    </button>
  );
}

