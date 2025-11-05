"use client";

import { Fragment } from "react";

import {
  ActivitySquare,
  BarChart3,
  BrainCircuit,
  Cog,
  Layers3,
  LineChart,
  MailPlus,
} from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import type { PipelineAnalyticsView, WorkspaceSummary } from "../../lib/types";

type SidebarProps = {
  workspace: WorkspaceSummary;
  analytics: PipelineAnalyticsView;
  activeView: string;
  onNavigate: (view: string) => void;
};

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LineChart },
  { id: "leads", label: "Lead Desk", icon: Layers3 },
  { id: "outreach", label: "Outreach", icon: MailPlus },
  { id: "intelligence", label: "Intelligence", icon: BrainCircuit },
  { id: "settings", label: "Control", icon: Cog },
];

export function AppSidebar({ workspace, analytics, activeView, onNavigate }: SidebarProps) {
  const totalLeads = Object.values(analytics.totals.status).reduce((sum, count) => sum + count, 0);
  const qualified = analytics.totals.status?.QUALIFIED ?? 0;
  const conversion = totalLeads === 0 ? 0 : Math.round((qualified / totalLeads) * 100);

  return (
    <aside className="hidden w-[320px] shrink-0 border-r border-border/60 bg-sidebar/80 px-5 pb-8 pt-12 xl:flex xl:flex-col">
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-background/90 via-background to-primary/5 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Workspace</p>
            <h2 className="text-2xl font-semibold text-foreground">{workspace.name}</h2>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-widest">
            {workspace.slug}
          </Badge>
        </div>
        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">Active leads</dt>
            <dd className="text-sm font-semibold text-foreground">{totalLeads}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">Qualified ratio</dt>
            <dd className="text-sm font-semibold text-foreground">{conversion}%</dd>
          </div>
        </dl>
        <div className="mt-4">
          <Progress value={conversion} />
        </div>
        <div className="mt-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Integrations</p>
          <div className="mt-3 grid gap-2">
            {workspace.integrations.length === 0 ? (
              <p className="text-sm text-muted-foreground/80">
                No integrations connected yet. Configure CRM, enrichment, and messaging from the control panel.
              </p>
            ) : (
              workspace.integrations.map((integration) => (
                <Card key={integration.id} className="border-none bg-muted/40">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                      {integration.provider}
                    </CardTitle>
              <Badge variant={integration.connected ? "success" : "warning"} className="rounded-full">
                {integration.connected ? "active" : "pending"}
              </Badge>
                  </CardHeader>
                  {integration.metadata ? (
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground">
                        {(integration.metadata.lastSync as string | undefined) ?? "Awaiting first sync"}
                      </p>
                    </CardContent>
                  ) : null}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <Separator className="my-8 opacity-60" />

      <nav className="flex flex-col gap-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              size="lg"
              className="justify-start gap-3 rounded-2xl text-left text-sm"
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <Separator className="my-8 opacity-60" />

      <Card className="mt-auto border-none bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ActivitySquare className="h-4 w-4" /> Live Signals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {analytics.velocity.slice(-4).map((point) => (
            <Fragment key={point.date}>
              <div className="flex items-center justify-between text-xs uppercase tracking-widest">
                <span>{new Date(point.date).toLocaleDateString()}</span>
                <span className="text-foreground">{point.created} new</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-background/80 p-2 text-foreground">
                  <p className="text-[10px] uppercase tracking-widest">Qualified</p>
                  <p className="text-sm font-semibold">{point.qualified}</p>
                </div>
                <div className="rounded-xl bg-background/80 p-2 text-foreground">
                  <p className="text-[10px] uppercase tracking-widest">Responded</p>
                  <p className="text-sm font-semibold">{point.responded}</p>
                </div>
              </div>
            </Fragment>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4 border-none bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <BarChart3 className="h-4 w-4" /> Pipeline by Priority
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {Object.entries(analytics.totals.priority).map(([priority, count]) => (
            <div key={priority} className="flex items-center gap-3">
              <div className="w-12 text-xs uppercase tracking-widest text-muted-foreground">
                {priority}
              </div>
              <div className="flex-1 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{
                    width: `${totalLeads === 0 ? 0 : Math.max(8, (count / totalLeads) * 100)}%`,
                  }}
                />
              </div>
              <span className="w-8 text-right text-sm font-semibold text-foreground">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
