import { useQuery } from "@tanstack/react-query";

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function usePaginatedApi<T = any>(
  endpoint: string,
  page: number = 1,
  pageSize: number = 10
) {
  const queryFn = async (): Promise<{ data: T; pagination: Pagination }> => {
    const url = `${endpoint}?page=${page}&pageSize=${pageSize}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Błąd pobierania danych z " + endpoint);
    const json = await res.json();
    return {
      data: json.measurements || json.items || [],
      pagination: json.pagination || {
        page,
        limit: pageSize,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  };
  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint, page, pageSize],
    queryFn,
    enabled: !!endpoint,
  });
  return {
    data: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
}
