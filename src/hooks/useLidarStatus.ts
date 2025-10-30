import { useQuery } from "@tanstack/react-query";
import { lidarService } from "@/services/lidar.service";

// Hook do sprawdzania statusu przetwarzania LiDAR
export function useLidarStatus(
  measurementId: string | undefined,
  side: "left" | "right",
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["lidar-status", measurementId, side],
    queryFn: async () => {
      if (!measurementId) throw new Error("Brak ID pomiaru");
      const response = await lidarService.getStatus(measurementId, side);
      if (!response.success || !response.data) {
        return null; // Zwróć null jeśli nie ma danych (404 jest OK)
      }
      return response.data;
    },
    enabled: !!measurementId && enabled,
    refetchInterval: (data) => {
      // Automatyczne odświeżanie co 5s jeśli status PENDING
      if (data?.status === "PENDING") return 5000;
      return false;
    },
  });
}
