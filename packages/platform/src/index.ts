export { env } from "./env";
export { default as redis } from "./redis";

export { getQueue, getQueueEvents, closeQueues } from "./jobs/queues";

export { createLeadIntakeWorker } from "./jobs/processors/lead-intake-processor";
export { createQualificationWorker } from "./jobs/processors/qualification-processor";
export { createOutreachWorker } from "./jobs/processors/outreach-dispatch-processor";
export { createFollowUpWorker } from "./jobs/processors/followup-execute-processor";
export { createAnalyticsWorker } from "./jobs/processors/analytics-refresh-processor";

export { orchestrateLead } from "./agents/claude-orchestrator";
export { qualifyLead } from "./agents/gemini-qualification";
export { composeOutreachEmail } from "./agents/outreach-writer";
export { composeFollowUpEmail } from "./agents/followup-writer";

export { hubspotClient } from "./integrations/crm/hubspot";
export { pipedriveClient } from "./integrations/crm/pipedrive";
export { clearbitClient } from "./integrations/enrichment/clearbit";
export { zoomInfoClient } from "./integrations/enrichment/zoominfo";
export { apolloClient } from "./integrations/enrichment/apollo";
export { sendTransactionalEmail } from "./integrations/sendgrid";
export { publishEvent } from "./events/publisher";
