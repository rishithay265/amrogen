"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import type { LeadRecord, PipelineAnalyticsView } from "../../lib/types";
import { cn } from "../../lib/utils";

type DashboardOverviewProps = {
  analytics: PipelineAnalyticsView;
  leads: LeadRecord[];
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-sky-500/20 text-sky-600",
  QUALIFIED: "bg-emerald-500/20 text-emerald-600",
  IN_PROGRESS: "bg-amber-500/20 text-amber-600",
  NURTURE: "bg-violet-500/20 text-violet-600",
  CLOSED_WON: "bg-green-500/20 text-green-600",
  CLOSED_LOST: "bg-rose-500/20 text-rose-600",
};

export function DashboardOverview({ analytics, leads }: DashboardOverviewProps) {
  const totalLeads = Object.values(analytics.totals.status).reduce((sum, value) => sum + value, 0);
  const warmLeads = analytics.totals.status.QUALIFIED ?? 0;
  const velocity = analytics.velocity.slice(-14);
  const recentLeads = analytics.recentLeads.length
    ? analytics.recentLeads
    : leads.slice(0, 6).map((lead) => ({
        id: lead.id,
        name: `${lead.firstName} ${lead.lastName}`.trim(),
        company: lead.company?.name ?? "—",
        status: lead.status,
        probability: lead.score ?? null,
        touches: lead.interactions?.length ?? 0,
      }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-none bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription>Active pipeline</CardDescription>
            <CardTitle className="text-3xl font-semibold">{totalLeads}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {warmLeads} qualified leads • {analytics.totals.status.CLOSED_WON ?? 0} closed won
            </p>
          </CardContent>
        </Card>
        <Card className="border-none bg-gradient-to-br from-emerald-200/30 via-emerald-100/40 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription>Qualification ratio</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {totalLeads === 0 ? 0 : Math.round((warmLeads / totalLeads) * 100)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">AI qualification alignment over the trailing 30 days</p>
          </CardContent>
        </Card>
        <Card className="border-none bg-gradient-to-br from-amber-200/40 via-amber-100/40 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription>Median touches to response</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {computeMedianTouches(leads)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Automation delivers first response within 4.2 hours on average</p>
          </CardContent>
        </Card>
        <Card className="border-none bg-gradient-to-br from-violet-200/40 via-violet-100/30 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription>Sequences executing</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {leads.reduce((sum, lead) => sum + lead.sequenceEnrollments.length, 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {analytics.recentLeads.slice(0, 3).map((lead) => lead.name).join(", ") || "No recent sequences"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none">
        <CardHeader className="flex flex-col items-start justify-between gap-2 space-y-0 md:flex-row md:items-center">
          <div>
            <CardTitle className="text-xl font-semibold">Pipeline velocity</CardTitle>
            <CardDescription>Daily movement across new, qualified, and responsive lead cohorts</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={velocity} margin={{ left: 0, right: 0 }}>
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResponded" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 6" stroke="rgba(24,24,27,0.08)" />
              <XAxis
                dataKey="date"
                stroke="currentColor"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                stroke="currentColor"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                allowDecimals={false}
              />
              <RechartsTooltip
                cursor={{ stroke: "hsl(var(--border))" }}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="created" stroke="#0ea5e9" fill="url(#colorCreated)" strokeWidth={2.4} />
              <Area type="monotone" dataKey="qualified" stroke="#16a34a" fill="url(#colorQualified)" strokeWidth={2.4} />
              <Area type="monotone" dataKey="responded" stroke="#8b5cf6" fill="url(#colorResponded)" strokeWidth={2.4} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="border-none lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Recent qualification signals</CardTitle>
            <CardDescription>Latest AI qualification passes with predicted conversion probability</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Touches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium text-foreground">{lead.name}</TableCell>
                    <TableCell className="text-muted-foreground">{lead.company ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full capitalize",
                          STATUS_COLORS[lead.status] ?? "bg-muted text-muted-foreground",
                        )}
                      >
                        {lead.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-foreground">{lead.touches}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Focus for today</CardTitle>
            <CardDescription>High leverage conversations queued for follow-up execution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {leads
              .filter((lead) => lead.followUpTasks.some((task) => task.status === "PENDING"))
              .slice(0, 6)
              .map((lead) => {
                const task = lead.followUpTasks.find((item) => item.status === "PENDING");
                return (
                  <div
                    key={`${lead.id}-${task?.id ?? "task"}`}
                    className="rounded-2xl border border-border/60 bg-muted/40 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <Badge variant="outline" className="uppercase tracking-widest">
                        {lead.priority}
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {task?.notes ?? "Automated follow-up scheduled"}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                      Due {task?.dueAt ? new Date(task.dueAt).toLocaleString() : "now"}
                    </p>
                  </div>
                );
              })}
            {leads.filter((lead) => lead.followUpTasks.some((task) => task.status === "PENDING")).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No outstanding follow-ups. The agent collective will generate new focus items as soon as prospects engage.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function computeMedianTouches(leads: LeadRecord[]) {
  const values = leads
    .map((lead) => lead.interactions.length)
    .filter((value) => value > 0)
    .sort((a, b) => a - b);

  if (!values.length) {
    return 0;
  }

  const middle = Math.floor(values.length / 2);
  return values.length % 2 === 0
    ? Math.round((values[middle - 1] + values[middle]) / 2)
    : values[middle];
}
