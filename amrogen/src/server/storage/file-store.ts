import { promises as fs } from "fs";
import path from "path";
import pLimit from "p-limit";
import { nanoid } from "nanoid";
import { env } from "@/server/env";
import type {
  ActivityLogEntry,
  AgentRun,
  AmroGenState,
  Lead,
  LeadInput,
} from "@/server/types";

const writeLock = pLimit(1);

const DEFAULT_STATE: AmroGenState = {
  leads: [],
  agentRuns: [],
  activityLog: [],
  version: 1,
  lastUpdated: new Date().toISOString(),
};

async function ensureFilePresence(filePath: string) {
  try {
    await fs.access(filePath);
  } catch {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(DEFAULT_STATE, null, 2), "utf8");
  }
}

async function readState(): Promise<AmroGenState> {
  const targetPath = env.dataPath;
  await ensureFilePresence(targetPath);
  const raw = await fs.readFile(targetPath, "utf8");
  return JSON.parse(raw) as AmroGenState;
}

async function writeState(next: AmroGenState) {
  await writeLock(async () => {
    next.lastUpdated = new Date().toISOString();
    await fs.writeFile(env.dataPath, JSON.stringify(next, null, 2), "utf8");
  });
}

export class FileStore {
  async getState() {
    return readState();
  }

  async listLeads(): Promise<Lead[]> {
    const state = await readState();
    return state.leads.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getLeadById(id: string) {
    const state = await readState();
    return state.leads.find((lead) => lead.id === id) ?? null;
  }

  async upsertLead(payload: LeadInput & { id?: string }): Promise<Lead> {
    const state = await readState();
    const now = new Date().toISOString();
    let lead: Lead;

    if (payload.id) {
      const existingIndex = state.leads.findIndex((item) => item.id === payload.id);
      if (existingIndex === -1) {
        throw new Error(`Lead ${payload.id} not found`);
      }
      const prev = state.leads[existingIndex];
      lead = {
        ...prev,
        ...payload,
        pains: payload.pains ?? prev.pains,
        intentTopics: payload.intentTopics ?? prev.intentTopics,
        updatedAt: now,
      };
      state.leads[existingIndex] = lead;
    } else {
      lead = {
        id: nanoid(12),
        fullName: payload.fullName,
        email: payload.email,
        company: payload.company,
        companyDomain: payload.companyDomain,
        jobTitle: payload.jobTitle,
        industry: payload.industry,
        employeeCount: payload.employeeCount,
        annualRevenue: payload.annualRevenue,
        linkedInUrl: payload.linkedInUrl,
        source: payload.source,
        timezone: payload.timezone,
        stage: "new",
        temperature: "cold",
        priorityScore: 0,
        intentTopics: payload.intentTopics ?? [],
        pains: payload.pains ?? [],
        createdAt: now,
        updatedAt: now,
      };
      state.leads.push(lead);
    }

    await writeState(state);
    await this.logActivity({
      actor: "system",
      message: payload.id ? `Updated lead ${lead.fullName}` : `Created lead ${lead.fullName}`,
      context: { leadId: lead.id },
    });
    return lead;
  }

  async deleteLead(id: string) {
    const state = await readState();
    const initialLength = state.leads.length;
    state.leads = state.leads.filter((lead) => lead.id !== id);
    state.agentRuns = state.agentRuns.filter((run) => run.leadId !== id);
    if (state.leads.length === initialLength) {
      throw new Error(`Lead ${id} not found`);
    }
    await writeState(state);
    await this.logActivity({
      actor: "system",
      message: `Removed lead ${id}`,
      context: { leadId: id },
    });
  }

  async listAgentRuns(): Promise<AgentRun[]> {
    const state = await readState();
    return state.agentRuns.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async updateLead(
    id: string,
    updates: Partial<Omit<Lead, "id" | "createdAt">>,
    activityMessage?: string,
    actor = "system"
  ): Promise<Lead> {
    const state = await readState();
    const index = state.leads.findIndex((lead) => lead.id === id);
    if (index === -1) {
      throw new Error(`Lead ${id} not found`);
    }

    const now = new Date().toISOString();
    const merged: Lead = {
      ...state.leads[index],
      ...updates,
      updatedAt: now,
    };
    state.leads[index] = merged;
    await writeState(state);
    if (activityMessage) {
      await this.logActivity({
        actor,
        message: activityMessage,
        context: { leadId: id },
      });
    }
    return merged;
  }

  async getAgentRun(id: string) {
    const state = await readState();
    return state.agentRuns.find((run) => run.id === id) ?? null;
  }

  async saveAgentRun(run: AgentRun) {
    const state = await readState();
    const idx = state.agentRuns.findIndex((item) => item.id === run.id);
    if (idx >= 0) {
      state.agentRuns[idx] = run;
    } else {
      state.agentRuns.push(run);
    }
    await writeState(state);
  }

  async logActivity(entry: Omit<ActivityLogEntry, "id" | "timestamp">) {
    const state = await readState();
    const logEntry: ActivityLogEntry = {
      id: nanoid(10),
      timestamp: new Date().toISOString(),
      actor: entry.actor,
      message: entry.message,
      context: entry.context,
    };
    state.activityLog.unshift(logEntry);
    state.activityLog = state.activityLog.slice(0, 200);
    await writeState(state);
  }
}

export const store = new FileStore();

