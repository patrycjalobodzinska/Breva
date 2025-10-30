import { useQuery } from "@tanstack/react-query";

interface AdminStats {
  users: {
    total: number;
    last7Days: number;
  };
  measurements: {
    total: number;
    last7Days: number;
    withAI: number;
    withManual: number;
  };
  dailyStats: {
    date: string;
    count: number;
  }[];
  period: {
    startDate: string;
    endDate: string;
  };
}

export const useAdminStats = () => {
  return useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch admin stats");
      }
      return response.json();
    },
    refetchInterval: 30000, // Odświeżaj co 30 sekund
  });
};
