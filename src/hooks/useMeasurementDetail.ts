import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import {
  Measurement,
  EditManualFormData,
  ManualMeasurementFormData,
} from "@/types";
import { toast } from "sonner";

export const useMeasurementDetail = (measurementId: string) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingManual, setIsEditingManual] = useState(false);
  const [isAddingManual, setIsAddingManual] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    note: "",
  });
  console.log(measurementId);
  const [editManualForm, setEditManualForm] = useState<EditManualFormData>({
    leftVolumeMl: "",
    rightVolumeMl: "",
  });

  const [manualForm, setManualForm] = useState<ManualMeasurementFormData>({
    leftVolumeMl: "",
    rightVolumeMl: "",
    name: "",
    note: "",
  });

  const fetchMeasurement = useCallback(async (isInitialLoad = false) => {
    if (!measurementId) return;

    // Tylko przy pierwszym ładowaniu ustawiamy isLoading
    // Przy odświeżaniu (polling) używamy isRefreshing
    if (isInitialLoad) {
      setIsLoading(true);
      // Resetuj measurement przy pierwszym ładowaniu aby uniknąć pokazywania starych danych
      setMeasurement(null);
    } else {
      setIsRefreshing(true);
    }

    try {
      // Dodaj cache busting timestamp aby zawsze pobrać świeże dane
      const timestamp = isInitialLoad ? `?t=${Date.now()}` : '';
      const fetchPromise = fetch(`/api/measurements/${measurementId}${timestamp}`, {
        cache: 'no-store', // Zawsze pobierz świeże dane
      });
      const response = isInitialLoad
        ? await Promise.all([fetchPromise, new Promise(resolve => setTimeout(resolve, 300))]).then(([r]) => r)
        : await fetchPromise;

      if (response.ok) {
        const data = await response.json();
        setMeasurement(data);
        console.log("✅ [MEASUREMENT DETAIL] Pobrano dane pomiaru:", data.id);
      } else {
        if (isInitialLoad) {
          toast.error("Nie udało się pobrać pomiaru");
        }
      }
    } catch (error) {
      console.error("❌ [MEASUREMENT DETAIL] Błąd pobierania:", error);
      if (isInitialLoad) {
        toast.error("Wystąpił błąd podczas pobierania pomiaru");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [measurementId]);

  const handleEdit = () => {
    if (measurement) {
      setEditForm({
        name: measurement?.name,
        note: measurement?.note || "",
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!measurement) return;

    try {
      const response = await fetch(`/api/measurements/${measurement?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success("Pomiar został zaktualizowany");
        setIsEditing(false);
        fetchMeasurement();
      } else {
        const error = await response.json();
        toast.error(
          error.error || "Wystąpił błąd podczas aktualizacji pomiaru"
        );
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas aktualizacji pomiaru");
    }
  };

  const handleEditManual = () => {
    if (measurement?.manualAnalysis) {
      setEditManualForm({
        leftVolumeMl:
          measurement?.manualAnalysis?.leftVolumeMl?.toString() || "",
        rightVolumeMl:
          measurement?.manualAnalysis?.rightVolumeMl?.toString() || "",
      });
      setIsEditingManual(true);
    }
  };

  const handleSaveEditManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!measurement?.manualAnalysis) return;

    try {
      const response = await fetch(
        `/api/measurements/${measurementId}/manual`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leftVolumeMl: parseFloat(editManualForm.leftVolumeMl),
            rightVolumeMl: parseFloat(editManualForm.rightVolumeMl),
          }),
        }
      );

      if (response.ok) {
        toast.success("Pomiar ręczny został zaktualizowany");
        setIsEditingManual(false);
        fetchMeasurement();
      } else {
        const error = await response.json();
        toast.error(
          error.error || "Wystąpił błąd podczas aktualizacji pomiaru ręcznego"
        );
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas aktualizacji pomiaru ręcznego");
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/measurements/${measurementId}/manual`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leftVolumeMl: parseFloat(manualForm.leftVolumeMl),
            rightVolumeMl: parseFloat(manualForm.rightVolumeMl),
            name:
              manualForm.name ||
              `Pomiar ręczny ${new Date().toLocaleDateString()}`,
            note: manualForm.note,
          }),
        }
      );

      if (response.ok) {
        toast.success("Pomiar ręczny został dodany");
        setManualForm({
          leftVolumeMl: "",
          rightVolumeMl: "",
          name: "",
          note: "",
        });
        setIsAddingManual(false);
        fetchMeasurement();
      } else {
        const error = await response.json();
        toast.error(error.error || "Wystąpił błąd podczas dodawania pomiaru");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas dodawania pomiaru");
    }
  };

  const handleDelete = async () => {
    if (!measurement || !measurement.id) {
      toast.error("Brak danych pomiaru do usunięcia");
      return;
    }

    if (
      !confirm(
        "Czy na pewno chcesz usunąć ten pomiar? Ta operacja jest nieodwracalna."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/measurements/${measurement.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Pomiar został usunięty");
        const isAdmin = session?.user?.role === "ADMIN";
        router.push(isAdmin ? "/admin/pomiary" : "/panel/pomiary");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Nie udało się usunąć pomiaru");
      }
    } catch (error) {
      console.error("Error deleting measurement:", error);
      toast.error("Wystąpił błąd podczas usuwania pomiaru");
    }
  };

  useEffect(() => {
    if (measurementId) {
      // Zawsze pobierz świeże dane przy pierwszym mountowaniu
      // Resetuj measurement aby uniknąć pokazywania starych danych
      setMeasurement(null);
      fetchMeasurement(true); // Pierwsze ładowanie
    } else {
      // Resetuj gdy nie ma measurementId
      setMeasurement(null);
      setIsLoading(false);
    }
  }, [measurementId]); // Usuń fetchMeasurement z dependencies aby uniknąć nieskończonych loopów

  const handleManualFormChange = (data: any) => {
    setManualForm(data);
  };

  return {
    measurement,
    isLoading,
    isRefreshing,
    isEditing,
    isEditingManual,
    isAddingManual,
    editForm,
    editManualForm,
    manualForm,
    setEditForm,
    setEditManualForm,
    setManualForm: handleManualFormChange,
    setIsEditing,
    setIsEditingManual,
    setIsAddingManual,
    handleEdit,
    handleSaveEdit,
    handleEditManual,
    handleSaveEditManual,
    handleAddManual,
    handleDelete,
    fetchMeasurement,
  };
};
