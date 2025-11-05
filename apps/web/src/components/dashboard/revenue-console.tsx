"use client";

import { useCallback, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { LeadTable } from "../leads/lead-table";
import { LeadDetailSheet } from "../leads/lead-detail-sheet";
import { AppSidebar } from "../layout/sidebar";
import { TopBar } from "../layout/topbar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { createFollowUp, createLead } from "../../lib/api/leads";
import type { LeadRecord, PipelineAnalyticsView, WorkspaceSummary } from "../../lib/types";
import { useInitializeLeads } from "../../hooks/use-initialize-leads";
import { useRealtimeEvents } from "../../hooks/use-realtime-events";
import { useLeadStore } from "../../store/lead-store";

import { DashboardOverview } from "./dashboard-overview";
import { IntelligenceView } from "./intelligence-view";
import { OutreachBoard } from "./outreach-board";
import { SettingsPanel } from "./settings-panel";

type RevenueConsoleProps = {
  workspace: WorkspaceSummary;
  initialLeads: LeadRecord[];
  analytics: PipelineAnalyticsView;
};

const LEAD_SOURCES = [
  "MANUAL",
  "IMPORT",
  "WEBSITE",
  "PARTNER",
  "EVENT",
  "INTENT_DATA",
  "ENRICHED",
  "REFERRAL",
  "OUTBOUND",
] as const;

const leadFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  title: z.string().optional(),
  company: z.string().min(1).optional(),
  domain: z.string().min(1).optional(),
  source: z.enum(LEAD_SOURCES),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const followUpSchema = z.object({
  notes: z.string().min(3),
  dueAt: z.string().optional(),
});

type FollowUpValues = z.infer<typeof followUpSchema>;

export function RevenueConsole({ workspace, initialLeads, analytics }: RevenueConsoleProps) {
  const [activeView, setActiveView] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateLead, setShowCreateLead] = useState(false);
  const [followUpLead, setFollowUpLead] = useState<LeadRecord | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useInitializeLeads(initialLeads);
  useRealtimeEvents(workspace.id);

  const leads = useLeadStore((state) => state.leads);
  const updateLeadInStore = useLeadStore((state) => state.updateLead);
  const setHighlight = useLeadStore((state) => state.setHighlight);

  const leadForm = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      title: "",
      company: "",
      domain: "",
      source: "MANUAL",
    },
  });

  const followUpForm = useForm<FollowUpValues>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      notes: "",
      dueAt: "",
    },
  });

  const handleCreateLead = leadForm.handleSubmit(async (values) => {
    setIsSyncing(true);
    try {
      await createLead({
        workspaceId: workspace.id,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        title: values.title,
        company: values.company
          ? {
              name: values.company,
              domain: values.domain,
            }
          : undefined,
        source: values.source,
      });
      setShowCreateLead(false);
      leadForm.reset();
    } finally {
      setIsSyncing(false);
    }
  });

  const handleFollowUp = followUpForm.handleSubmit(async (values) => {
    if (!followUpLead) return;
    setIsSyncing(true);
    try {
      const { task } = await createFollowUp(followUpLead.id, {
        workspaceId: workspace.id,
        notes: values.notes,
        dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : undefined,
        metadata: { source: "console" },
      });
      updateLeadInStore(followUpLead.id, {
        updatedAt: new Date().toISOString(),
        followUpTasks: [
          {
            id: task.id,
            status: task.status,
            type: task.type,
            dueAt: task.dueAt,
            completedAt: null,
            notes: task.notes ?? values.notes,
          },
          ...followUpLead.followUpTasks,
        ],
      });
      followUpForm.reset();
      setFollowUpLead(null);
      setHighlight(followUpLead.id);
    } finally {
      setIsSyncing(false);
    }
  });

  const handleComposeEmail = useCallback((lead: LeadRecord) => {
    const subject = encodeURIComponent(`Quick intro → ${lead.company?.name ?? "your team"}`);
    const body = encodeURIComponent(
      `Hi ${lead.firstName},%0D%0A%0D%0AI noticed ${lead.company?.name ?? "your organization"} recently ...`,
    );
    window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, "_blank");
  }, []);

  const handleScheduleFollowUp = useCallback((lead: LeadRecord, notes?: string) => {
    if (notes) {
      followUpForm.setValue("notes", notes);
    }
    setFollowUpLead(lead);
  }, [followUpForm]);

  const filteredAnalytics = useMemo(() => ({
    ...analytics,
    totals: analytics.totals,
  }), [analytics]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-40 -z-10 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex min-h-screen">
        <AppSidebar analytics={filteredAnalytics} workspace={workspace} activeView={activeView} onNavigate={setActiveView} />
        <div className="flex flex-1 flex-col">
          <TopBar
            workspaceName={workspace.name}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreateLead={() => setShowCreateLead(true)}
            onOpenCommandPalette={() => setActiveView("leads")}
            isSyncing={isSyncing}
          />

          <main className="flex-1 space-y-6 px-6 py-6">
            <Tabs value={activeView} onValueChange={setActiveView}>
              <TabsList className="hidden">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="leads">Leads</TabsTrigger>
                <TabsTrigger value="outreach">Outreach</TabsTrigger>
                <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <DashboardOverview analytics={analytics} leads={leads} />
              </TabsContent>

              <TabsContent value="leads" className="space-y-6">
                <LeadTable
                  searchTerm={searchTerm}
                  onCreateFollowUp={handleScheduleFollowUp}
                  onComposeEmail={handleComposeEmail}
                />
              </TabsContent>

              <TabsContent value="outreach">
                <OutreachBoard leads={leads} />
              </TabsContent>

              <TabsContent value="intelligence">
                <IntelligenceView leads={leads} />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsPanel workspace={workspace} />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <LeadDetailSheet onComposeEmail={handleComposeEmail} onScheduleFollowUp={handleScheduleFollowUp} />

      <Sheet open={showCreateLead} onOpenChange={setShowCreateLead}>
        <SheetContent side="right" className="max-w-xl">
          <SheetHeader>
            <SheetTitle>Capture inbound lead</SheetTitle>
          </SheetHeader>
          <form className="mt-6 space-y-4" onSubmit={handleCreateLead}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" {...leadForm.register("firstName")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" {...leadForm.register("lastName")} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...leadForm.register("email")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...leadForm.register("title")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" {...leadForm.register("company")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain</Label>
              <Input id="domain" placeholder="acme.com" {...leadForm.register("domain")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source">Source</Label>
              <select
                id="source"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                {...leadForm.register("source")}
              >
                {LEAD_SOURCES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={leadForm.formState.isSubmitting}>
              Queue intelligence workflow
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(followUpLead)} onOpenChange={(open) => (!open ? setFollowUpLead(null) : undefined)}>
        <SheetContent side="right" className="max-w-lg">
          <SheetHeader>
            <SheetTitle>Schedule follow-up</SheetTitle>
          </SheetHeader>
          {followUpLead ? (
            <form className="mt-6 space-y-4" onSubmit={handleFollowUp}>
              <Card className="border-none bg-muted/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-foreground">
                    {followUpLead.firstName} {followUpLead.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {followUpLead.company?.name ?? "Unknown company"}
                </CardContent>
              </Card>
              <div className="grid gap-2">
                <Label htmlFor="notes">Message context</Label>
                <Input id="notes" placeholder="Context and desired outcome" {...followUpForm.register("notes")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueAt">Due date</Label>
                <Input id="dueAt" type="datetime-local" {...followUpForm.register("dueAt")} />
              </div>
              <Button type="submit" className="w-full" disabled={followUpForm.formState.isSubmitting}>
                Confirm follow-up automation
              </Button>
            </form>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
