import axios, { AxiosInstance } from "axios";

import { env } from "../../env";

const hasToken = Boolean(env.PIPEDRIVE_API_TOKEN);

class PipedriveClient {
  private readonly http: AxiosInstance | null;

  constructor() {
    if (!hasToken) {
      this.http = null;
      return;
    }

    this.http = axios.create({
      baseURL: "https://api.pipedrive.com/v1",
      params: {
        api_token: env.PIPEDRIVE_API_TOKEN,
      },
      timeout: 10000,
    });
  }

  private ensureConfigured() {
    if (!this.http) {
      throw new Error("Pipedrive API token is not configured");
    }
  }

  async findPersonByEmail(email: string) {
    this.ensureConfigured();

    const { data } = await this.http!.get("/persons/search", {
      params: {
        term: email,
        fields: "email",
        exact_match: 1,
        limit: 1,
      },
    });

    return data?.data?.items?.[0]?.item ?? null;
  }

  async upsertPerson(input: {
    name: string;
    email: string;
    phone?: string;
    orgId?: number;
  }) {
    this.ensureConfigured();

    const existing = await this.findPersonByEmail(input.email);

    if (existing) {
      await this.http!.put(`/persons/${existing.id}`, {
        name: input.name,
        email: input.email,
        phone: input.phone,
        org_id: input.orgId,
      });
      return existing.id;
    }

    const { data } = await this.http!.post("/persons", {
      name: input.name,
      email: input.email,
      phone: input.phone,
      org_id: input.orgId,
    });

    return data?.data?.id ?? null;
  }

  async logActivity(params: {
    subject: string;
    personId: number;
    note?: string;
    type?: string;
    dueDate?: string;
  }) {
    this.ensureConfigured();

    await this.http!.post("/activities", {
      subject: params.subject,
      person_id: params.personId,
      note: params.note,
      type: params.type ?? "call",
      due_date: params.dueDate,
      done: 0,
    });
  }
}

export const pipedriveClient = new PipedriveClient();
