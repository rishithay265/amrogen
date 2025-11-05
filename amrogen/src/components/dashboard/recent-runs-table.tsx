"use client";

import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { AgentRun, Lead, LeadStage } from "@/server/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentRunsProps {
  runs?: Array<AgentRun & { lead: Lead | null }>;
  loading?: boolean;
  stageFilter?: LeadStage | "all";
}

const statusVariants: Record<
  AgentRun["status"],
  { label: string; badge: "outline" | "default" | "secondary" | "destructive" }
> = {
  created: { label: "Queued", badge: "outline" },
  running: { label: "Running", badge: "default" },
  completed: { label: "Completed", badge: "secondary" },
  errored: { label: "Error", badge: "destructive" },
};

export function RecentRunsTable({ runs, loading, stageFilter = "all" }: RecentRunsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Autonomous Runs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const filtered = runs?.filter((run) =>
    stageFilter === "all" ? true : run.lead?.stage === stageFilter
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Autonomous Runs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Latest Claude + Gemini orchestrations.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.slice(0, 6).map((run) => {
              const lead = run.lead;
              const status = statusVariants[run.status];
              return (
                <TableRow key={run.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{lead?.fullName ?? "Unassigned"}</span>
                      <span className="text-xs text-muted-foreground">
                        {lead?.company ?? "Imported"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {lead?.stage ?? "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead?.priorityScore ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={status.badge}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(run.updatedAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered && filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  No runs match the current filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

