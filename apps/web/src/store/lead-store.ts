"use client";

import { create } from "zustand";

import type { LeadRecord } from "../lib/types";

type LeadStore = {
  leads: LeadRecord[];
  selectedLeadId: string | null;
  highlightLeadId: string | null;
  setInitialLeads: (leads: LeadRecord[]) => void;
  upsertLead: (lead: LeadRecord) => void;
  updateLead: (leadId: string, patch: Partial<LeadRecord>) => void;
  removeLead: (leadId: string) => void;
  selectLead: (leadId: string | null) => void;
  setHighlight: (leadId: string | null) => void;
};

export const useLeadStore = create<LeadStore>((set) => ({
  leads: [],
  selectedLeadId: null,
  highlightLeadId: null,
  setInitialLeads: (leads) => set({ leads }),
  upsertLead: (lead) =>
    set((state) => {
      const index = state.leads.findIndex((item) => item.id === lead.id);
      if (index === -1) {
        return {
          leads: [lead, ...state.leads].sort((a, b) =>
            b.updatedAt.localeCompare(a.updatedAt),
          ),
          highlightLeadId: lead.id,
        };
      }

      const next = [...state.leads];
      next[index] = lead;
      return {
        leads: next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
        highlightLeadId: lead.id,
      };
    }),
  updateLead: (leadId, patch) =>
    set((state) => ({
      leads: state.leads
        .map((lead) => (lead.id === leadId ? { ...lead, ...patch } : lead))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      highlightLeadId: leadId,
    })),
  removeLead: (leadId) =>
    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== leadId),
      selectedLeadId:
        state.selectedLeadId === leadId ? null : state.selectedLeadId,
    })),
  selectLead: (leadId) => set({ selectedLeadId: leadId }),
  setHighlight: (leadId) => set({ highlightLeadId: leadId }),
}));
