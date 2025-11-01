import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";

// Hook do pobierania statystyk użytkownika
export function useUserStats() {
  return useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      // Minimalne opóźnienie dla lepszego UX (zapobiega "miganiu" loadera)
      const [response] = await Promise.all([
        userService.getUserStats(),
        new Promise(resolve => setTimeout(resolve, 300))
      ]);

      if (!response.success || !response.data) {
        throw new Error(
          response.error || "Nie udało się pobrać statystyk użytkownika"
        );
      }
      return response.data;
    },
  });
}
