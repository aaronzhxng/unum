import { withoutNicknames } from "../utils/names";

// Production, unless EXPO_PUBLIC_API_URL points at a test backend, e.g.
// EXPO_PUBLIC_API_URL=http://192.168.1.20:4555 npx expo start
export const BACKEND_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://unum-production.up.railway.app";
const API_BASE_URL = `${BACKEND_URL}/api`;

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Names come without nicknames, wherever in the response they are
    return withoutNicknames(await response.json());
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
