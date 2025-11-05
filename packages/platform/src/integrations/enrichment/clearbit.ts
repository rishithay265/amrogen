// @ts-expect-error clearbit lacks type definitions
import Clearbit from "clearbit";

import { env } from "../../env";

const isConfigured = Boolean(env.CLEARBIT_API_KEY);

class ClearbitClient {
  private readonly client: any;

  constructor() {
    this.client = isConfigured ? new Clearbit({ key: env.CLEARBIT_API_KEY! }) : null;
  }

  private ensureConfigured() {
    if (!this.client) {
      throw new Error("Clearbit API key is not configured");
    }
  }

  async enrichCompany(domain: string) {
    this.ensureConfigured();

    const result = await this.client.Enrichment.Company.find({ domain });
    return result;
  }

  async enrichPerson(params: { email?: string; givenName?: string; familyName?: string; company?: string }) {
    this.ensureConfigured();

    const result = await this.client.Enrichment.Person.find({
      email: params.email,
      given_name: params.givenName,
      family_name: params.familyName,
      company: params.company,
    });
    return result;
  }
}

export const clearbitClient = new ClearbitClient();
