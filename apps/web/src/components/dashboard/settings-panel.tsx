"use client";

import { ShieldCheck, Zap } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { WorkspaceSummary } from "../../lib/types";

type SettingsPanelProps = {
  workspace: WorkspaceSummary;
};

export function SettingsPanel({ workspace }: SettingsPanelProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-none bg-gradient-to-br from-background via-background/95 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <ShieldCheck className="h-4 w-4" /> Workspace profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Slug</span>
            <Badge variant="outline" className="rounded-full uppercase tracking-widest">
              {workspace.slug}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Timezone</span>
            <span className="font-medium text-foreground">{workspace.timezone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Created</span>
            <span className="font-medium text-foreground">{new Date(workspace.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Zap className="h-4 w-4" /> Connected systems
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {workspace.integrations.length === 0 ? (
            <div className="rounded-2xl bg-muted/40 px-3 py-4 text-sm text-muted-foreground">
              No integrations configured. Connect CRM, enrichment, email, and communications providers to unlock full
              automation coverage.
            </div>
          ) : null}

            {workspace.integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between rounded-2xl bg-muted/40 px-3 py-3 text-sm text-muted-foreground"
              >
                <div>
                  <p className="font-semibold text-foreground">{integration.provider}</p>
                  <p className="text-xs uppercase tracking-widest">
                    {integration.connected ? "connected" : "needs auth"} •
                    {integration.metadata?.lastSync ? ` ${String(integration.metadata.lastSync)}` : " awaiting sync"}
                  </p>
                </div>
                <Badge variant={integration.connected ? "success" : "warning"} className="rounded-full">
                  {integration.connected ? "active" : "action required"}
                </Badge>
              </div>
            ))}

          <Button className="w-full" variant="secondary">
            Add integration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
