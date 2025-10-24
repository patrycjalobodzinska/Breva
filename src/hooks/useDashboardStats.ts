import { useState, useEffect } from "react";
import { DashboardStats as DashboardStatsType } from "@/types";
import { toast } from "sonner";

interface UseDashboardStatsReturn {
  stats: DashboardStatsType | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDashboardStats = (): UseDashboardStatsReturn => {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const response = await fetch("/api/dashboard/stats");

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const errorMessage = "Nie udało się pobrać statystyk";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      const errorMessage = "Wystąpił błąd podczas pobierania statystyk";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const refetch = async () => {
    await fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    isRefreshing,
    error,
    refetch,
  };
};
