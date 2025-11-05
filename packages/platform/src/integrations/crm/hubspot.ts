import HubSpot from "@hubspot/api-client";

import { env } from "../../env";

const hasHubSpotToken = Boolean(env.HUBSPOT_ACCESS_TOKEN);

class HubSpotClient {
  private readonly client: HubSpot.Client | null;

  constructor() {
    this.client = hasHubSpotToken
      ? new HubSpot.Client({ accessToken: env.HUBSPOT_ACCESS_TOKEN! })
      : null;
  }

  private ensureConfigured() {
    if (!this.client) {
      throw new Error("HubSpot access token is not configured");
    }
  }

  async findContactByEmail(email: string) {
    this.ensureConfigured();

    const response = await this.client!.crm.contacts.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: email,
            },
          ],
        },
      ],
      properties: ["firstname", "lastname", "company", "lifecyclestage"],
      limit: 1,
    } as any);

    return response.results?.[0] ?? null;
  }

  async upsertContact(input: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    jobTitle?: string;
    company?: string;
    lifecycleStage?: string;
  }) {
    this.ensureConfigured();

    const existing = await this.findContactByEmail(input.email);

    const properties: Record<string, string> = {
      email: input.email,
      firstname: input.firstName,
      lastname: input.lastName,
    };

    if (input.phone) properties.phone = input.phone;
    if (input.jobTitle) properties.jobtitle = input.jobTitle;
    if (input.company) properties.company = input.company;
    if (input.lifecycleStage) properties.lifecyclestage = input.lifecycleStage;

    if (existing) {
      await this.client!.crm.contacts.basicApi.update(existing.id, { properties });
      return existing.id;
    }

    const created = await this.client!.crm.contacts.basicApi.create({ properties });
    return created.id;
  }

  async logNote(contactId: string, body: string) {
    this.ensureConfigured();

    await this.client!.crm.objects.notes.basicApi.create({
      properties: {
        hs_note_body: body,
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 202,
            },
          ],
        },
      ],
    } as any);
  }
}

export const hubspotClient = new HubSpotClient();
