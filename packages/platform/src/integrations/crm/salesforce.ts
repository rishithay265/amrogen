import { Connection } from "jsforce";

import { env } from "../../env";

type SalesforceLeadInput = {
  firstName: string;
  lastName: string;
  company: string;
  title?: string;
  phone?: string;
  email: string;
  status?: string;
  leadSource?: string;
  description?: string;
};

const hasSalesforceCredentials =
  Boolean(env.SALESFORCE_CLIENT_ID) &&
  Boolean(env.SALESFORCE_CLIENT_SECRET) &&
  Boolean(env.SALESFORCE_USERNAME) &&
  Boolean(env.SALESFORCE_PASSWORD) &&
  Boolean(env.SALESFORCE_SECURITY_TOKEN);

class SalesforceClient {
  private readonly connection: Connection | null;
  private readonly authPromise: Promise<void> | null;

  constructor() {
    if (!hasSalesforceCredentials) {
      this.connection = null;
      this.authPromise = null;
      return;
    }

    const loginUrl = process.env.SALESFORCE_LOGIN_URL ?? "https://login.salesforce.com";

    this.connection = new Connection({
      loginUrl,
      version: "62.0",
      oauth2: {
        clientId: env.SALESFORCE_CLIENT_ID!,
        clientSecret: env.SALESFORCE_CLIENT_SECRET!,
      },
    });

    const password = `${env.SALESFORCE_PASSWORD!}${env.SALESFORCE_SECURITY_TOKEN ?? ""}`;

    this.authPromise = this.connection.login(env.SALESFORCE_USERNAME!, password).then(() => undefined);
  }

  private ensureConfigured() {
    if (!this.connection || !this.authPromise) {
      throw new Error("Salesforce credentials are not configured");
    }
  }

  private async ensureAuthenticated() {
    this.ensureConfigured();
    await this.authPromise;
  }

  async findLeadByEmail(email: string) {
    await this.ensureAuthenticated();
    const result = await this.connection!.sobject("Lead").findOne<{ Id: string }>(
      { Email: email },
      { Id: 1 },
    );
    return result ?? null;
  }

  async upsertLead(input: SalesforceLeadInput) {
    await this.ensureAuthenticated();

    return this.connection!.sobject("Lead").upsert(
      {
        FirstName: input.firstName,
        LastName: input.lastName,
        Company: input.company,
        Title: input.title,
        Phone: input.phone,
        Email: input.email,
        Status: input.status,
        LeadSource: input.leadSource,
        Description: input.description,
      },
      "Email",
    );
  }

  async logActivity(params: { leadId: string; subject: string; description?: string; status?: string }) {
    await this.ensureAuthenticated();

    return this.connection!.sobject("Task").create({
      WhatId: params.leadId,
      Subject: params.subject,
      Description: params.description,
      Status: params.status ?? "Completed",
    });
  }
}

export const salesforceClient = new SalesforceClient();
