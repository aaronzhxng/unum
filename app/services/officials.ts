import { apiClient } from "./api";

interface Official {
  bioguideId: string;
  name: string;
  state: string;
  district?: string;
  partyName: string;
  updateDate: string;
}

interface OfficialsResponse {
  officials: Official[];
  count: number;
}

export const officialsService = {
  getAll: async (): Promise<OfficialsResponse> => {
    return apiClient.get<OfficialsResponse>("/officials");
  },
};
