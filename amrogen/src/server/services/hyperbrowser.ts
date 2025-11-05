import { Hyperbrowser } from "@hyperbrowser/sdk";
import { nanoid } from "nanoid";
import { env } from "@/server/env";
import type { HyperbrowserTrace, Lead } from "@/server/types";

export class HyperbrowserService {
  private client: InstanceType<typeof Hyperbrowser>;

  constructor() {
    if (!env.hyperbrowserKey) {
      throw new Error("HYPERBROWSER_API_KEY is not configured");
    }
    this.client = new Hyperbrowser({
      apiKey: env.hyperbrowserKey,
      baseUrl: env.hyperbrowserBaseUrl,
    });
  }

  async researchLead(lead: Lead): Promise<HyperbrowserTrace> {
    const task = await this.client.agents.browserUse.startAndWait({
      task: `Research ${lead.company} (${lead.companyDomain ?? ""}) and uncover the most recent sales triggers, executive hiring moves, tech stack signals, and buying committee members relevant to ${lead.jobTitle ?? "the prospect"}. Return a concise narrative.`,
      sessionOptions: {
        acceptCookies: true,
        useStealth: true,
      },
      maxSteps: 12,
      maxFailures: 3,
      keepBrowserOpen: false,
    });

    type StepMetadata = {
      step_start_time?: number;
      step_end_time?: number;
      step_number?: number;
      input_tokens?: number;
    };
    type StepResult = { extracted_content?: string | null };
    type StepOutput = { thinking?: string | null };
    type StepState = { url?: string };
    type BrowserStep = {
      metadata?: StepMetadata | null;
      result?: StepResult[] | null;
      model_output?: StepOutput | null;
      state?: StepState | null;
    };

    const steps = task.data?.steps ?? [];
    const actions = steps.map((step, index) => {
      const browserStep = step as BrowserStep;
      const stepMeta = browserStep.metadata ?? {};
      const startTime = typeof stepMeta.step_start_time === "number" ? stepMeta.step_start_time : Date.now();
      const endTime = typeof stepMeta.step_end_time === "number" ? stepMeta.step_end_time : startTime;
      const results = browserStep.result ?? [];

      const metadata: Record<string, unknown> = {};
      if (stepMeta.input_tokens || stepMeta.step_number) {
        metadata.tokens = {
          input: stepMeta.input_tokens ?? null,
          stepNumber: stepMeta.step_number ?? index + 1,
        };
      }

      const extracted = results.find((entry) => entry?.extracted_content)?.extracted_content;
      const thinking = browserStep.model_output?.thinking ?? undefined;

      return {
        taskId: `${task.jobId}-${index + 1}`,
        status: task.status === "failed" ? "failed" : "completed",
        summary: extracted ?? thinking ?? "Action executed",
        createdAt: new Date(startTime).toISOString(),
        completedAt: new Date(endTime).toISOString(),
        outputUrl: browserStep.state?.url ?? undefined,
        metadata,
      };
    });

    const finalResult = task.data?.finalResult ?? "";
    if (finalResult) {
      actions.push({
        taskId: `${task.jobId}-summary`,
        status: task.status === "failed" ? "failed" : "completed",
        summary: finalResult,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      });
    }

    return {
      sessionId: task.liveUrl ?? undefined,
      actions: actions.length
        ? actions
        : [
            {
              taskId: `${task.jobId}-${nanoid(6)}`,
              status: task.status === "failed" ? "failed" : "completed",
              summary: finalResult || "Browser-use agent completed without detailed traces.",
              createdAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
            },
          ],
    };
  }

  static validateEnvironment() {
    if (!env.hyperbrowserKey) {
      throw new Error("HYPERBROWSER_API_KEY is not configured");
    }
  }
}

