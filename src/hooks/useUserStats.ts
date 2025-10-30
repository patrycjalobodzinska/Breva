import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";

// Hook do pobierania statystyk użytkownika
export function useUserStats() {
  return useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const response = await userService.getUserStats();
      if (!response.success || !response.data) {
        throw new Error(
          response.error || "Nie udało się pobrać statystyk użytkownika"
        );
      }
      return response.data;
    },
  });
}
