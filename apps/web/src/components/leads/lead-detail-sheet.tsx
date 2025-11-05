"use client";

import { useMemo, useState } from "react";

import { CheckCircle2, Clock3, MailOpen, PhoneCall, Send, Sparkles } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { updateLead as updateLeadRequest } from "../../lib/api/leads";
import type { LeadRecord } from "../../lib/types";
import { useLeadStore } from "../../store/lead-store";

const STATUSES = [
  "NEW",
  "QUALIFIED",
  "IN_PROGRESS",
  "NURTURE",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const;

const PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;

type LeadDetailSheetProps = {
  onComposeEmail: (lead: LeadRecord) => void;
  onScheduleFollowUp: (lead: LeadRecord, notes?: string) => void;
};

export function LeadDetailSheet({ onComposeEmail, onScheduleFollowUp }: LeadDetailSheetProps) {
  const { selectedLeadId, selectLead, leads, updateLead } = useLeadStore((state) => ({
    selectedLeadId: state.selectedLeadId,
    selectLead: state.selectLead,
    leads: state.leads,
    updateLead: state.updateLead,
  }));

  const lead = useMemo(() => leads.find((item) => item.id === selectedLeadId), [leads, selectedLeadId]);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState("");

  const handleUpdate = async (payload: Partial<LeadRecord>) => {
    if (!lead) return;
    setIsSaving(true);
    try {
      const updated = await updateLeadRequest(lead.id, payload);
      updateLead(lead.id, updated);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={Boolean(lead)} onOpenChange={(open) => (!open ? selectLead(null) : undefined)}>
      <SheetContent side="right" className="flex w-full max-w-3xl flex-col overflow-hidden px-0">
        {lead ? (
          <>
            <SheetHeader className="px-8">
              <SheetTitle className="flex items-center gap-2 text-2xl">
                {lead.firstName} {lead.lastName}
                <Badge variant="outline" className="rounded-full uppercase tracking-widest">
                  {lead.priority}
                </Badge>
              </SheetTitle>
              <SheetDescription className="flex flex-wrap items-center gap-3 text-sm">
                <span>{lead.email}</span>
                {lead.phone ? <span>{lead.phone}</span> : null}
              </SheetDescription>
            </SheetHeader>

            <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden px-8 py-6 lg:grid-cols-[1.4fr_1fr]">
              <ScrollArea className="h-full rounded-3xl border border-border/60 bg-card shadow-inner">
                <div className="space-y-6 p-6">
                  <section className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">Status</Label>
                      <div className="flex flex-wrap gap-2">
                        {STATUSES.map((status) => (
                          <Button
                            key={status}
                            variant={lead.status === status ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => handleUpdate({ status })}
                            disabled={isSaving}
                          >
                            {status.replace("_", " ")}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">Priority</Label>
                      <div className="flex gap-2">
                        {PRIORITIES.map((priority) => (
                          <Button
                            key={priority}
                            variant={lead.priority === priority ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => handleUpdate({ priority })}
                            disabled={isSaving}
                          >
                            {priority}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">Owner</Label>
                      <Input
                        value={lead.ownerName ?? ""}
                        placeholder="Assign owner"
                        onChange={(event) => handleUpdate({ ownerName: event.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">Notes to agents</Label>
                      <Textarea
                        placeholder="Capture conversation context or handoff instructions"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                      />
                      <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setNotes("")}>
                          Reset
                        </Button>
                        <Button type="button" onClick={() => onScheduleFollowUp(lead, notes)}>
                          <Sparkles className="mr-2 h-4 w-4" /> Schedule follow-up
                        </Button>
                      </div>
                    </div>
                  </section>

                  <Tabs defaultValue="timeline" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="timeline">Activity</TabsTrigger>
                      <TabsTrigger value="qualification">Qualification</TabsTrigger>
                      <TabsTrigger value="sequence">Sequence</TabsTrigger>
                    </TabsList>

                    <TabsContent value="timeline" className="space-y-4">
                      {lead.interactions.length === 0 ? (
                        <Card className="border-none bg-muted/40">
                          <CardContent className="py-8 text-center text-sm text-muted-foreground">
                            No interactions yet. Automations will populate this timeline as touches are delivered.
                          </CardContent>
                        </Card>
                      ) : null}

                      {lead.interactions.slice(0, 20).map((interaction) => (
                        <Card key={interaction.id} className="border-none bg-muted/40">
                          <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                              <MailOpen className="h-4 w-4" /> {interaction.subject ?? "Outbound touch"}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-1 text-xs text-muted-foreground">
                            <p>
                              {interaction.channel.toLowerCase()} • {interaction.direction.toLowerCase()} • {new Date(
                                interaction.sentAt,
                              ).toLocaleString()}
                            </p>
                            {interaction.contentPreview ? <p>{interaction.contentPreview}</p> : null}
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="qualification" className="space-y-4">
                      {lead.qualificationSnapshots.length === 0 ? (
                        <Card className="border-none bg-muted/40">
                          <CardContent className="py-8 text-center text-sm text-muted-foreground">
                            Qualification insights will appear after the Gemini MEDDIC agent completes the initial pass.
                          </CardContent>
                        </Card>
                      ) : null}

                      {lead.qualificationSnapshots.map((snapshot) => (
                        <Card key={snapshot.id} className="border-none bg-muted/40">
                          <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {snapshot.methodology} assessment
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {new Date(snapshot.capturedAt).toLocaleString()} • {snapshot.probability ?? 0}% confidence
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm text-muted-foreground">
                            {snapshot.summary ? <p className="text-foreground">{snapshot.summary}</p> : null}
                            {snapshot.painPoints?.length ? (
                              <div>
                                <p className="text-xs uppercase tracking-widest text-muted-foreground">Pain signals</p>
                                <ul className="mt-1 list-disc space-y-1 pl-4">
                                  {snapshot.painPoints.map((pain, index) => (
                                    <li key={`${snapshot.id}-pain-${index}`}>{pain}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="sequence" className="space-y-4">
                      {lead.sequenceEnrollments.length === 0 ? (
                        <Card className="border-none bg-muted/40">
                          <CardContent className="py-8 text-center text-sm text-muted-foreground">
                            This lead has not been enrolled into any outreach sequences yet.
                          </CardContent>
                        </Card>
                      ) : null}

                      {lead.sequenceEnrollments.map((enrollment) => (
                        <Card key={enrollment.id} className="border-none bg-muted/40">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-foreground">
                              {enrollment.sequence.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {enrollment.status.toLowerCase()} • {new Date(enrollment.startedAt ?? lead.createdAt).toLocaleString()}
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm text-muted-foreground">
                            {enrollment.events.map((event) => (
                              <div key={event.id} className="flex items-center gap-2 text-xs uppercase tracking-widest">
                                <Clock3 className="h-3.5 w-3.5" /> {event.eventType} at {new Date(event.occurredAt).toLocaleString()}
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>

              <ScrollArea className="h-full rounded-3xl border border-border/60 bg-card shadow-inner">
                <div className="space-y-6 p-6">
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Company</p>
                        <p className="text-lg font-semibold text-foreground">{lead.company?.name ?? "Unknown"}</p>
                      </div>
                      <Button variant="outline" size="icon" onClick={() => onComposeEmail(lead)}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lead.company?.industry ?? "Industry unavailable"} • {lead.company?.employeeCount ?? "?"} employees
                    </p>
                  </section>

                  <section className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Follow-up commitments</p>
                    {lead.followUpTasks.length === 0 ? (
                      <Card className="border-none bg-muted/40">
                        <CardContent className="py-6 text-center text-sm text-muted-foreground">
                          No follow-up tasks scheduled.
                        </CardContent>
                      </Card>
                    ) : (
                      lead.followUpTasks.map((task) => (
                        <Card key={task.id} className="border-none bg-muted/40">
                          <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                              {task.status === "COMPLETED" ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <PhoneCall className="h-4 w-4 text-primary" />
                              )}
                              {task.type.toLowerCase()}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              Due {task.dueAt ? new Date(task.dueAt).toLocaleString() : "as soon as possible"}
                            </p>
                          </CardHeader>
                          {task.notes ? (
                            <CardContent className="text-sm text-muted-foreground">{task.notes}</CardContent>
                          ) : null}
                        </Card>
                      ))
                    )}
                  </section>

                  <section className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Agent actions</p>
                    <div className="grid gap-2">
                      <Button variant="secondary" onClick={() => onComposeEmail(lead)}>
                        <Send className="mr-2 h-4 w-4" /> Generate outreach email
                      </Button>
                      <Button variant="ghost" onClick={() => onScheduleFollowUp(lead)}>
                        <Sparkles className="mr-2 h-4 w-4" /> Task follow-up cadence
                      </Button>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </div>

            <SheetFooter className="border-t border-border/60 bg-muted/40 px-8 py-4">
              <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
                <span>
                  Created {new Date(lead.createdAt).toLocaleString()} • Updated {new Date(lead.updatedAt).toLocaleString()}
                </span>
                <Button variant="ghost" onClick={() => selectLead(null)}>
                  Close
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
