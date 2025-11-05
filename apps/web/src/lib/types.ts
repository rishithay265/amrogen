export interface LeadRecord {
  id: string;
  workspaceId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  title?: string | null;
  ownerName?: string | null;
  status: string;
  priority: string;
  source: string;
  score?: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
    domain?: string | null;
    industry?: string | null;
    employeeCount?: number | null;
    location?: string | null;
  } | null;
  qualificationSnapshots: Array<{
    id: string;
    methodology: string;
    summary?: string | null;
    budget?: string | null;
    authority?: string | null;
    timeline?: string | null;
    painPoints?: string[] | null;
    probability?: number | null;
    capturedAt: string;
    metadata?: Record<string, unknown> | null;
  }>;
  interactions: Array<{
    id: string;
    channel: string;
    direction: string;
    subject?: string | null;
    contentPreview?: string | null;
    sentAt: string;
    status: string;
  }>;
  followUpTasks: Array<{
    id: string;
    status: string;
    type: string;
    dueAt?: string | null;
    completedAt?: string | null;
    notes?: string | null;
  }>;
  sequenceEnrollments: Array<{
    id: string;
    status: string;
    startedAt?: string | null;
    sequence: {
      id: string;
      name: string;
      status: string;
    };
    events: Array<{
      id: string;
      eventType: string;
      occurredAt: string;
    }>;
  }>;
}

export interface PipelineAnalyticsView {
  totals: {
    status: Record<string, number>;
    priority: Record<string, number>;
  };
  velocity: Array<{
    date: string;
    created: number;
    qualified: number;
    responded: number;
  }>;
  recentLeads: Array<{
    id: string;
    name: string;
    company?: string | null;
    status: string;
    probability: number | null;
    touches: number;
  }>;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  createdAt: string;
  integrations: Array<{
    id: string;
    provider: string;
    connected: boolean;
    metadata?: Record<string, unknown> | null;
  }>;
}
