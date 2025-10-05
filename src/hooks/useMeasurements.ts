import { useState, useEffect } from "react";
import { Measurement } from "@/types";
import { toast } from "sonner";

export const useMeasurements = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchMeasurements = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/measurements?page=${page}&pageSize=10`
      );
      if (response.ok) {
        const data = await response.json();
        setMeasurements(data.measurements);
        setPagination(data.pagination);
        setCurrentPage(page);
      } else {
        toast.error("Nie udało się pobrać pomiarów");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas pobierania pomiarów");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMeasurement = async (id: string) => {
    if (
      !confirm(
        "Czy na pewno chcesz usunąć ten pomiar? Ta operacja jest nieodwracalna."
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/measurements/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMeasurements(measurements.filter((m) => m.id !== id));
        toast.success("Pomiar został usunięty");
      } else {
        const error = await response.json();
        toast.error(error.error || "Wystąpił błąd podczas usuwania pomiaru");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas usuwania pomiaru");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (page: number) => {
    fetchMeasurements(page);
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  return {
    measurements,
    isLoading,
    deletingId,
    pagination,
    currentPage,
    fetchMeasurements,
    deleteMeasurement,
    handlePageChange,
  };
};
