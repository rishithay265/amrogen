"use client";

import { useMemo } from "react";

import { Brain, Flame, Target } from "lucide-react";

import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { LeadRecord } from "../../lib/types";

type IntelligenceViewProps = {
  leads: LeadRecord[];
};

export function IntelligenceView({ leads }: IntelligenceViewProps) {
  const insights = useMemo(() => deriveInsights(leads), [leads]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border-none bg-gradient-to-br from-background via-background/95 to-primary/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Brain className="h-4 w-4" /> Qualification consensus
          </CardTitle>
          <Badge variant="secondary" className="rounded-full">
            {insights.qualifiedRate}% qualified
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{insights.summary}</p>
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-amber-100/30 via-background to-transparent">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Flame className="h-4 w-4 text-amber-500" /> Dominant pain themes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {insights.topPainPoints.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Pain insights will surface after the next round of enrichment and discovery.
            </p>
          ) : (
            insights.topPainPoints.map((pain) => (
              <div key={pain.label} className="flex items-center justify-between rounded-2xl bg-muted/40 px-3 py-2">
                <span className="text-sm font-medium text-foreground">{pain.label}</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{pain.count} mentions</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-emerald-100/30 via-background to-transparent">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Target className="h-4 w-4 text-emerald-500" /> Next best actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {insights.nextActions.map((action) => (
            <div key={action} className="rounded-2xl bg-muted/40 px-3 py-2 text-foreground">
              {action}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function deriveInsights(leads: LeadRecord[]) {
  const qualified = leads.filter((lead) => lead.status === "QUALIFIED");
  const qualifiedRate = leads.length === 0 ? 0 : Math.round((qualified.length / leads.length) * 100);

  const painCounts = new Map<string, number>();
  for (const lead of leads) {
    for (const snapshot of lead.qualificationSnapshots) {
      snapshot.painPoints?.forEach((pain) => {
        painCounts.set(pain, (painCounts.get(pain) ?? 0) + 1);
      });
    }
  }

  const topPainPoints = Array.from(painCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, count]) => ({ label, count }));

  const summary = qualified.length
    ? `AI agents recommend advancing ${qualified.length} leads. Median conversion probability is ${Math.round(
        qualified.reduce((sum, lead) => sum + (lead.qualificationSnapshots[0]?.probability ?? 0), 0) /
          qualified.length,
      )}%`
    : "Qualification cycles are still running. Results will appear shortly.";

  const nextActions = [
    "Sync newly qualified leads to CRM destinations",
    "Trigger enrichment refresh for high-value accounts",
    "Launch persona-specific follow-up sequences",
  ];

  return {
    summary,
    qualifiedRate,
    topPainPoints,
    nextActions,
  };
}
