import type { LeadCreateInput } from "../validation";
import type { LeadRecord } from "../types";

const headers = {
  "Content-Type": "application/json",
};

export async function fetchLead(leadId: string): Promise<LeadRecord> {
  const response = await fetch(`/api/leads/${leadId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Unable to load lead ${leadId}`);
  }

  const data = (await response.json()) as { lead: LeadRecord };
  return data.lead;
}

export async function listLeads(): Promise<LeadRecord[]> {
  const response = await fetch(`/api/leads`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load leads");
  }

  const data = (await response.json()) as { leads: LeadRecord[] };
  return data.leads;
}

export async function createLead(payload: LeadCreateInput) {
  const response = await fetch(`/api/leads`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error ?? "Failed to queue lead");
  }
}

export async function updateLead(leadId: string, payload: Partial<LeadRecord>) {
  const response = await fetch(`/api/leads/${leadId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error ?? "Failed to update lead");
  }

  const data = (await response.json()) as { lead: LeadRecord };
  return data.lead;
}

export async function createFollowUp(
  leadId: string,
  payload: {
    workspaceId: string;
    notes: string;
    dueAt?: string;
    metadata?: Record<string, unknown>;
  },
) {
  const response = await fetch(`/api/leads/${leadId}/followups`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error ?? "Failed to schedule follow-up");
  }

  return (await response.json()) as { task: { id: string; status: string; type: string; dueAt: string | null; notes?: string | null } };
}
