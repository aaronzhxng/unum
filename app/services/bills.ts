import { apiClient } from "./api";

interface Bill {
  congress: number;
  number: string;
  title: string;
  type: string;
  latestAction: {
    actionDate: string;
    text: string;
  };
  updateDate: string;
}

interface BillsResponse {
  bills: Bill[];
  pagination: {
    count: number;
  };
}

const congressParam = (congress?: number) =>
  congress ? `?congress=${congress}` : "";

export const billsService = {
  getAll: async (): Promise<BillsResponse> => {
    return apiClient.get<BillsResponse>("/bills");
  },

  getById: async (billId: string, congress?: number): Promise<any> => {
    return apiClient.get(`/bills/${billId}${congressParam(congress)}`);
  },

  getSummaries: async (billId: string, congress?: number): Promise<any> => {
    return apiClient.get(
      `/bills/${billId}/summaries${congressParam(congress)}`,
    );
  },

  getActions: async (billId: string, congress?: number): Promise<any> => {
    return apiClient.get(`/bills/${billId}/actions${congressParam(congress)}`);
  },

  getAmendments: async (billId: string, congress?: number): Promise<any> => {
    return apiClient.get(
      `/bills/${billId}/amendments${congressParam(congress)}`,
    );
  },

  getAmendmentDetails: async (
    amendmentType: string,
    amendmentNumber: string,
    congress?: number,
  ): Promise<any> => {
    return apiClient.get(
      `/amendments/${amendmentType}/${amendmentNumber}${congressParam(congress)}`,
    );
  },

  getVotes: async (billId: string, congress?: number): Promise<any> => {
    return apiClient.get(`/bills/${billId}/votes${congressParam(congress)}`);
  },

  getCosponsors: async (billId: string, congress?: number): Promise<any> => {
    return apiClient.get(
      `/bills/${billId}/cosponsors${congressParam(congress)}`,
    );
  },
  search: async (query: string): Promise<any> => {
    return apiClient.get(`/bills/search?q=${encodeURIComponent(query)}`);
  },
};
