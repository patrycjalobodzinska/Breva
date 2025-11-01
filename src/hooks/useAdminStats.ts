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
      // Minimalne opóźnienie dla lepszego UX (zapobiega "miganiu" loadera)
      const [response] = await Promise.all([
        fetch("/api/admin/stats"),
        new Promise(resolve => setTimeout(resolve, 300))
      ]);

      if (!response.ok) {
        throw new Error("Failed to fetch admin stats");
      }
      return response.json();
    },
    refetchInterval: 30000, // Odświeżaj co 30 sekund
  });
};
