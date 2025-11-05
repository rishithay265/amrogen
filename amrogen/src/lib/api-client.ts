import { leadInputSchema, type LeadInputPayload } from "@/lib/validators/lead";
import type { DashboardPayload } from "@/server/services/analytics";
import type { AgentRun, Lead } from "@/server/types";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data.error ?? message;
    } catch {
      // ignore json parse errors
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export type OrchestrationResponse = {
  lead: Lead;
  run: AgentRun;
};

export type RunsResponse = {
  runs: Array<AgentRun & { lead: Lead | null }>;
};

export type LeadsResponse = {
  leads: Lead[];
};

export const AmroGenApi = {
  async getDashboard(): Promise<DashboardPayload> {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    return handleResponse(response);
  },

  async getOrchestrations(): Promise<RunsResponse> {
    const response = await fetch("/api/orchestrations", { cache: "no-store" });
    return handleResponse(response);
  },

  async getLeads(): Promise<LeadsResponse> {
    const response = await fetch("/api/leads", { cache: "no-store" });
    return handleResponse(response);
  },

  async orchestrate(payload: LeadInputPayload | { leadId: string }): Promise<OrchestrationResponse> {
    const body = "leadId" in payload ? payload : { lead: leadInputSchema.parse(payload) };
    const response = await fetch("/api/orchestrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },
};

