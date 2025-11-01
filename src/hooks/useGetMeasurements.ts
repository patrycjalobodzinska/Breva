import { useQuery } from "@tanstack/react-query";

interface UseGetMeasurementsOptions {
  search?: string;
}

export function useGetMeasurements(
  page: number = 1,
  pageSize: number = 10,
  options?: UseGetMeasurementsOptions
) {
  return useQuery({
    queryKey: ["measurements", page, pageSize, options?.search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (options?.search) {
        params.append("search", options.search);
      }

      // Minimalne opóźnienie dla lepszego UX (zapobiega "miganiu" loadera)
      const [data] = await Promise.all([
        fetch(`/api/measurements?${params.toString()}`).then(res => {
          if (!res.ok) throw new Error("Nie udało się pobrać pomiarów");
          return res.json();
        }),
        new Promise(resolve => setTimeout(resolve, 300))
      ]);

      return data;
    },
  });
}
