import { useQuery } from "@tanstack/react-query";

export function useGetMeasurements(page: number = 1) {
  return useQuery(
    ["measurements", page],
    async () => {
      const res = await fetch(`/api/measurements?page=${page}&pageSize=10`);
      if (!res.ok) throw new Error("Nie udało się pobrać pomiarów");
      return res.json();
    },
    {
      keepPreviousData: true,
    }
  );
}
