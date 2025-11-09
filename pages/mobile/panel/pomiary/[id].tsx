import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import MobilePanelLayout from "@/components/layout/MobilePanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Calendar,
  TrendingUp,
  BarChart3,
  Edit,
  Trash2,
  ArrowLeft,
  Download,
  Share,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { MeasurementChart } from "@/components/MeasurementChart";
import { AccuracyDisplay } from "@/components/AccuracyDisplay";
import {
  prepareChartData,
  getAsymmetryPercentage,
  getBadgeVariant,
} from "@/utils/measurements";
import { Measurement } from "@/types";
import { Loader } from "@/components/ui/loader";

export default function MobileMeasurementDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = router.query;
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [leftStatus, setLeftStatus] = useState<string | null>(null);
  const [rightStatus, setRightStatus] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const measurementsListPath = isAdmin
    ? "/mobile/admin/pomiary"
    : "/mobile/panel/pomiary";

  useEffect(() => {
    if (id) {
      // Invaliduj cache React Query dla tego pomiaru
      queryClient.invalidateQueries({ queryKey: ["measurement", id] });
      queryClient.invalidateQueries({ queryKey: ["measurements"] });

      // Resetuj stan przed pobraniem nowych danych
      setMeasurement(null);
      setLeftStatus(null);
      setRightStatus(null);
      setIsLoading(true);
      setIsPolling(false);

      console.log(
        "🔄 [MEASUREMENT DETAIL] Rozpoczynam pobieranie danych dla ID:",
        id
      );

      // Zawsze pobierz świeże dane przy pierwszym wejściu
      // fetchStatuses() zostanie wywołane PO zakończeniu fetchMeasurement
      fetchMeasurement(true);
    }
  }, [id, queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

  // Odśwież pomiar po powrocie do widoku (np. po zamknięciu deep linku Swift)
  useEffect(() => {
    if (!id) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("🔄 Odświeżanie pomiaru po powrocie do widoku");
        // fetchStatuses() zostanie wywołane w fetchMeasurement po pobraniu danych
        fetchMeasurement(true); // Force refresh
      }
    };

    const handleFocus = () => {
      console.log("🔄 Odświeżanie pomiaru po focus");
      // fetchStatuses() zostanie wywołane w fetchMeasurement po pobraniu danych
      fetchMeasurement(true); // Force refresh
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isPolling || !id) return;
    console.log("🔄 [POLLING] Rozpoczynam polling dla measurement:", id);
    const t = setInterval(() => {
      console.log("🔄 [POLLING] Odświeżanie statusów i pomiaru");
      fetchStatuses();
      fetchMeasurement(false); // Nie force refresh podczas pollingu
    }, 5000);
    return () => {
      console.log("🛑 [POLLING] Zatrzymuję polling");
      clearInterval(t);
    };
  }, [isPolling, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMeasurement = async (forceRefresh = false) => {
    if (!id) {
      console.warn("⚠️ [MEASUREMENT] Brak ID - pomijam fetch");
      return;
    }

    try {
      setIsLoading(true);
      console.log("📥 [MEASUREMENT] Rozpoczynam pobieranie pomiaru:", id);

      // Dodaj cache busting timestamp aby zawsze pobrać świeże dane
      const timestamp = forceRefresh ? `?t=${Date.now()}` : "";
      const response = await fetch(`/api/measurements/${id}${timestamp}`, {
        cache: "no-store", // Zawsze pobierz świeże dane
      });

      if (response.ok) {
        const data = await response.json();
        console.log(
          "✅ [MEASUREMENT] Pobrano dane pomiaru:",
          data.id,
          "Has AI Analysis:",
          !!data.aiAnalysis,
          "Has Lidar Captures:",
          data.lidarCaptures?.length || 0
        );
        // Ustaw dane SYNCHRONICZNIE aby uniknąć race condition
        setMeasurement(data);

        // Po ustawieniu measurement, sprawdź statusy LiDAR (nawet jeśli nie ma captures)
        // fetchStatuses() sprawdzi czy są captures i pobierze statusy
        console.log(
          "🔄 [MEASUREMENT] Sprawdzam statusy LiDAR po pobraniu pomiaru"
        );
        fetchStatuses();

        setIsLoading(false); // Ustaw false PO ustawieniu measurement i statusów
      } else {
        console.error("❌ [MEASUREMENT] Błąd odpowiedzi:", response.status);
        const errorText = await response.text();
        console.error("❌ [MEASUREMENT] Error body:", errorText);
        toast.error("Nie udało się pobrać pomiaru");
        // Nie przekierowuj od razu - pozwól użytkownikowi zobaczyć błąd
        setMeasurement(null);
        setIsLoading(false); // Ustaw false aby pokazać komunikat błędu
      }
    } catch (error) {
      console.error("❌ [MEASUREMENT] Błąd pobierania:", error);
      toast.error("Wystąpił błąd podczas pobierania pomiaru");
      setMeasurement(null);
      setIsLoading(false); // Ustaw false aby pokazać komunikat błędu
    } finally {
      // NIE ustawiaj isLoading na false tutaj - zrób to tylko w catch/else
      // aby uniknąć race condition gdzie isLoading jest false ale measurement jeszcze null
    }
  };

  const handleDelete = async () => {
    if (!measurement) return;

    if (!confirm("Czy na pewno chcesz usunąć ten pomiar?")) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/measurements/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Pomiar został usunięty");
        router.push(measurementsListPath);
      } else {
        toast.error("Nie udało się usunąć pomiaru");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas usuwania pomiaru");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    if (!measurement) return;

    try {
      const response = await fetch(`/api/measurements/${id}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pomiar-${measurement?.name}-${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Raport został pobrany");
      } else {
        toast.error("Nie udało się pobrać raportu");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas pobierania raportu");
    }
  };

  const handleShare = async () => {
    if (!measurement) return;

    const aiAnalysis = measurement?.aiAnalysis;
    const leftVolume = aiAnalysis?.leftVolumeMl || 0;
    const rightVolume = aiAnalysis?.rightVolumeMl || 0;

    const shareData = {
      title: `Pomiar: ${measurement?.name}`,
      text: `Pomiar piersi - Lewa: ${leftVolume.toFixed(
        1
      )}ml, Prawa: ${rightVolume.toFixed(1)}ml`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Pomiar został udostępniony");
      } else {
        // Fallback - kopiuj do schowka
        await navigator.clipboard.writeText(shareData.text);
        toast.success("Informacje o pomiarze zostały skopiowane do schowka");
      }
    } catch (error) {
      // Fallback - kopiuj do schowka
      try {
        await navigator.clipboard.writeText(shareData.text);
        toast.success("Informacje o pomiarze zostały skopiowane do schowka");
      } catch (clipboardError) {
        toast.error("Nie udało się udostępnić pomiaru");
      }
    }
  };

  const fetchStatuses = async () => {
    const mid = Array.isArray(id) ? id[0] : (id as string);
    if (!mid) {
      console.warn("⚠️ [STATUS] Brak measurementId - pomijam fetchStatuses");
      return;
    }

    console.log("📡 [STATUS] Rozpoczynam pobieranie statusów dla:", mid);

    let newLeftStatus: string | null = null;
    let newRightStatus: string | null = null;

    try {
      const l = await fetch(
        `/api/lidar-capture/status?measurementId=${encodeURIComponent(
          mid
        )}&side=left`,
        { cache: "no-store" }
      );
      if (l.ok) {
        const d = await l.json();
        newLeftStatus = d.status;
        setLeftStatus(d.status);
        console.log("✅ [STATUS] Left status:", d.status);
      } else if (l.status === 404) {
        console.log("ℹ️ [STATUS] Left - brak capture (404)");
        setLeftStatus(null);
      } else {
        console.warn("⚠️ [STATUS] Left - błąd odpowiedzi:", l.status);
      }
    } catch (error) {
      console.error("❌ [STATUS] Błąd pobierania statusu left:", error);
      setLeftStatus(null);
    }

    try {
      const r = await fetch(
        `/api/lidar-capture/status?measurementId=${encodeURIComponent(
          mid
        )}&side=right`,
        { cache: "no-store" }
      );
      if (r.ok) {
        const d = await r.json();
        newRightStatus = d.status;
        setRightStatus(d.status);
        console.log("✅ [STATUS] Right status:", d.status);
      } else if (r.status === 404) {
        console.log("ℹ️ [STATUS] Right - brak capture (404)");
        setRightStatus(null);
      } else {
        console.warn("⚠️ [STATUS] Right - błąd odpowiedzi:", r.status);
      }
    } catch (error) {
      console.error("❌ [STATUS] Błąd pobierania statusu right:", error);
      setRightStatus(null);
    }

    // Użyj nowych wartości zamiast starych state'ów
    const shouldPoll =
      newLeftStatus === "PENDING" || newRightStatus === "PENDING";
    setIsPolling(shouldPoll);

    if (shouldPoll) {
      console.log("🔄 [STATUS] Polling aktywny - statusy PENDING");
    } else {
      console.log("🛑 [STATUS] Polling zatrzymany - brak PENDING");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVolumeDifference = (left: number, right: number) => {
    const diff = Math.abs(left - right);
    const percentage = ((diff / Math.max(left, right)) * 100).toFixed(1);
    return { diff, percentage };
  };

  // Najpierw sprawdź isLoading - jeśli ładuje, pokaż loader
  if (isLoading) {
    return (
      <MobilePanelLayout>
        <div className="flex items-center justify-center h-64">
          <Loader message="Ładowanie pomiaru..." variant="spinner" />
        </div>
      </MobilePanelLayout>
    );
  }

  // Dopiero potem sprawdź czy measurement istnieje - jeśli nie ma i nie ładuje, to błąd
  if (!measurement) {
    return (
      <MobilePanelLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Pomiar nie został znaleziony
            </h3>
            <p className="text-text-muted mb-4">
              Ten pomiar może nie istnieć lub nie masz do niego dostępu
            </p>
            <Button
              onClick={() => router.push(measurementsListPath)}
              className="rounded-xl">
              Wróć do listy pomiarów
            </Button>
          </div>
        </div>
      </MobilePanelLayout>
    );
  }

  // Pobierz dane z measurement (po sprawdzeniu że istnieje)
  const hasManualMeasurement = measurement?.manualAnalysis;
  const aiAnalysis = measurement?.aiAnalysis;
  const manualAnalysis = measurement?.manualAnalysis;

  console.log("📊 [MEASUREMENT DETAIL] Renderowanie z danymi:", measurement.id);
  return (
    <MobilePanelLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć
          </Button>
          {/* <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-xl">
              <Share className="h-4 w-4 mr-2" />
              Udostępnij
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="rounded-xl">
              <Download className="h-4 w-4 mr-2" />
              Pobierz
            </Button>
          </div> */}
        </div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-text-primary">
              {measurement?.name}
            </h1>
          </div>
        </div>
        {/* AI Results + status */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Lewa pierś (AI)</span>
                </div>
                {leftStatus === "FAILED" && (
                  <Badge variant="destructive" className="text-xs">
                    Błąd
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leftStatus === "PENDING" && !aiAnalysis?.leftVolumeMl ? (
                <div className="flex items-center">
                  <Loader
                    variant="default"
                    size="sm"
                    message=""
                    className="mr-2"
                  />
                  <span>Przetwarzanie...</span>
                </div>
              ) : leftStatus === "FAILED" ? (
                <div className="text-sm text-red-600">
                  <p className="font-medium">Przetwarzanie nie powiodło się</p>
                  <p className="text-xs text-text-muted mt-1">
                    Wyślij skan ponownie
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-text-primary">
                  {aiAnalysis?.leftVolumeMl
                    ? aiAnalysis?.leftVolumeMl?.toFixed(1) + " ml"
                    : "Brak danych"}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Prawa pierś (AI)</span>
                </div>
                {rightStatus === "FAILED" && (
                  <Badge variant="destructive" className="text-xs">
                    Błąd
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rightStatus === "PENDING" && !aiAnalysis?.rightVolumeMl ? (
                <div className="flex items-center">
                  <Loader
                    variant="default"
                    size="sm"
                    message=""
                    className="mr-2"
                  />
                  <span>Przetwarzanie...</span>
                </div>
              ) : rightStatus === "FAILED" ? (
                <div className="text-sm text-red-600">
                  <p className="font-medium">Przetwarzanie nie powiodło się</p>
                  <p className="text-xs text-text-muted mt-1">
                    Wyślij skan ponownie
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-text-primary">
                  {aiAnalysis?.rightVolumeMl
                    ? aiAnalysis?.rightVolumeMl?.toFixed(1) + " ml"
                    : "Brak danych"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Manual Measurements */}
        {hasManualMeasurement && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary">
              Pomiar ręczny
            </h2>
            <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-muted text-sm">Lewa pierś (ml)</p>
                    <p className="text-xl font-semibold text-text-primary">
                      {manualAnalysis?.leftVolumeMl
                        ? manualAnalysis?.leftVolumeMl?.toFixed(1) + " ml"
                        : "Brak danych"}{" "}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-sm">Prawa pierś (ml)</p>
                    <p className="text-xl font-semibold text-text-primary">
                      {manualAnalysis?.rightVolumeMl
                        ? manualAnalysis?.rightVolumeMl?.toFixed(1) + " ml"
                        : "Brak danych"}{" "}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Chart */}
        {(() => {
          const chartData = prepareChartData(measurement);
          return (
            <MeasurementChart
              data={chartData}
              title="Porównanie AI vs Pomiary ręczne"
              description="Wykres porównujący wyniki AI z pomiarami ręcznymi"
            />
          );
        })()}
        {/* Note */}
        {measurement?.note && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary">Notatka</h2>
            <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-text-muted">{measurement?.note}</p>
              </CardContent>
            </Card>
          </div>
        )}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/mobile/panel/pomiary/${id}/edit`)}
            className="flex-1 rounded-xl">
            <Edit className="h-4 w-4 mr-2" />
            Edytuj
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 rounded-xl text-red-600 border-red-200 hover:bg-red-50">
            {isDeleting ? (
              <>
                <Loader
                  variant="default"
                  size="sm"
                  message=""
                  className="mr-2"
                />
                Usuwanie...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Usuń
              </>
            )}
          </Button>
        </div>
      </div>
    </MobilePanelLayout>
  );
}
