"use client";

import { useMemo } from "react";

import { CalendarClock, MailCheck, Rocket } from "lucide-react";

import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import type { LeadRecord } from "../../lib/types";

type OutreachBoardProps = {
  leads: LeadRecord[];
};

export function OutreachBoard({ leads }: OutreachBoardProps) {
  const sequences = useMemo(() => {
    return leads
      .flatMap((lead) =>
        lead.sequenceEnrollments.map((enrollment) => ({
          lead,
          enrollment,
        })),
      )
      .sort((a, b) => (b.enrollment.startedAt ?? "").localeCompare(a.enrollment.startedAt ?? ""));
  }, [leads]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {sequences.length === 0 ? (
        <Card className="border-none bg-muted/40">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No active outreach sequences. Enroll a lead to orchestrate a multi-channel cadence.
          </CardContent>
        </Card>
      ) : null}

      {sequences.map(({ lead, enrollment }) => {
        const progress = computeSequenceProgress(enrollment.events.length);
        const upcoming = enrollment.events[0];

        return (
          <Card key={`${lead.id}-${enrollment.id}`} className="border-none bg-gradient-to-br from-background/90 via-background to-primary/5">
            <CardHeader className="flex flex-col gap-2 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {lead.firstName} {lead.lastName}
                </CardTitle>
                <Badge variant="outline" className="rounded-full uppercase tracking-widest">
                  {enrollment.status.toLowerCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {enrollment.sequence.name} • {lead.company?.name ?? "Unknown company"}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Progress value={progress} className="h-2 flex-1" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{progress}%</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <CalendarClock className="h-4 w-4" />
                <span>
                  {upcoming
                    ? `Last event ${new Date(upcoming.occurredAt).toLocaleString()}`
                    : "Awaiting first step"}
                </span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="rounded-full">
                  <Rocket className="mr-1 h-3.5 w-3.5" /> {enrollment.sequence.status.toLowerCase()}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  <MailCheck className="mr-1 h-3.5 w-3.5" /> {enrollment.events.length} events
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function computeSequenceProgress(eventCount: number) {
  const total = Math.max(4, eventCount + 1);
  return Math.min(100, Math.round((eventCount / total) * 100));
}
