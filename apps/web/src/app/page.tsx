import { RevenueConsole } from "../components/dashboard/revenue-console";
import { WorkspaceOnboarding } from "../components/dashboard/workspace-onboarding";
import { serializeLead, serializePipelineAnalytics, serializeWorkspace } from "../lib/mappers";
import { getPipelineAnalytics } from "../server/analytics";
import { getLeads } from "../server/leads";
import { getWorkspaces } from "../server/workspaces";

export default async function Home() {
  const [workspaces, leads, analytics] = await Promise.all([
    getWorkspaces(),
    getLeads(),
    getPipelineAnalytics(),
  ]);

  if (workspaces.length === 0) {
    return <WorkspaceOnboarding />;
  }

  const workspace = serializeWorkspace(workspaces[0]);
  const leadRecords = leads.map(serializeLead);
  const analyticsView = serializePipelineAnalytics(analytics);

  return (
    <RevenueConsole workspace={workspace} initialLeads={leadRecords} analytics={analyticsView} />
  );
}
