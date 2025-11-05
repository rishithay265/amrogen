"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Rocket } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { leadInputSchema, type LeadInputPayload } from "@/lib/validators/lead";
import type { Lead } from "@/server/types";

interface OrchestrationPanelProps {
  leads?: Lead[];
  running?: boolean;
  onRun: (payload: LeadInputPayload) => Promise<void>;
  onReplay: (leadId: string) => Promise<void>;
}

export function OrchestrationPanel({ leads, running, onRun, onReplay }: OrchestrationPanelProps) {
  const form = useForm<LeadInputPayload>({
    resolver: zodResolver(leadInputSchema),
    defaultValues: {
      fullName: "Avery Cole",
      email: "avery.cole@hypergrowthlabs.io",
      company: "HyperGrowth Labs",
      companyDomain: "https://hypergrowthlabs.io",
      jobTitle: "VP Sales",
      industry: "SaaS",
      employeeCount: 220,
      annualRevenue: 12500000,
      linkedInUrl: "https://www.linkedin.com/in/averycole",
      source: "Inbound - G2",
      timezone: "America/New_York",
      pains: [
        "Manual lead research consumes SDR capacity",
        "Pipeline coverage below 60%",
      ],
      intentTopics: ["sales automation", "ai agents", "outbound orchestration"],
    },
  });

  const sortedLeads = useMemo(
    () => (leads ?? []).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [leads]
  );

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: LeadInputPayload = {
      ...values,
      employeeCount: values.employeeCount ? Number(values.employeeCount) : undefined,
      annualRevenue: values.annualRevenue ? Number(values.annualRevenue) : undefined,
      pains: normalizeList(values.pains),
      intentTopics: normalizeList(values.intentTopics),
      companyDomain: values.companyDomain ? values.companyDomain.trim() : undefined,
    } as LeadInputPayload;

    await onRun(payload);
    toast.success("Orchestration started", {
      description: "AmroGen is qualifying the lead and composing outreach.",
    });
  });

  return (
    <Card className="border border-border/70 bg-gradient-to-b from-background to-background/80 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Rocket className="size-4 text-primary" />
          Launch Orchestration
        </CardTitle>
        <CardDescription>
          Spin up Claude + Gemini agents to enrich, qualify, and sequence a prospect instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">New lead</TabsTrigger>
            <TabsTrigger value="existing">Replay existing</TabsTrigger>
          </TabsList>
          <TabsContent value="new" className="mt-6">
            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="Patricia Summers" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="patricia@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Company Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyDomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Persona</FormLabel>
                        <FormControl>
                          <Input placeholder="VP of Revenue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input placeholder="SaaS" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="employeeCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employees</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} placeholder="200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="annualRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual revenue</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step={100000} placeholder="15000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkedInUrl"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>LinkedIn URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <FormControl>
                          <Input placeholder="America/New_York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source</FormLabel>
                        <FormControl>
                          <Input placeholder="Inbound - Webinar" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="pains"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary pain points</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="One pain point per line"
                          {...field}
                          value={Array.isArray(field.value) ? field.value.join("\n") : ""}
                          onChange={(event) => field.onChange(event.target.value.split("\n"))}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intentTopics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intent topics</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Keywords that signal buying intent"
                          {...field}
                          value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                          onChange={(event) => field.onChange(event.target.value.split(","))}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={running} className="gap-2">
                    {running ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
                    Deploy agents
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="existing" className="mt-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pick a qualified record to re-enrich, re-score, and relaunch orchestration with fresh context.
              </p>
              <div className="space-y-2">
                {sortedLeads.slice(0, 6).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-lg border border-border/70 bg-background/60 px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{lead.fullName}</span>
                      <span className="text-xs text-muted-foreground">
                        {lead.company} · {lead.stage}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={running}
                      onClick={async () => {
                        await onReplay(lead.id);
                        toast.message("Replaying orchestration", {
                          description: `${lead.fullName} is being re-qualified in real time.`,
                        });
                      }}
                    >
                      {running ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      Replay
                    </Button>
                  </div>
                ))}
                {sortedLeads.length === 0 && (
                  <p className="text-sm text-muted-foreground">Import leads to enable replay flows.</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function normalizeList(value?: string[] | string): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

