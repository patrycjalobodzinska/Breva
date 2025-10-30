import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { measurementsService } from "@/services/measurements.service";
import { toast } from "sonner";

// Hook do pobierania listy pomiarów z paginacją
export function useGetMeasurements(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ["measurements", page, pageSize],
    queryFn: async () => {
      const response = await measurementsService.getMeasurements(
        page,
        pageSize
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || "Nie udało się pobrać pomiarów");
      }
      return response.data;
    },
    enabled: true,
  });
}

// Hook do pobierania pojedynczego pomiaru
export function useGetMeasurement(id: string | undefined) {
  return useQuery({
    queryKey: ["measurement", id],
    queryFn: async () => {
      if (!id) throw new Error("Brak ID pomiaru");
      const response = await measurementsService.getMeasurement(id);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Nie udało się pobrać pomiaru");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

// Hook do tworzenia pomiaru
export function useCreateMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; note?: string }) => {
      const response = await measurementsService.createMeasurement(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Nie udało się utworzyć pomiaru");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      toast.success("Pomiar został utworzony");
    },
  });
}

// Hook do aktualizacji pomiaru
export function useUpdateMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; note?: string };
    }) => {
      const response = await measurementsService.updateMeasurement(id, data);
      if (!response.success || !response.data) {
        throw new Error(
          response.error || "Nie udało się zaktualizować pomiaru"
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      queryClient.invalidateQueries({
        queryKey: ["measurement", variables.id],
      });
      toast.success("Pomiar został zaktualizowany");
    },
  });
}

// Hook do usuwania pomiaru
export function useDeleteMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await measurementsService.deleteMeasurement(id);
      if (!response.success) {
        throw new Error(response.error || "Nie udało się usunąć pomiaru");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      toast.success("Pomiar został usunięty");
    },
  });
}

// Hook do dodawania pomiaru ręcznego
export function useAddManualMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { leftVolumeMl: number; rightVolumeMl: number; note?: string };
    }) => {
      const response = await measurementsService.addManualMeasurement(id, data);
      if (!response.success || !response.data) {
        throw new Error(
          response.error || "Nie udało się dodać pomiaru ręcznego"
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      queryClient.invalidateQueries({
        queryKey: ["measurement", variables.id],
      });
      toast.success("Pomiar ręczny został dodany");
    },
  });
}
