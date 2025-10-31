import { apiClient, PaginatedResponse } from "@/lib/api-client";
import { Measurement } from "@/types";

export const measurementsService = {
  // GET /api/measurements - lista pomiarów z paginacją
  getMeasurements: async (
    page: number = 1,
    pageSize: number = 10,
    search?: string
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    return apiClient.get<PaginatedResponse<Measurement>>(
      `/api/measurements?${params.toString()}`
    );
  },

  // GET /api/measurements/:id - pojedynczy pomiar
  getMeasurement: async (id: string) => {
    return apiClient.get<Measurement>(`/api/measurements/${id}`);
  },

  // POST /api/measurements/create - utworzenie pustego pomiaru
  createMeasurement: async (data: { name: string; note?: string }) => {
    return apiClient.post<Measurement>("/api/measurements/create", data);
  },

  // PUT /api/measurements/:id - aktualizacja pomiaru
  updateMeasurement: async (
    id: string,
    data: { name?: string; note?: string }
  ) => {
    return apiClient.put<Measurement>(`/api/measurements/${id}`, data);
  },

  // DELETE /api/measurements/:id - usunięcie pomiaru
  deleteMeasurement: async (id: string) => {
    return apiClient.delete(`/api/measurements/${id}`);
  },

  // POST /api/measurements/:id/manual - dodanie pomiaru ręcznego
  addManualMeasurement: async (
    id: string,
    data: { leftVolumeMl: number; rightVolumeMl: number; note?: string }
  ) => {
    return apiClient.post<Measurement>(`/api/measurements/${id}/manual`, data);
  },

  // POST /api/measurements/:id/analyze/:side - analiza konkretnej strony
  analyzeSide: async (
    id: string,
    side: "left" | "right",
    data: { volumeMl?: number; confidence?: number }
  ) => {
    return apiClient.post<Measurement>(
      `/api/measurements/${id}/analyze/${side}`,
      data
    );
  },
};
