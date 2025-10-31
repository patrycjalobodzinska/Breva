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

      const res = await fetch(`/api/measurements?${params.toString()}`);
      if (!res.ok) throw new Error("Nie udało się pobrać pomiarów");
      return res.json();
    },
  });
}
