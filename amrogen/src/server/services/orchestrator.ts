import { nanoid } from "nanoid";
import { store } from "@/server/storage/file-store";
import { GeminiService } from "@/server/services/gemini";
import { ClaudeService } from "@/server/services/claude";
import { HyperbrowserService } from "@/server/services/hyperbrowser";
import type {
  AgentRun,
  AgentStep,
  Lead,
  LeadInput,
  OutreachSequence,
  QualificationReport,
} from "@/server/types";

const ORCHESTRATOR_VERSION = "2025.11.05";

function inferTemperature(score: number): Lead["temperature"] {
  if (score >= 75) return "hot";
  if (score >= 45) return "warm";
  return "cold";
}

export class LeadOrchestrator {
  private gemini?: GeminiService;
  private claude?: ClaudeService;
  private hyperbrowser?: HyperbrowserService;

  private getGemini() {
    if (!this.gemini) {
      this.gemini = new GeminiService();
    }
    return this.gemini;
  }

  private getClaude() {
    if (!this.claude) {
      this.claude = new ClaudeService();
    }
    return this.claude;
  }

  private getHyperbrowser() {
    if (!this.hyperbrowser) {
      this.hyperbrowser = new HyperbrowserService();
    }
    return this.hyperbrowser;
  }

  async orchestrateLead(input: LeadInput, leadId?: string) {
    GeminiService.validateEnvironment();
    ClaudeService.validateEnvironment();
    HyperbrowserService.validateEnvironment();

    let lead: Lead;
    if (leadId) {
      const existing = await store.getLeadById(leadId);
      if (!existing) {
        throw new Error(`Lead ${leadId} not found`);
      }
      const updates: Partial<Lead> = {
        fullName: input.fullName,
        email: input.email,
        company: input.company,
        companyDomain: input.companyDomain ?? existing.companyDomain,
        jobTitle: input.jobTitle ?? existing.jobTitle,
        industry: input.industry ?? existing.industry,
        employeeCount: input.employeeCount ?? existing.employeeCount,
        annualRevenue: input.annualRevenue ?? existing.annualRevenue,
        linkedInUrl: input.linkedInUrl ?? existing.linkedInUrl,
        source: input.source,
        timezone: input.timezone ?? existing.timezone,
      };
      if (input.pains) updates.pains = input.pains;
      if (input.intentTopics) updates.intentTopics = input.intentTopics;

      lead = await store.updateLead(
        existing.id,
        updates,
        "Refreshed lead dossier",
        "orchestrator"
      );
    } else {
      lead = await store.upsertLead(input);
    }

    const now = new Date().toISOString();
    const run: AgentRun = {
      id: nanoid(12),
      leadId: lead.id,
      status: "created",
      createdAt: now,
      updatedAt: now,
      orchestratorVersion: ORCHESTRATOR_VERSION,
      steps: [
        this.buildStep("qualification"),
        this.buildStep("outreach"),
        this.buildStep("discovery"),
      ],
    };

    const persistRun = async () => {
      run.updatedAt = new Date().toISOString();
      await store.saveAgentRun(run);
    };

    await persistRun();

    try {
      // Qualification step
      const qualificationStep = this.startStep(run, "qualification");
      await persistRun();
      const qualification = await this.getGemini().qualifyLead(lead);
      this.finishStep(qualificationStep, {
        status: "succeeded",
        outputSummary: qualification.summary,
        metadata: { score: qualification.qualificationScore },
      });
      await persistRun();

      lead = await this.applyQualification(lead, qualification);

      // Outreach step
      const outreachStep = this.startStep(run, "outreach");
      await persistRun();
      const outreach = await this.getClaude().generateOutreach(lead, qualification);
      this.finishStep(outreachStep, {
        status: "succeeded",
        outputSummary: outreach.touches
          .map((touch) => `${touch.channel.toUpperCase()}: ${touch.objective}`)
          .join(" | "),
      });
      await persistRun();

      lead = await this.applyOutreach(lead, outreach);

      // Discovery step (Hyperbrowser)
      const discoveryStep = this.startStep(run, "discovery");
      await persistRun();
      const trace = await this.getHyperbrowser().researchLead(lead);
      this.finishStep(discoveryStep, {
        status: "succeeded",
        outputSummary: trace.actions.at(-1)?.summary ?? "Browser research complete",
        metadata: { actionCount: trace.actions.length },
      });
      run.browserTrace = trace;
      await persistRun();

      lead = await store.updateLead(
        lead.id,
        {
          stage: "nurture",
          enrichmentNotes: trace.actions
            .map((action) => `• ${action.summary}`)
            .join("\n"),
        },
        "Captured live market intelligence via Hyperbrowser"
      );

      run.status = "completed";
      await persistRun();

      await store.logActivity({
        actor: "orchestrator",
        message: `Completed autonomous run for ${lead.fullName}`,
        context: { leadId: lead.id, runId: run.id },
      });

      return { lead, run };
    } catch (error) {
      run.status = "errored";
      run.updatedAt = new Date().toISOString();
      const failingStep = run.steps.find((step) => step.status === "running");
      if (failingStep) {
        failingStep.status = "failed";
        failingStep.completedAt = new Date().toISOString();
        failingStep.error = error instanceof Error ? error.message : String(error);
      }
      await store.saveAgentRun(run);
      await store.updateLead(
        lead.id,
        { stage: "research" },
        "Orchestrator encountered an error",
        "orchestrator"
      );
      throw error;
    }
  }

  private buildStep(agent: AgentStep["agent"]): AgentStep {
    const labelMap: Record<AgentStep["agent"], string> = {
      orchestrator: "Strategy",
      discovery: "Discovery Intelligence",
      qualification: "Qualification",
      outreach: "Outreach Sequencing",
      follow_up: "Follow-up Strategy",
    };
    return {
      id: nanoid(10),
      label: labelMap[agent],
      agent,
      status: "pending",
      startedAt: new Date().toISOString(),
    };
  }

  private startStep(run: AgentRun, agent: AgentStep["agent"]) {
    const step = run.steps.find((item) => item.agent === agent);
    if (!step) {
      throw new Error(`Step ${agent} not found in run`);
    }
    step.status = "running";
    step.startedAt = new Date().toISOString();
    step.completedAt = undefined;
    step.error = undefined;
    return step;
  }

  private finishStep(
    step: AgentStep,
    updates: Partial<Pick<AgentStep, "status" | "outputSummary" | "metadata" | "completedAt" | "error">>
  ) {
    Object.assign(step, updates);
    step.completedAt = step.completedAt ?? new Date().toISOString();
  }

  private async applyQualification(lead: Lead, qualification: QualificationReport) {
    return store.updateLead(
      lead.id,
      {
        stage: "qualified",
        temperature: inferTemperature(qualification.qualificationScore),
        priorityScore: qualification.qualificationScore,
        qualificationSummary: qualification.summary,
      },
      "Lead qualified via Gemini MEDDIC",
      "qualification_agent"
    );
  }

  private async applyOutreach(lead: Lead, outreach: OutreachSequence) {
    return store.updateLead(
      lead.id,
      {
        stage: "outreach",
        outreachSummary: outreach.touches
          .map((touch, index) => `Touch ${index + 1} (${touch.channel}): ${touch.objective}`)
          .join(" | "),
      },
      "Generated personalized outreach sequence",
      "outreach_agent"
    );
  }
}

