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

export const billsService = {
  getAll: async (): Promise<BillsResponse> => {
    return apiClient.get<BillsResponse>("/bills");
  },

  getById: async (billId: string): Promise<any> => {
    return apiClient.get(`/bills/${billId}`);
  },

  getSummaries: async (billId: string): Promise<any> => {
    return apiClient.get(`/bills/${billId}/summaries`);
  },

  getActions: async (billId: string): Promise<any> => {
    return apiClient.get(`/bills/${billId}/actions`);
  },

  getAmendments: async (billId: string): Promise<any> => {
    return apiClient.get(`/bills/${billId}/amendments`);
  },

  getAmendmentDetails: async (
    amendmentType: string,
    amendmentNumber: string,
  ): Promise<any> => {
    return apiClient.get(`/amendments/${amendmentType}/${amendmentNumber}`);
  },
};
