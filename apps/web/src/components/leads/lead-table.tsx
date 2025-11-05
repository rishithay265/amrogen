"use client";

import { useMemo } from "react";

import { ArrowUpRight, CircleCheck, Mail, MessageSquare, Sparkles } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import type { LeadRecord } from "../../lib/types";
import { cn } from "../../lib/utils";
import { useLeadStore } from "../../store/lead-store";

type LeadTableProps = {
  searchTerm: string;
  onCreateFollowUp: (lead: LeadRecord) => void;
  onComposeEmail: (lead: LeadRecord) => void;
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-rose-500/15 text-rose-500",
  MEDIUM: "bg-amber-500/15 text-amber-600",
  LOW: "bg-emerald-500/15 text-emerald-600",
};

export function LeadTable({ searchTerm, onCreateFollowUp, onComposeEmail }: LeadTableProps) {
  const { leads, highlightLeadId, selectLead, selectedLeadId, setHighlight } = useLeadStore((state) => ({
    leads: state.leads,
    highlightLeadId: state.highlightLeadId,
    selectLead: state.selectLead,
    selectedLeadId: state.selectedLeadId,
    setHighlight: state.setHighlight,
  }));

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter((lead) => {
      const tokens = [
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.title ?? "",
        lead.company?.name ?? "",
        ...(lead.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return tokens.includes(term);
    });
  }, [leads, searchTerm]);

  return (
    <Card className="border-none">
      <CardHeader className="flex flex-col items-start justify-between gap-3 space-y-0 md:flex-row md:items-center">
        <div>
          <CardTitle className="text-lg font-semibold">Pipeline board</CardTitle>
          <p className="text-sm text-muted-foreground">
            Prioritized queue of human-ready conversations orchestrated by AmroGen agents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full uppercase tracking-widest">
            {filtered.length} in view
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[540px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">Lead</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Last touch</TableHead>
                <TableHead className="hidden lg:table-cell">Sequence</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => {
                const latestInteraction = lead.interactions.at(0);
                const enrollment = lead.sequenceEnrollments.at(0);
                return (
                  <TableRow
                    key={lead.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      highlightLeadId === lead.id ? "animate-pulse bg-primary/10" : undefined,
                      selectedLeadId === lead.id ? "bg-muted/50" : undefined,
                    )}
                    onMouseEnter={() => setHighlight(null)}
                    onClick={() => selectLead(lead.id)}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          {lead.firstName} {lead.lastName}
                          <Badge
                            className={cn(
                              "rounded-full uppercase tracking-widest",
                              PRIORITY_COLORS[lead.priority] ?? "bg-muted",
                            )}
                          >
                            {lead.priority}
                          </Badge>
                        </div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">{lead.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{lead.company?.name ?? "—"}</p>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">
                          {lead.company?.industry ?? "Unknown industry"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full uppercase tracking-widest">
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm text-muted-foreground">
                        {latestInteraction
                          ? `${latestInteraction.channel.toLowerCase()} • ${new Date(latestInteraction.sentAt).toLocaleString()}`
                          : "No touches"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {enrollment ? (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">{enrollment.sequence.name}</p>
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">
                            {enrollment.status.toLowerCase()}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="rounded-full">
                          <Sparkles className="mr-1 h-3 w-3" /> Ready for sequence
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            onComposeEmail(lead);
                          }}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            onCreateFollowUp(lead);
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <CircleCheck className="h-10 w-10" />
                      <p className="text-sm">No leads match the current filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
