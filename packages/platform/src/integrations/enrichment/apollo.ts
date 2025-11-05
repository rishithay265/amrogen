import axios, { AxiosInstance } from "axios";

import { env } from "../../env";

const isConfigured = Boolean(env.APOLLO_API_KEY);

class ApolloClient {
  private readonly http: AxiosInstance | null;

  constructor() {
    this.http = isConfigured
      ? axios.create({
          baseURL: "https://api.apollo.io/v1",
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        })
      : null;
  }

  private ensureConfigured() {
    if (!this.http) {
      throw new Error("Apollo API key is not configured");
    }
  }

  async searchPeople(term: string, page: number = 1) {
    this.ensureConfigured();

    const { data } = await this.http!.post("/mixed_people/search", {
      api_key: env.APOLLO_API_KEY,
      q_keyword: term,
      page,
    });
    return data;
  }

  async enrichCompany(domain: string) {
    this.ensureConfigured();

    const { data } = await this.http!.post("/organizations/enrich", {
      api_key: env.APOLLO_API_KEY,
      domain,
    });
    return data;
  }
}

export const apolloClient = new ApolloClient();
