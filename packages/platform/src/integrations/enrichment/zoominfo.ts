import axios, { AxiosInstance } from "axios";

import { env } from "../../env";

const isConfigured = Boolean(env.ZOOMINFO_API_KEY);

class ZoomInfoClient {
  private readonly http: AxiosInstance | null;

  constructor() {
    this.http = isConfigured
      ? axios.create({
          baseURL: "https://api.zoominfo.com",
          headers: {
            Authorization: `Bearer ${env.ZOOMINFO_API_KEY!}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        })
      : null;
  }

  private ensureConfigured() {
    if (!this.http) {
      throw new Error("ZoomInfo API key is not configured");
    }
  }

  async enrichCompany(domain: string) {
    this.ensureConfigured();

    const { data } = await this.http!.post("/enrich/company", { domain });
    return data;
  }

  async searchPeopleByCompany(domain: string) {
    this.ensureConfigured();

    const { data } = await this.http!.post("/people/search", {
      companyDomains: [domain],
      pageSize: 25,
    });
    return data;
  }
}

export const zoomInfoClient = new ZoomInfoClient();
