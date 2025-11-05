"use client";

import { Clock, Sparkle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityLogEntry } from "@/server/types";

interface ActivityTimelineProps {
  entries?: ActivityLogEntry[];
  loading?: boolean;
}

export function ActivityTimeline({ entries, loading }: ActivityTimelineProps) {
  if (loading) {
    return (
      <Card className="h-[360px]">
        <CardHeader>
          <CardTitle>Live Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[360px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkle className="size-4 text-primary" />
          Live Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ScrollArea className="h-full">
          <ul className="space-y-4">
            {entries?.map((entry) => (
              <li key={entry.id} className="relative pl-6 text-sm">
                <span className="absolute left-0 top-1 flex h-4 w-4 items-center justify-center rounded-full border border-primary/40 bg-gradient-to-br from-primary/80 to-primary/40 shadow-sm">
                  <Clock className="size-2 text-primary-foreground" />
                </span>
                <p className="font-medium text-foreground">{entry.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })} · {entry.actor}
                </p>
              </li>
            ))}
            {entries && entries.length === 0 ? (
              <li className="text-sm text-muted-foreground">No recent activity yet.</li>
            ) : null}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

