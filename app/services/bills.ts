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
};
