import { apiClient } from "@/lib/api-client";

export interface UserStats {
  measurements: {
    total: number;
    last7Days: number;
    ai: { total: number; last7Days: number };
    manual: { total: number; last7Days: number };
  };
  averageVolume: {
    left: number;
    right: number;
  };
}

export const userService = {
  // GET /api/user/stats - statystyki użytkownika
  getUserStats: async () => {
    return apiClient.get<UserStats>("/api/user/stats");
  },
};
